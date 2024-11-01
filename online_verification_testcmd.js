const { ecsign, toBuffer, bufferToHex, ecrecover, pubToAddress, privateToPublic } = require('ethereumjs-util');
const { keccak256 } = require('js-sha3');
function generateSignature(privateKeyHex, message) {
    const privateKeyBuffer = Buffer.from(privateKeyHex.slice(2), 'hex');
  
    const messageHash = Buffer.from(keccak256(message), 'hex');
  
    const { r, s, v } = ecsign(messageHash, privateKeyBuffer);
  
    const signature = Buffer.concat([r, s, Buffer.from([v])]);
    return bufferToHex(signature);
  }

  const privateKeyHex = "0xfba5f29fb3818cfe382e98ae3f6db54c11a9d1dae4a004430b250664dc2d5a33";
  const messageToSign = "0x379f8d1a0639b0186b8fc86da2087b861b1a63ef";
  
  const generatedSignature = generateSignature(privateKeyHex, messageToSign);
  console.log("Generated Signature (hex):", generatedSignature);

// const { ecsign, toBuffer, bufferToHex, ecrecover, pubToAddress } = require('ethereumjs-util');
// const { keccak256 } = require('js-sha3');

// 恢复签名者地址的函数
function recoverSigner(message) {
  const messageHash = keccak256(message);
  return messageHash;
}

// // 示例调用
// // const signatureHex = "0x64ad852e64c2fc763c32d1545e1c01588dd7afffb1500ab56b8637414e86bdc32b235e9015c88ede064f63daae79f6b2497e610431f62d593f3ebdc708edec1e1c";
const message = "0x379f8d1a0639b0186b8fc86da2087b861b1a63ef";
console.log(recoverSigner(message))

// const recoveredAddress = recoverSigner(message);
// console.log("Recovered Ethereum Address:", recoveredAddress);


// const ethers = require('ethers');

// const message = "0x379f8d1a0639b0186b8fc86da2087b861b1a63ef";
// const messageHash = ethers.utils.keccak256(message);

// console.log(messageHash);