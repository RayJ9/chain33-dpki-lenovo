package testnodej;
import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import javax.print.DocFlavor.STRING;

import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;

import org.web3j.protocol.*;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.DefaultBlockParameterNumber;
import org.web3j.protocol.core.methods.response.EthAccounts;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.EthBlockNumber;
import org.web3j.protocol.core.methods.response.EthGasPrice;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.EthTransaction;
import org.web3j.protocol.core.methods.response.Transaction;
import org.web3j.protocol.http.HttpService;

import org.web3j.utils.Convert;
import org.web3j.utils.Numeric;

import com.google.gson.Gson;

public class App
{
    public static void main( String[] args ) throws InterruptedException, ExecutionException, IOException
    {
        // link
        Web3j web3 = Web3j.build(new HttpService("http://121.248.55.15:8545"));

        // latest block height
        EthBlockNumber  ethBlockNumber = web3.ethBlockNumber().sendAsync().get();
        BigInteger blockNumber = ethBlockNumber.getBlockNumber();
        System.out.println("BlockNumber:" + blockNumber + "\r\n");

        // all users
        // EthAccounts ethAccounts = web3.ethAccounts().sendAsync().get();
        // List<String> accounts = ethAccounts.getAccounts();
        // System.out.println("Accounts:" + accounts + "\r\n");

        // balance
        // BigInteger balance = web3.ethGetBalance("0xab7F5238cbEfB02062241cf979e4994b656FB944", DefaultBlockParameterName.LATEST).send().getBalance();

        // String balanceStr = Convert.fromWei(balance.toString(), Convert.Unit.ETHER).toString();
        // System.out.println("Balance formated" + balanceStr + "\r\n");

        // chainid
        BigInteger chainId = web3.ethChainId().send().getChainId();
        System.out.println("ChainId:" + chainId + "\r\n");

        Gson gson = new Gson();



        // EthTransaction transaction = web3.ethGetTransactionByHash("0xf18d564a2a944172e5b737cd39b29c004fa210c31f2c2b38c3af131ee3d4b2ea").sendAsync().get();
        // Optional<Transaction> optionalTransaction = transaction.getTransaction();
        // StringBuilder txInfo = new StringBuilder();
        // if(optionalTransaction.isPresent()){
        //     Transaction transactionInfo = optionalTransaction.get();
        //     txInfo.append(gson.toJson(transactionInfo));
        // }
        // System.out.println("TransactionInfo:" + txInfo.toString() + "\r\n");

        //sender, need private key
        Credentials credentials = Credentials.create("0x73e66f099144f820753aa3a5e131785b528081da572e16339fcd02de05de719e");
        //nonce, the latest block number
        BigInteger nonce = web3.ethGetTransactionCount("0xab7F5238cbEfB02062241cf979e4994b656FB944", DefaultBlockParameterName.LATEST).send().getTransactionCount();

        // gas price
        EthGasPrice ethGasPrice = web3.ethGasPrice().sendAsync().get();
        BigInteger gasPrice = ethGasPrice.getGasPrice();

        // gas limit
        BigInteger gasLimit = BigInteger.valueOf(0L);

        //send trans
        String to = "0xab7F5238cbEfB02062241cf979e4994b656FB944";

        String value = "Certificatexx"; 

        RawTransaction rawTransaction = RawTransaction.createTransaction(nonce, gasPrice, gasLimit, to, value);

        byte[] signMessage = TransactionEncoder.signMessage(rawTransaction, chainId.longValue(), credentials);
        String hexValue = Numeric.toHexString(signMessage);

        EthSendTransaction ethSendTransaction = web3.ethSendRawTransaction(hexValue).sendAsync().get();
        String tx = gson.toJson(ethSendTransaction);
        System.out.println(tx);

        Thread.sleep(1000);

        DefaultBlockParameterNumber defaultBlockParameterNumber = new DefaultBlockParameterNumber(101);
        EthBlock ethBlock = web3.ethGetBlockByNumber(defaultBlockParameterNumber,true).sendAsync().get();
        EthBlock.Block block = ethBlock.getBlock();

        // String info = gson.toJson(block);
        // System.out.println("BlockInfo:" + info + "\r\n");

        List<EthBlock.TransactionResult> transactions = block.getTransactions();
        List<Transaction> txInfos = new ArrayList<>();
        transactions.forEach(txInfo->{
            Transaction transaction = (Transaction)txInfo;
            txInfos.add(transaction);
        }); 
        String transactionInfos = gson.toJson(txInfos);
        System.out.println("TransactionInfos:" + transactionInfos + "\r\n");


    }
}