# chain33_dpki_lenovo
9.6 jr
first establish
简单实现了合约-分类-map存储的功能
使用online-map-demo可以试一下功能，生成带add、update、revoke标签的交易并丢给合约，合约进行分类后修改链上的map，和local-db的功能一样（local是本地的数据库，没有过合约）
合约是testcontract的三个文件，现在文件还很乱，后期会整理，先玩一玩试试

让demo跑起来之准备工作
1.安装node.js保姆级教程：https://blog.csdn.net/WHF__/article/details/129362462  以及可能遇到的问题的解决方案：https://blog.csdn.net/PengXing_Huang/article/details/136460133#:~:text=%E5%BD%93%E4%BD%A0%E7%9C%8B%E5%88%B0%60npm%20i
2.Web3.providers.HttpProvider("http://121.248.49.48:8545"); 切换成本地地址，用ipconfig查看
3.运行chain33：chain33.exe -f chain33.toml；查询链信息：chain33-cli net peer info
4.之后就能runcode了。可以跑的有online-map-demo和local-db（后者需要安装的npm install -g nedb）

10.24 jr
实现了CA证书生成，UE证书签名，上链功能
逻辑是：
对于CA，生成密钥对，生成自签名证书，用生成的密钥对的公钥在区块链中注册
对于UE，生成密钥对，生成基于密钥的CSR，用生成的密钥对的公钥在区块链中注册，CA为用户证书签名

DPKI-generate.js 可实现证书流程，CA证书相关生成为根目录下的文件夹，caName为文件夹名，ue同理
CA生成自签名证书只需要执行一次指令，CA则需要按顺序执行后两部，分开是为了后续开发
在online-map-demo里新增了将证书读取并上链的指令，但是我这里上链时会报一个s2未定义的错，但是查询暂时是没问题的

执行证书生成需要一些前置步骤
安装openssl，windows直接下载exe并添加到环境变量，以在bash里openssl version能看见为准

代码上也需要做前期准备，首先，需要创建并unlock钱包，命令为：
.\chain33-cli seed generate -l 0  //生成注记词
.\chain33-cli seed save -s '生产的助记词' -p '密码' //注记词直接粘进来，密码要有字母+数字，牢记密码！不然要删掉重新来了
.\chain33-cli wallet unlock -p 密码 -t 0 //解锁，每次重新启动节点都需要输密码unlock

否则“用生成的密钥对的公钥在区块链中注册”这一步就寄了

其次，每次在链上注册label需要不同，即xxx，generateKeyAndCert和UECSRgenerate两个函数均有，需注意
web3.eth.personal.importRawKey(HEXsk,`xxx`).then(console.log);
这行在调试时可以直接注销掉，后续可能要往里打gas才能做一些链上操作
