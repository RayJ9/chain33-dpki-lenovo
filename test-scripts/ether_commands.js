var ethers = require("ethers");
var fs = require('fs')
var path = require('path');

const provider = new ethers.providers.JsonRpcProvider("http://121.248.52.241:8545");

async function get() {

// 查询区块高度
const blocknumber = await provider.getBlockNumber();
console.log(`区块高度：${blocknumber}`) 

// 查询账户余额
const balance = await provider.getBalance("0xab7F5238cbEfB02062241cf979e4994b656FB944")

// 格式化账户余额
const balanceformat = ethers.utils.formatEther(balance)
console.log(`账户余额：${balanceformat}`)  

// 获得账户交易数
const txCount = await  provider.getTransactionCount("0xab7F5238cbEfB02062241cf979e4994b656FB944")
console.log(`账户交易数：${txCount}`)  

// 获取链ID
const chainId = (await provider.getNetwork()).chainId
console.log(`ChainId：${chainId}`)

// 获取节点上账户信息
const listenerCount = await provider.listAccounts()
console.log(listenerCount)  

// // 获取交易信息
// const txInfo = await provider.getTransaction("0xf18d564a2a944172e5b737cd39b29c004fa210c31f2c2b38c3af131ee3d4b2ea")
// console.log(txInfo)

// // 获取交易回执
// const txreceipt = await provider.getTransactionReceipt("0xf18d564a2a944172e5b737cd39b29c004fa210c31f2c2b38c3af131ee3d4b2ea")
// console.log(txreceipt)

// // 获取区块信息
// const blockInfo = await provider.getBlock(29)
// console.log(blockInfo) 

// // 获取指定合约地址的合约bytecode
// const code = await provider.getCode("0x6741e300B4de44Bec2701B5a15c90Bc0509752Cf")
// console.log(code) 

}

get()

async function transfer() {
    // 发送方私钥
    const privatekey = "0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e";

    // 创建一个钱包
    const wallet = new ethers.Wallet(privatekey, provider);

    // 设置接收方地址
    const toAddress = '0x3f32619C6cd6E1a49382c686899Ec75D415F78ce';

    // 设置转账数量
    const value = ethers.utils.parseEther('99999.0');

    // 创建交易对象
    const tx = {
        to: toAddress,
        value: value,
        gasLimit: 1000,
        gasPrice: ethers.utils.parseUnits("10", "gwei"),
        chainId: 1122,
        nonce: await provider.getTransactionCount(wallet.address)
    };

  // 签名交易
    const signedTx = await wallet.signTransaction(tx);

    // 发送交易
    provider.sendTransaction(signedTx)
}

transfer()



// var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "../chain33_solo_linux_0670237/contract.abi")).toString())


// // 合约地址
// var contractAddress = '0x6741e300B4de44Bec2701B5a15c90Bc0509752Cf';

// // 获取topic信息
// // 方式一：
// const iface = new ethers.utils.Interface(abi);

// const eventName = "TokenMinted";
// const eventArgs = [{name: "tokenId", type: "uint256"}, {name: "supply", type: "uint256"},{name: "uri", type: "string"}];

// const eventTopic = iface.getEventTopic(eventName, eventArgs);  
// console.log(eventTopic)

// // 方法二：
// // const topic1 = ethers.utils.id('TokenMinted(uint256,uint256,string)');
// // console.log(topic1)

// async function getLogs() {

// const filter = {
//     address: contractAddress,
//     fromBlock: 1, // 最小高度是1，不能从0开始
//     toBlock: 'latest',
//     topics: [eventTopic]
//   };
  
//   const logs = await provider.getLogs(filter);
  
//   console.log(logs);
// }

// getLogs()

 // websocket连接
//  const providerWs = new ethers.providers.WebSocketProvider('ws://121.248.55.15:8546');

 // 创建合约实例
//  const contract = new ethers.Contract(contractAddress, abi, providerWs);

// function listen() {
//     contract.on("TokenMinted", (tokenId, supply, uri) => {
//         console.log(`TokenMinted event received for ${tokenId}，supply: ${supply}, uri: ${uri}`);
//     });
// }


// listen()