var Web3 = require('web3');
var fs = require('fs')
var path = require('path');

var web3 = new Web3(new Web3.providers.HttpProvider("http://121.248.52.241:8545"));

var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "/contract.abi")).toString())

var contractAddress = '0x32e71cc17c8601fdc736edbb016bfc19778491b5';

var tx = new web3.eth.Contract(abi, contractAddress);

var tokenId = 1509

var supply = 150
var uri = "http://121.248.52.241:9000/rayaxe.json"



var mintTx = tx.methods.mint(tokenId, supply, uri);

const mint = async () => {

  const createTransaction = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data: mintTx.encodeABI(),
      gas: await mintTx.estimateGas({from: "0xab7F5238cbEfB02062241cf979e4994b656FB944"}),
    },
    "0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e"
  );

  const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
  console.log(createReceipt);
};  

mint();


// var transferTx = tx.methods.safeTransferFrom("0xab7F5238cbEfB02062241cf979e4994b656FB944", '0x3f32619C6cd6E1a49382c686899Ec75D415F78ce', tokenId, 10, "0x");
// const transfer = async () => {

//   const transferTransaction = await web3.eth.accounts.signTransaction(
//     {
//       to: contractAddress,
//       data: transferTx.encodeABI(),
//       gas: await transferTx.estimateGas({from: "0xab7F5238cbEfB02062241cf979e4994b656FB944"}),
//     },
//     "0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e"
//   );

//   const createReceipt = await web3.eth.sendSignedTransaction(transferTransaction.rawTransaction);
//   console.log(createReceipt);
// };

// transfer();



const getInfo = async () => {

  const fromValue = await tx.methods.balanceOf("0xab7F5238cbEfB02062241cf979e4994b656FB944", tokenId).call();
  console.log(`The current balance of from is: ${fromValue}`);

  const toValue = await tx.methods.balanceOf("0x3f32619C6cd6E1a49382c686899Ec75D415F78ce", tokenId).call();
  console.log(`The current balance of to: ${toValue}`);

  const uri = await tx.methods.uri(tokenId).call();
  console.log(`The URI of token is: ${uri}`);
};
getInfo();

var eventName = 'TokenMinted(uint256,uint256,string)'
var topic = web3.eth.abi.encodeEventSignature(eventName);
console.log(topic)
web3.eth.getPastLogs({
    address: contractAddress,
    topics: [topic],
    fromBlock: 1,
})
.then(console.log);