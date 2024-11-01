const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const CertGenerate = require('./CertOperation');
const { createClientConnection, handleClientEvents } = require('./client');
const { ecsign, toBuffer, bufferToHex } = require('ethereumjs-util');
const { keccak256 } = require('js-sha3');
const { exec } = require('child_process');

const web3 = new Web3(new Web3.providers.HttpProvider("http://121.248.53.204:8545")); //主机ip

var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "./authentication.abi")).toString())
var bytecode = fs.readFileSync(path.join(__dirname, "./authentication.code")).toString()

const account = '0xab7F5238cbEfB02062241cf979e4994b656FB944'; //目前配置似乎不能是创世之外的地址
const privateKey = '0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e'; //对应私钥

//openssl工具箱需要用cmd执行（js没有原生的包好像），载体
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

//执行输入的逻辑
function getArgValue(key) {
    const index = process.argv.indexOf(key);
    if (index > -1 && process.argv.length > index + 1) {
        return process.argv[index + 1];
    }
    throw new Error(`缺少必要的参数: ${key}`);
}

const verifyAll = async (contractAddress, signedAssertion, message, label, certAddress, inputCert) => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);

        const allValid = await contract.methods.verifyAll(signedAssertion, message, label, certAddress, inputCert).call();
        console.log('验证结果是:', allValid);
        return allValid;

    } catch (err) {
        console.error('寄了:', err);
    }
};

async function generateSignature(dir, name, address) {
    try{
    const skpath = path.join(dir, `private_key`, `${name}.key`);
    const stdout = await runCommand(`openssl ec -in ${skpath} -text -noout`);

    const privateKeyMatch = stdout.match(/priv:\s*([\da-f\s:]+)/i);
    let privateKeyHex = `0x${privateKeyMatch[1].replace(/\s+/g, '').replace(/:/g, '')}`;
    const privateKeyBuffer = Buffer.from(privateKeyHex.slice(2), 'hex');
    console.log (privateKeyBuffer);
    const messageHash = Buffer.from(keccak256(address), 'hex');
    const { r, s, v } = ecsign(messageHash, privateKeyBuffer);
    const signature = Buffer.concat([r, s, Buffer.from([v])]);
    return bufferToHex(signature);
    } catch (err) {
        console.error(err);
    }
}

// const certFilePath = path.join(rootDir, 'certs', `${caName}.crt`);gnhfbg cvgcn
// const certContent = fs.readFileSync(certFilePath, 'utf8');
// console.log('证书已加载:', certContent);

(async () => {
    const action = process.argv[2];
    const PORT = 12349;
    const HOST = '121.248.53.204';
    const uePORT = 12348
    const ueHOST = '121.248.53.204'

    if (action === 'request') {
        // const label = getArgValue('-ue_label');
        // const caName = getArgValue('-ca_name');
        const ueName = getArgValue('-ue_name');

              
        const ueDir = path.join(__dirname, ueName);
        const uepasswd = '123456';
        const csrPath = path.join(ueDir, `certs`, `${ueName}.csr`);

        await CertGenerate.ueCSRgenerate(ueName, ueDir, uepasswd);
        const csrContent = fs.readFileSync(csrPath, 'utf8');

        const client = createClientConnection(PORT, HOST);
        handleClientEvents(client);

        const message = JSON.stringify({
        type: "CSR",
        ue_name: ueName,
        private_key: HEXsk,
        csr_content: csrContent
        }, null, 2);
        client.write(`${message}`);

    } else if (action === 'authenticationreq') {
        const ueName = getArgValue('-ue_name');


        const ueDir = path.join(__dirname, ueName);
        const certdetails = await CertGenerate.getCertificateDetails(ueDir, ueName);
        const signedAssertion = await generateSignature(ueDir, ueName, certdetails.ethereumAddress);
        const crtpath = path.join(ueDir, `certs`, `${ueName}.crt`);
        const crtContent = fs.readFileSync(crtpath, 'utf8');

        const message = JSON.stringify({
        type: "AuthReq",
        ue_name: ueName,
        crt_content: crtContent,
        signedAssertion: signedAssertion
        }, null, 2);

        console.log (message)

        const client = createClientConnection(uePORT, ueHOST);
        handleClientEvents(client);

        client.write(`${message}`);


    } else if (action === 'verify') {
        // const label = getArgValue('-ue_label');
        const ueName = getArgValue('-ue_name');
        const signedAssertion = getArgValue('-assertion')

        const ueDir = path.join(__dirname, ueName);
        const certdetails = await CertGenerate.getCertificateDetails(ueDir, ueName);
        // const signedAssertion = await generateSignature (ueDir, ueName, certdetails.ethereumAddress);
        // console.log (signedAssertion);

        await verifyAll(
          contractAddress,
          signedAssertion,
          certdetails.ethereumAddress,
          ueName,
          certdetails.ethereumAddress,
          certdetails.CertContent
        )

    } else if (action === 'assertion') {
        const ueName = getArgValue('-ue_name');
        const ueDir = path.join(__dirname, ueName);
        const signedAssertion = await generateSignature (ueDir, ueName, certdetails.ethereumAddress);
        console.log (signedAssertion);

    } else {
        console.error('无效指令，有效指令包括initial、register、update、revoke、verify，till 11.1')
    }
})();

module.exports = {
    verifyAll
  };
  

//解锁钱包，如果没有钱包需要先创建钱包，bash命令如下：
// .\chain33-cli seed generate -l 0
// .\chain33-cli seed save -s '生产的助记词' -p 密码（要有字母+数字，牢记，不然要干掉整个钱包）
// .\chain33-cli wallet unlock -p 密码 -t 0
//不解锁的话不能创建账户
//这里和etehrum不同，第二个字段在链33里变成了label，所以账户不能重名
// 创建账户，但是暂时看来不会进行UE的认证，链上操作全部由主节点完成，11.1去掉
// web3.eth.personal.importRawKey(HEXsk, 'ca1').then(console.log);