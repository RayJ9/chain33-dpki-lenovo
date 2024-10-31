const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Datastore = require('nedb');
const { exec } = require('child_process');
const Web3 = require('web3');
const { keccak256 } = require('js-sha3');
const ethers = require('ethers');
// const { ecsign, toBuffer, bufferToHex, ecrecover, pubToAddress, privateToPublic } = require('ethereumjs-util');

const httpProvider = new Web3.providers.HttpProvider("http://121.248.50.247:8545"); //需要修改

const web3 = new Web3(httpProvider);

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// 生产openssl的CA config文件
function generateRootConfig(ca_name, root_dir) {
  const filename = path.join(root_dir, `${ca_name}.cnf`);

// 生成文件夹
  const dirs = [
    root_dir,
    path.join(root_dir, 'certs'),
    path.join(root_dir, 'private_key'),
    path.join(root_dir, 'crl'),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const rootConfigData = `
[ ca ]
default_ca = root_CA

[ root_CA ]
dir               = ${root_dir}
new_certs_dir     = $dir/certs
certificate       = $dir/${ca_name}.crt
database          = $dir/index_${ca_name}.txt
serial            = $dir/serial
crl               = $dir/crl/${ca_name}.crl
crl_dir           = $dir/crl
crlnumber         = $dir/crl/crlnumber
private_key       = $dir/private_key/${ca_name}.key
default_crl_days  = 30
default_days      = 365
default_md        = sha256
policy            = root_policy
name_opt          = ca_default
cert_opt          = ca_default
copy_extensions   = copy

[ root_policy ]
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied

[ req ]
default_bits       = 4096
prompt             = no
default_md         = sha256
distinguished_name = set_unique

[ set_unique ]
C=CN
ST=JS
L=NJ
O=PLM
OU=1216
emailAddress = jiangrui1505@163.com
CN = localhost
CN = ${ca_name}

[ v3_ca ]
basicConstraints = critical, CA:TRUE, pathlen:10
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer

[ v3_intermediate_ca ]
basicConstraints = critical, CA:TRUE, pathlen:10
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
`;

fs.writeFileSync(filename, rootConfigData);
  console.log(`Configuration file generated: ${filename}`);
  return filename;
}


//该函数待迁移到客户端，功能大概为
function generateUEConfig(ue_name, ue_dir, ue_psw) {
  const filename = path.join(ue_dir, `${ue_name}.cnf`);

// 生成文件夹
  const dirs = [
    ue_dir,
    path.join(ue_dir, 'certs'),
    path.join(ue_dir, 'private_key'),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const rootConfigData = `
[ req ]
default_bits       = 4096
prompt             = no
default_md         = sha256
distinguished_name = alsoCN
attributes         = psw

[ alsoCN ]
C=CN
ST=JS
L=NJ
O=PLM
OU=1216
emailAddress=NON
CN = ${ue_name}

[ psw ]
challengePassword = ${ue_psw}
`;

fs.writeFileSync(filename, rootConfigData);
  console.log(`Configuration file generated: ${filename}`);
  return filename;
}

//CA证书生成
async function generateKeyAndCert(ca_name, root_dir) {
  const configFile = generateRootConfig(ca_name, root_dir);
  //注意，openssl生成的key文件包含sk和pk，所以要把sk抓出来
  const privateKeyPath = path.join(root_dir, `private_key`, `${ca_name}.key`);
  const certPath = path.join(root_dir, `certs`, `${ca_name}.crt`);

  try {
    // await runCommand(`openssl genpkey -algorithm RSA -out ${privateKeyPath} -aes256 -pass pass:mysecret -pkeyopt rsa_keygen_bits:4096`);
    await runCommand(`openssl ecparam -genkey -name secp256k1 -out ${privateKeyPath}`);
    console.log(`Private key saved to: ${privateKeyPath}`);
    const hexPrivateKeyOutput = await runCommand(`openssl ec -in ${privateKeyPath} -text -noout`);
    const privateKeyMatch = hexPrivateKeyOutput.match(/priv:\s*([\da-f\s:]+)/i);
    
    if (privateKeyMatch) {
      const privateKeyHex = privateKeyMatch[1].replace(/\s+/g, '').replace(/:/g, '');
      HEXsk = `0x${privateKeyHex}`;
      console.log('HEXsk:', HEXsk);
    } else {
      console.error('生成失败');
    }
    //解锁钱包，如果没有钱包需要先创建钱包，bash命令如下：
    // .\chain33-cli seed generate -l 0
    // .\chain33-cli seed save -s '生产的助记词' -p 密码（要有字母+数字，牢记，不然要干掉整个钱包）
    // .\chain33-cli wallet unlock -p 密码 -t 0
    //不解锁的话不能创建账户
    //这里和etehrum不同，第二个字段在链33里变成了label，所以账户不能重名
    web3.eth.personal.importRawKey(HEXsk, 'ca1').then(console.log);
    await runCommand(`openssl req -new -x509 -key ${privateKeyPath} -out ${certPath} -days 365 -config ${configFile} -passin pass:mysecret`);
    console.log(`Certificate saved to: ${certPath}`);
    } catch (err) {
        console.error('Error:', err);
      }
    }

async function UECSRgenerate(ue_name, ue_dir, ue_psw) {
  const configFile = generateUEConfig(ue_name, ue_dir, ue_psw);
  //注意，openssl生成的key文件包含sk和pk，所以要把sk抓出来
  const privateKeyPath = path.join(ue_dir, `private_key`, `${ue_name}.key`);
  const csrPath = path.join(ue_dir, `certs`, `${ue_name}.csr`);
    
    try {
      // await runCommand(`openssl genpkey -algorithm RSA -out ${privateKeyPath} -aes256 -pass pass:mysecret -pkeyopt rsa_keygen_bits:4096`);
      await runCommand(`openssl ecparam -genkey -name secp256k1 -out ${privateKeyPath}`);
      console.log(`Private key saved to: ${privateKeyPath}`);
      const hexPrivateKeyOutput = await runCommand(`openssl ec -in ${privateKeyPath} -text -noout`);
      const privateKeyMatch = hexPrivateKeyOutput.match(/priv:\s*([\da-f\s:]+)/i);
    
    if (privateKeyMatch) {
      const privateKeyHex = privateKeyMatch[1].replace(/\s+/g, '').replace(/:/g, '');
      HEXsk = `0x${privateKeyHex}`;
      console.log('HEXsk:', HEXsk);
    } else {
      console.error('生成失败');
    }
 
    web3.eth.personal.importRawKey(HEXsk, 'ue2').then(console.log);
    await runCommand(`openssl req -new -key ${privateKeyPath} -config ${configFile} -out ${csrPath}`);
    console.log(`CSR file saved to: ${csrPath}`);
    } catch (err) {
      console.error('Error:', err);
    }
 }

async function ueCertSignature(ca_name, root_dir, ue_name, ue_dir) {

  const csrPath = path.join(ue_dir, `certs`, `${ue_name}.csr`);
  const CRTpath = path.join(ue_dir, `certs`, `${ue_name}.crt`)
  const privateKeyPath = path.join(root_dir, `private_key`, `${ca_name}.key`);
  const config = path.join(root_dir, `${ca_name}.cnf`);
  const CAPath = path.join(root_dir, `certs`, `${ca_name}.crt`);

  if (!fs.existsSync(root_dir)) {
    console.log("找不到签名者");
    return;
  }

  if (!fs.existsSync(ue_dir)) {
    console.log("找不到被签名者");
    return;
  }

  if (!fs.existsSync(path.join(root_dir, `certs`, `${ca_name}.crt`))) {
    console.log("签名者好像不是有效的CA");
    return;
  }

  if (!fs.existsSync(csrPath)) {
    console.log("被签名者找不到csr文件");
    return;
  }

  if (fs.existsSync(CRTpath)) {
    console.log("已有被签过的证书!");
    return;
  }

 
// 签名开始
  try {
  await runCommand(`openssl x509 -req -in ${csrPath} -CA ${CAPath} -CAkey ${privateKeyPath} -out ${CRTpath} -days 365 -extfile ${config}`);
  console.log('creat succeed')
  } catch (err) {
  console.error('Error:', err);
  }

  if (fs.existsSync(CRTpath)) {
    console.log(`签名成功，${ue_name}被${ca_name}签名了`);
  } else {
    console.log("出错，未能找到签名的证书");
  }
}


function pkToAddress(publicKeyHex) {
  const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');
  const hash = ethers.utils.keccak256(publicKeyBuffer);
  return `0x${hash.slice(-40)}`;

}


async function getCertificateDetails(dir, name) {
  const CRTpath = path.join(dir, `certs`, `${name}.crt`);
  
  try {
      const stdout = await runCommand(`openssl x509 -in ${CRTpath} -text -noout`);
      return parseCertificate(stdout);
  } catch (error) {
      console.error("Error executing OpenSSL command:", error);
      throw error;
  }
}

function parseCertificate(opensslOutput) {
  // Regex to match the public key and validity dates
  const publicKeyMatch = /Public-Key:\s*\((\d+)\sbit\)\s*[\s\S]*?pub:\s*([\s\S]*?)\s*ASN1 OID:/m;
  const validityMatch = /Not Before:\s*(.*? GMT).*?Not After :\s*(.*? GMT)/s;

  const publicKeyResult = publicKeyMatch.exec(opensslOutput);
  const validityResult = validityMatch.exec(opensslOutput);

  if (!publicKeyResult || !validityResult) {
      throw new Error("Could not parse certificate data.");
  }

  // Extract and format the public key
  const publicKeyHex = publicKeyResult[2].replace(/[:\s]/g, ''); // Remove colons and whitespace

  // Convert public key to Ethereum address
  const ethereumAddress = pkToAddress(publicKeyHex);

  // Extract validity dates and convert to timestamps
  const notBefore = new Date(validityResult[1]).getTime() / 1000;
  const notAfter = new Date(validityResult[2]).getTime() / 1000;

  return {
      ethereumAddress,
      validity: {
          notBefore: Math.floor(notBefore),
          notAfter: Math.floor(notAfter)
      }
  };
}


const caName = 'root_CA';
const ueName = 'UE5';
const uepasswd = '123456';
const rootDir = path.join(__dirname, caName);
const ueDir = path.join(__dirname, ueName);

(async () => {
  try {
      await UECSRgenerate(ueName, ueDir, uepasswd);
      await ueCertSignature(caName, rootDir, ueName, ueDir);
      const details = await getCertificateDetails(ueDir, ueName);
      console.log('Ethereum Address:', details.ethereumAddress);
      console.log('Validity:', details.validity);
  } catch (error) {
      console.error('Error:', error);
  }
})();


//CA 一步到位
// generateKeyAndCert(caName, rootDir);

//UE暂时分两步（客户端分离）
// UECSRgenerate(ueName, ueDir, uepasswd);
// ueCertSignature(caName, rootDir, ueName, ueDir);