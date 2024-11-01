const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const CertGenerate = require('./CertOperation');
const { ecsign, toBuffer, bufferToHex, ecrecover, pubToAddress, privateToPublic } = require('ethereumjs-util');
const { keccak256 } = require('js-sha3');
const { exec } = require('child_process');

const web3 = new Web3(new Web3.providers.HttpProvider("http://121.248.53.204:8545")); //主机ip

var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "./authentication.abi")).toString())
var bytecode = fs.readFileSync(path.join(__dirname, "./authentication.code")).toString()

const account = '0xab7F5238cbEfB02062241cf979e4994b656FB944'; //目前配置似乎不能是创世之外的地址
const privateKey = '0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e'; //对应私钥

// console.log(web3.modules)
// console.log(Web3.version)
// console.log(web3.currentProvider)
// console.log(web3.eth.currentProvider)
// web3.eth.getChainId().then(console.log)
// web3.eth.net.getId().then(console.log)
// web3.eth.net.isListening().then(console.log)
// web3.eth.getHashrate().then(console.log)
// web3.eth.getGasPrice().then(console.log)
// web3.eth.getBlockNumber().then(console.log)
// web3.eth.getBlock(0).then(console.log)
// web3.eth.getBlockTransactionCount(0).then(console.log)
// web3.eth.getTransaction("0x6fb16893c86e3afb683c424a95e85f5963fb8159d4d1d674e06217a8b35f3e46").then(console.log)
// web3.eth.getTransactionReceipt("0x80278bbdb9b8164b17e35e0bff06fbaa515a28a71b2c1101df796e0ea132e673").then(console.log)
// web3.eth.getTransactionCount("0xab7F5238cbEfB02062241cf979e4994b656FB944").then(console.log)

// web3.eth.getAccounts().then(console.log)
// web3.eth.personal.newAccount('139513').then(console.log);
web3.eth.personal.importRawKey("0x8828bf6119a2ce3388a094aea55f5f062db83b7fa46b5a2c7010c3c7439d07c7", "fucku").then(console.log);
// web3.eth.getAccounts().then(console.log)
// web3.eth.getBalance("0xab7F5238cbEfB02062241cf979e4994b656FB944").then(console.log)

// var transactionOptions = {
//     from: "0xab7F5238cbEfB02062241cf979e4994b656FB944",
//     to: '0x4ba8e5f51647d56455ef36b1d760a0a1749e9126',
//     value: "100000000000",
//     gas: 21500,
//     data: web3.utils.toHex("feel the might of fyralath")
// }

// web3.eth.accounts.signTransaction(transactionOptions,"73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e").then(console.log);
// web3.eth.sendSignedTransaction("0xf8856c8502540be4008253fc944ba8e5f51647d56455ef36b1d760a0a1749e912685174876e8009a6665656c20746865206d69676874206f6620667972616c6174688208e7a0a7a72f0c1c98f3af524477e390a224281e12daf1d9749bacfe3c15ce1abf3498a00d6d5181b8281ed1261c1203bca5a0798d37b1f104c61c3676e59369c05c7abc").on('receipt', console.log);
// web3.eth.getTransaction("0xaf342e174eda22d8ab197a955686a639b36d6f07005f08abc463e0f92050b1ce").then(console.log)

////生成交易，data中为明文
// web3.eth.accounts.signTransaction({
//     from: "0xab7F5238cbEfB02062241cf979e4994b656FB944",
//     to: '0x4ba8e5f51647d56455ef36b1d760a0a1749e9126',
//     value: web3.utils.toWei("0.1", "ether"),
//     gas: 24000,
//     data: web3.utils.toHex("feel the might of fyralath")
// }, "73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e")
// .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
// .then(receipt => {
//     console.log("Transaction receipt: ", receipt);
// })
// .catch(err => {
//     console.error("Error: ", err);
// });

// 查询交易，并摘取input即data字段
// web3.eth.getTransaction("0xaf342e174eda22d8ab197a955686a639b36d6f07005f08abc463e0f92050b1ce")
// .then(transaction => {
//     // console.log("Transaction details: ", transaction);
//     const hexData = transaction.input;
//     const decodedMessage = web3.utils.hexToUtf8(hexData);
//     console.log("Decoded message: ", decodedMessage);
//     const t16hash = generate16BitHash(decodedMessage);
//     console.log("Hash: ", t16hash);
//     storeMessage(t16hash, decodedMessage);
//     // let searchHash = t16hash;
//     // console.log("Search result: ", searchMessage(searchHash));
// })
// .catch(err => {
//     console.error("cant get: ", err);
// });

// console.log("Database contents: ", database);
// let searchHash = "cb62";
// console.log("Search result: ", searchMessage(searchHash));

// const transactionHash = "0xaf342e174eda22d8ab197a955686a639b36d6f07005f08abc463e0f92050b1ce";
// handleTransaction(transactionHash);