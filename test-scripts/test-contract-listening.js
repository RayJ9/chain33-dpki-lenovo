// 事件监听测试
var Web3 = require('web3');
var fs = require('fs')
var path = require('path');

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://121.248.55.15:8546'));
var eventName = 'TokenMinted(uint256,uint256,string)'
var contractAddress = '0x6741e300B4de44Bec2701B5a15c90Bc0509752Cf';
var topic = web3.eth.abi.encodeEventSignature(eventName);

var subscription = web3.eth.subscribe('logs', {
    address: contractAddress,
    topics: [topic],
}, function(error, result){
    if (!error) {
        console.log(result);
    } else {
        console.error(error)
    }
})
.on("connected", subscriptionId => {
    console.log(`Subscribed with ID: ${subscriptionId}`);
  });


// const subscription = web3.eth.subscribe('logs', {
//     subscription: 44
// });

// subscription.on('data', (log) => {
//     console.log(log);
//   });

// 取消订阅
// subscription.unsubscribe((error, success) => {
//     if (success) {
//       console.log(`Unsubscribed from ID: ${subscriptionId}`);
//     }
// });