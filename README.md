### 概述
产品运营人员可以通过smart-doc快速完成产品的功能介绍，帮助用户更好的了解和使用产品的各项功能。

### 前言
由于参与公司多个产品的研发工作，产品每次迭代更新，都会有若干功能新增或变动，为了及时反应这些变动，需要编写一些页面来说明。
时间一长就感觉在重复的做一些低级工作，为了不把宝贵的青春浪费在这些琐碎的事情上，我就在业余时间开发了这套系统。

### 功能特性
- 通过 站点 - 手册 - 文章 三级结构来维护产品说明文档
- 支持站点，手册，文章三级锁定功能，一旦锁定则该范围内的文档将不对外开放
- 支持多人协作编辑
- 支持富文本内容
- 支持一键生成pdf(开发中)
- 支持评论，点赞功能(开发中)

### 快速体验
- `docker run -id -p 44444:80 --name doc-demo liuss/smart-doc:<version> /mnt/data/init.sh` 需要将 `version` 改成对应的版本号
- 访问管理页面: `https://127.0.0.1:44444` 登录名 demo | demo2 | demo3 | demo4 密码 123456
- [在线体验](http://39.104.57.212:44444)


### 环境搭建
- 安装 `nodejs` (需要超级管理员权限) [详情](https://nodejs.org/en/download/package-manager/#freebsd-and-openbsd)
```
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
sudo yum install -y nodejs
``` 
- 安装pm2，如果安装中报错或者长时间没有响应 尝试通过镜像安装 例如： `npm install -g pm2 --registry=https://registry.npm.taobao.org`
```
npm install -g pm2
```
- 安装MongoDB 3.6 以上版本 [安装步骤](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/)
>`src/config.yaml` 中的 `mongo_address` 用来配置MongoDB服务器地址
- 安装nginx集群部署时需要，[yum源](http://nginx.org/en/linux_packages.html#stable)
```
yum install nginx
```
- 系统初始化之后，需要调用 `/api/admin/namespace/save` 接口来生成一个命名空间，客户端通过这个命名空间连接服务器；每个客户的必须有一个所属的命名空间才能连接服务器，否则服务器会拒绝任何没有命名空间的客户端的所有请求

- 集群部署 `nginx` 参考 `doc/nginx` 

- 配置 `node` 单机集群 参考 `app.json` ， [pm2使用说明](https://github.com/Unitech/pm2)

- 服务的端口配置 见 `src/config.yaml`


> 前端web项目 [地址](https://github.com/liutian/smart-doc-web)
