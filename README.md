# chain33_dpki_lenovo
9.6 jr
first establish
简单实现了合约-分类-map存储的功能
使用online-map-demo可以试一下功能，生成带add、update、revoke标签的交易并丢给合约，合约进行分类后修改链上的map，和local-db的功能一样（local是本地的数据库，没有过合约）
合约是testcontract的三个文件，现在文件还很乱，后期会整理，先玩一玩试试

让demo跑起来之准备工作
1.安装node.js保姆级教程：https://blog.csdn.net/WHF__/article/details/129362462；以及可能遇到的问题的解决方案：https://blog.csdn.net/PengXing_Huang/article/details/136460133#:~:text=%E5%BD%93%E4%BD%A0%E7%9C%8B%E5%88%B0%60npm%20i
2.Web3.providers.HttpProvider("http://121.248.49.48:8545"); 切换成本地地址，用ipconfig查看
3.运行chain33：chain33.exe -f chain33.toml；查询链信息：chain33-cli net peer info
4.之后就能runcode了。可以跑的有online-map-demo和local-db（后者需要安装的npm install -g nedb）
