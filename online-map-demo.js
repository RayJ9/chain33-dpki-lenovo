const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const web3 = new Web3(new Web3.providers.HttpProvider("http://121.248.48.73:8545")); //主机ip

var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "./authentication.abi")).toString())
var bytecode = fs.readFileSync(path.join(__dirname, "./authentication.code")).toString()

const account = '0xab7F5238cbEfB02062241cf979e4994b656FB944'; //目前配置似乎不能是创世之外的地址
const privateKey = '0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e'; //对应私钥


const registerCertificate = async (contractAddress, label, certAddress, certData, notBefore, notAfter) => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);

        const gasEstimate = await contract.methods.registerCertificate(label, certAddress, certData, notBefore, notAfter)
            .estimateGas({ from: account });

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: contract.methods.registerCertificate(label, certAddress, certData, notBefore, notAfter).encodeABI(),
                gas: gasEstimate,
                from: account
            },
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('证书已存储，回执:', receipt);
        return receipt;

    } catch (err) {
        console.error('寄了:', err);
    }
};

const updateCertificate = async (contractAddress, label, certAddress, certData, notBefore, notAfter) => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);

        const gasEstimate = await contract.methods.updateCertificate(label, certAddress, certData, notBefore, notAfter)
            .estimateGas({ from: account });

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: contract.methods.updateCertificate(label, certAddress, certData, notBefore, notAfter).encodeABI(),
                gas: gasEstimate,
                from: account
            },
            privateKey
        );
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('证书已更新，回执:', receipt);
        return receipt;

    } catch (err) {
        console.error('寄了:', err);
    }
};

const revokeCertificate = async (contractAddress, label) => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);

        const gasEstimate = await contract.methods.revokeCertificate(label)
            .estimateGas({ from: account });

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: contract.methods.revokeCertificate(label).encodeABI(),
                gas: gasEstimate,
                from: account
            },
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('证书已撤销，回执:', receipt);
        return receipt;

    } catch (err) {
        console.error('寄了:', err);
    }
};

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

const deployContract = async () => {
    try {
     const contract = new web3.eth.Contract(abi);
   
     const contractdeploy = contract.deploy({
       data: bytecode,
       arguments: ["干!"],
     });
 
   const createTransaction = await web3.eth.accounts.signTransaction(
     {
       data: contractdeploy.encodeABI(),
       gas: await contractdeploy.estimateGas({from: "0xab7F5238cbEfB02062241cf979e4994b656FB944"}),
     },
     "0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e"
   );
 
    const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    console.log(createReceipt);
       } catch (err) {
   console.error(err);
 }
 }

 function pkToAddress(publicKeyHex) {
    const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex');
    const hash = crypto.createHash('keccak256').update(publicKeyBuffer.slice(1)).digest('hex');
    return `0x${hash.slice(-40)}`; // Ethereum addresses are the last 20 bytes (40 hex chars)
}


 async function getCertificateDetails() {
    try {
        const { stdout } = await execAsync('openssl x509 -in root_CA.crt -text -noout');
        return parseCertificate(stdout);
    } catch (error) {
        console.error("完了:", error);
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
    const ethereumAddress = publicKeyToEthereumAddress(publicKeyHex);

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

// const certFilePath = path.join(rootDir, 'certs', `${caName}.crt`);gnhfbg cvgcn
// const certContent = fs.readFileSync(certFilePath, 'utf8');
// console.log('证书已加载:', certContent);

const contractAddress = '0x45da9CC274E79D256f2b3bc2FbFF96c86781207A'

//local cert canshu!
const caName = 'root_CA';
const ueName = 'UE3';
const uepasswd = '123456';
const rootDir = path.join(__dirname, caName);
const ueDir = path.join(__dirname, ueName);

//online cert db canshu!
const label = 'B'
const certAddress = '0x379f8d1a0639b0186b8fc86da2087b861b1a63ef'
const certData = '0x12345678'
const notBefore = '1727500506'
const notAfter = '1769036506'

//online verification canshu!
const signedAssertion = '0x64ad852e64c2fc763c32d1545e1c01588dd7afffb1500ab56b8637414e86bdc32b235e9015c88ede064f63daae79f6b2497e610431f62d593f3ebdc708edec1e1c'
const message = '0x379f8d1a0639b0186b8fc86da2087b861b1a63ef'
const inputlabel = 'B'
const inputcertaddr = '0x379f8d1a0639b0186b8fc86da2087b861b1a63ef'
const inputcert = '0x12345678'

// 部署合约

// deployContract();


registerCertificate(
    contractAddress,
    label,
    certAddress,
    certData,
    notBefore,
    notAfter
)


// updateCertificate(
//     contractAddress,
//     label,
//     certAddress,
//     certData,
//     notBefore,
//     notAfter
// )


// revokeCertificate(
//     contractAddress,
//     label,
// )


// verifyAll(
//     contractAddress,
//     signedAssertion,
//     message,
//     inputlabel,
//     inputcertaddr,
//     inputcert
// )

