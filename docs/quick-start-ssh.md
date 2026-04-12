# 快速启动一个可用的追番服务（命令版本）

​	本文将引导用户构建一个基础的AniLinkService的docker容器，并通过简单的配置介绍，实现一个基础可用的追番服务，在阅读文档前，可以先通过以下事项确认本服务是否能满足你的需求：



1、你有一台可以持续运行的NAS或家用服务器

> 如果你本身只有一台电脑或手机，那弹弹官方的应用程序应该更加适合你：[链接地址](https://www.dandanplay.com/)

2、你的服务器支持docker，且知道如何拉取创建docker容器

> 本文将以SSH命令的形式进行介绍，如果你使用的是一些可视化的操作界面，你可以点击左侧导航栏的极空间示例

3、你的机器能访问`ghcr.io`

> 这是github的容器镜像，如果无法拉取，你可能需要一些魔法手段

4、你已经拿到了弹弹开放平台的AppId和AppSecret

> 如果你还没有官方AppId/AppSecret，可以先参考本项目的[下游代理服务介绍](./ani-link-proxy.md)。

## 1. 拉取镜像

在连接服务器后，执行以下指令：

```bash
docker pull ghcr.io/eventhorizonsky/anilinkserver:latest
```

## 2. 使用 H2 快速启动

先进入到你希望持久化媒体库和配置文件的目录，执行以下指令来创建目录

```bash
mkdir -p ./anilink/data ./anilink/media
```

启动容器：

```bash
docker run -d \
	--name anilink \
	-p 8063:8081 \
	-e DB_PROFILE=h2 \
	-v ./anilink/data:/data \
	-v ./anilink/media:/media/anime \
	--restart unless-stopped \
	ghcr.io/eventhorizonsky/anilinkserver:latest
```

说明：

- `./anilink/data` 用于持久化 H2 数据库文件，以及一些缓存或临时文件（字幕、临时下载目录等）
- `./anilink/media` 是示例媒体目录，如果你已经下载过一些视频文件了，你也可以替换成对应的目录，`/media/anime`是其挂载到容器内的路径，你可以用`/media/anime1`、`/media/anime2`之类你任意想用的路径，但是记得别和系统要用的路径重合
- `-p 8081:8081`中，前面的8081是你需要暴露出来的服务器端口，你可以任意切换，后面的8081固定

## 3. 初始化引导

1. 浏览器打开 `http://<你的主机IP>:8081`（如果你修改了上面的端口，则访问你修改后的），预期看到的引导页面如下：

   ![image-20260316201252700](/quick-start-ssh/image-20260316201252700.jpg)

2.如无异常，直接点击下一步，进行站点标题、描述、管理员账号和弹弹开放平台的配置

> 弹弹的 AppId 和 AppSecret 是必需的，不然程序基础功能将无法使用。你可以先阅读本项目的[下游代理服务介绍](./ani-link-proxy.md)来获取示例服务和说明。该公益服务仅作示例，你也可以使用任何符合弹弹play API规范的服务；官方 API 可用时仍建议优先使用。

![image-20260316201446174](/quick-start-ssh/image-20260316201446174.jpg)

3.配置媒体库，如果你是按照此指引的命令构建的容器，那么你需要选中`/media/anime`

![image-20260316201702111](/quick-start-ssh/image-20260316201702111.jpg)

4.直接点击完成安装即可

![image-20260316201737725](/quick-start-ssh/image-20260316201737725.jpg)

正常情况下，首页的新番时间表应当正常展示，如果显示数据异常，则可能是你提供的 AppId 和 AppSecret 有问题；参考本项目的[下游代理服务介绍](./ani-link-proxy.md)或者官方 API 指引来检查。

![image-20260316201900329](/quick-start-ssh/image-20260316201900329.jpg)

## 4. 配置自动下载

> 如果你的媒体库文件夹本身已经有了你需要的视频文件，可以跳过这一节

点击右上角头像，登录你上一节中配置的管理员账号

![image-20260316202122662](/quick-start-ssh/image-20260316202122662.jpg)

登录后，再次点击头像，进入后台管理

![image-20260316202210898](/quick-start-ssh/image-20260316202210898.jpg)

进入RSS订阅菜单，新增一个RSS订阅，此处以ANI组的acg.rip的rss订阅为示例，你也可以换成mikan的订阅地址

```
https://acg.rip/team/173.xml
```

![image-20260316202351270](/quick-start-ssh/image-20260316202351270.jpg)

如果你的服务器本身无法访问acg.rip等rss订阅地址，你可以通过以下方式来配置http代理

![image-20260316202539570](/quick-start-ssh/image-20260316202539570.jpg)

点击立即检查，它将启动一次RSS订阅检索，将最新的30条ANI组的番剧下载到你的媒体库中，并自动完成匹配

![image-20260316202624309](/quick-start-ssh/image-20260316202624309.jpg)

![image-20260316202711884](/quick-start-ssh/image-20260316202711884.jpg)

![image-20260316202737346](/quick-start-ssh/image-20260316202737346.jpg)

![image-20260316203228609](/quick-start-ssh/image-20260316203228609.jpg)

回到首页，点击发现，应当能看到刚刚匹配成功的番剧

![image-20260316203303408](/quick-start-ssh/image-20260316203303408.jpg)



## 5.番剧详情与播放

匹配成功的剧集将会亮起，点击后会自动加载弹幕

![image-20260316203422059](/quick-start-ssh/image-20260316203422059.jpg)

评论区可以查看番剧对应的bgm.tv的吐槽

![image-20260316203456663](/quick-start-ssh/image-20260316203456663.jpg)

点击追番后，番剧更新将会在消息中心提示，并添加到追番列表

![image-20260316203536620](/quick-start-ssh/image-20260316203536620.jpg)

![image-20260316203556961](/quick-start-ssh/image-20260316203556961.jpg)

![image-20260316203628935](/quick-start-ssh/image-20260316203628935.jpg)

## 6. 故障排查

- 无法访问页面：检查端口映射 `-p 8081:8081` 与服务器防火墙
- 扫描不到视频：确认媒体目录已挂载且安装向导中填写的是容器内路径
- 启动失败：先看日志 `docker logs anilink`

