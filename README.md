# tounaowangzhe

# Introduce

目前题库里有1001道题，大部分为[入门新手]和[起步熟手]级别的，即在这两个级别能提示答案的几率比较高

# Requirements
MySQL、NPM、WIFI、手机和电脑在同一WIFI下

# Usage

1. 创建MySQL表，SQL文件：`database/tounaowangzhe_structure.sql`

2. 导入共享题库，SQL文件：`database/tounaowangzhe_data_xx.sql`

3. 安装anyproxy

```
npm install -g anyproxy
```

4. 安装依赖

```
npm install
```

5. 修改 `tounaowangzhe.js` 开头处的MySQL连接信息，如：`host`、`database`、`user`、`password`

6. 生成并安装证书

生成证书：
```
anyproxy-ca
```
把生成的`rootCA.crt`给手机安装上

7. 启动anyproxy
```
cd tounaowangzhe
anyproxy --rule tounaowangzhe.js
```

8. 给手机WIFI配置代理，IP是电脑的IP，端口是默认的8001

# Contribute

题库越丰富，提示答案的几率越高，请fork本仓库提交你自己的题库，文件名按照 `database/tounaowangzhe_data_01.sql` 格式，序号依次递增
