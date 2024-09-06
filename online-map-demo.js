const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const web3 = new Web3(new Web3.providers.HttpProvider("http://121.248.52.241:8545")); //主机ip

var abi = JSON.parse(fs.readFileSync(path.join(__dirname, "./testcontract.abi")).toString())
var bytecode = fs.readFileSync(path.join(__dirname, "./testcontract.code")).toString()

const account = '0xab7F5238cbEfB02062241cf979e4994b656FB944'; //目前配置似乎不能是创世之外的地址
const privateKey = '0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e'; //对应私钥

const generateShortKey = (message) => { //对应合约，可以不是八位hash（这里18是截取前 0x + 16hex）
    const hash = web3.utils.keccak256(message);
    return hash.slice(0, 18);
};

const uploadmessage = async (contractAddress, transactionType, newMessage, originalMessage = '') => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        const gasEstimate = await contract.methods.handleTransaction(transactionType, newMessage, originalMessage)
            .estimateGas({ from: account });

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: contract.methods.handleTransaction(transactionType, newMessage, originalMessage).encodeABI(),
                gas: gasEstimate,
                from: account
            },
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('回执', receipt);

        const messageKey = generateShortKey(newMessage);
        console.log('key是', messageKey,'请牢记');
        const storedMessage = await contract.methods.getMessage(messageKey).call();
        console.log('已存储', storedMessage);
        
        return {
            transactionHash: receipt.transactionHash,
            storedMessage
        };

    } catch (err) {
        console.error(err);
    }
};

const callGetMessage = async (contractAddress, messageKey) => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        const storedMessage = await contract.methods.getMessage(messageKey).call();
        if (storedMessage) {
            console.log('查询到对应字段为', storedMessage);
        } else {
            // If storedMessage is falsy (null, undefined, etc.), log not found
            console.log('查不到喽');
        }

    } catch (err) {
        console.error('寄了',err);
    }
};


const deployContract = async () => {
    try {
     const contract = new web3.eth.Contract(abi);
   
     const contractdeploy = contract.deploy({
       data: bytecode,
       arguments: ["try it!"],
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

 const getPastEventsInBatches = async (contractAddress, batchSize, fromBlock, toBlock = 'latest') => {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        const latestBlock = await web3.eth.getBlockNumber();
        const finalToBlock = toBlock === 'latest' ? latestBlock : toBlock;
        for (let startBlock = fromBlock; startBlock <= finalToBlock; startBlock += batchSize) {
            const endBlock = Math.min(startBlock + batchSize - 1, finalToBlock);

            console.log(`Fetching events from block ${startBlock} to ${endBlock}`);

            const events = await contract.getPastEvents('allEvents', {
                fromBlock: startBlock,
                toBlock: endBlock
            });

            events.forEach(event => {
                const formattedLog = {
                    from: event.address,
                    topic: event.raw ? event.raw.topics[0] : 'No topic found',
                    event: event.event || 'No event name',
                    args: event.returnValues || 'No return values'
                };
                console.log(JSON.stringify(formattedLog, null, 2));
            });
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
};

// 查询该合约的所有历史,目前查不到update删掉了哪个，但其实问题不大
getPastEventsInBatches('0xb3B8372542386Bec38Cf84527e4B9031BD88E193', 5000, 1, 'latest');
 
//commands

// 部署合约，目前合约的key是8位哈希，要调整需要整体调
// deployContract();


// 用于上链消息，l1：deploy完会返回你合约地址，copy进来； l2：type：包含add，update，revoke；  l3：新增的消息（add，或者update的新的那个）;  l4:移除的消息（revoke，或者update去掉的那个）
// uploadmessage('0xb3B8372542386Bec38Cf84527e4B9031BD88E193', 
//               'revoke',
//               '' ,
//               'asd');

//查询，这条不花gas随意查，上链设定为需要一定gas
// callGetMessage('0xb3B8372542386Bec38Cf84527e4B9031BD88E193', '0x87c2d362de99f75a');