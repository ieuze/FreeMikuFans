# FreeMikuFans — Codebase Guide

## 项目概览

- **基于**: [FreeTube](https://github.com/FreeTubeApp/FreeTube) v0.24.0 — 开源的桌面 YouTube 客户端
- **技术栈**: Electron 42 + Vue 3 + Shaka Player 5 + Webpack 5
- **包管理**: pnpm 10 (workspace)
- **构建**: Webpack 打包 → electron-builder 26 分发
- **目标**: 在 FreeTube 基础上增加 Bilibili 视频源支持

## 目录结构

```
src/
  main/              Electron 主进程
    index.js         窗口创建、IPC handlers、代理、请求头修改
    externalPlayer.js 外部播放器（mpv/VLC）
    poTokenGenerator.js YouTube PO token 生成
    ImageCache.js    内存图片缓存
    utils.js         URL 验证

  preload/
    main.js          contextBridge 暴露 ftElectron API
    interface.js     所有 IPC 封装方法

  renderer/
    helpers/
      api/
        local.js          YouTube 内置提取器（youtubei.js/Innertube）
        invidious.js      Invidious API 集成
        bilibili.js       Bilibili 提取器（新增，WIP）
        PlayerCache.js    YouTube player JS 缓存
      player/
        SabrManifestParser.js   SABR 协议 manifest 解析
        SabrSchemePlugin.js     SABR 网络 scheme 插件
        WebmSegmentIndexParser.js
        Mp4SegmentIndexParser.js
        EbmlParser.js
        utils.js               字幕排序、SponsorBlock
    views/
      Watch/
        Watch.js         核心视图：后端选择、manifest 生成、播放控制
    components/
      ft-shaka-video-player/  Shaka Player 封装
    store/modules/
      settings.js       所有设置项（backendPreference 等）
      invidious.js      Invidious 实例管理
      player.js         播放器 locale 缓存

  _scripts/
    build.mjs                 构建入口（分平台）
    ebuilder.config.mjs       electron-builder 配置
    dev-runner.js             开发服务器
    webpack.*.config.js       Webpack 配置
```

## 视频流架构

### 后端选择机制

`settings.backendPreference` 控制使用的视频源：
- `'local'` — YouTube 内置 API（youtubei.js）
- `'invidious'` — Invidious 实例 API
- `'bilibili'` — Bilibili API（新增，WIP）

`Watch.js` 的 `reloadView()` 根据 `backendPreference` 分发到对应 `getVideoInformation*()` 方法。

### 播放格式

Shaka Player 支持四种 manifest 格式：

| 格式 | MIME type | 来源 |
|------|-----------|------|
| DASH | `application/dash+xml` | Local / Invidious / Bilibili |
| SABR | `application/sabr+json` | YouTube Local 专用 |
| HLS | `application/x-mpegurl` | 部分 YouTube 视频 |
| Legacy | 直接 URL | 降级方案 |

### macOS 构建

```bash
pnpm install
pnpm run dev              # 开发（Webpack Dev Server :9080 + Electron HMR）
pnpm run build            # 生产构建（本地架构）
pnpm run build:arm64      # Apple Silicon 专用
```

构建产物输出到 `./build/`，macOS 格式为 `.dmg` / `.zip` / `.7z`。

## Bilibili 集成（WIP）

**文件**: `src/renderer/helpers/api/bilibili.js`

核心 API：
- BV/AV ID 互转
- WBI 签名（MD5 + mixin key）
- DeviceForger（浏览器指纹伪装）
- Bilibili cookie 生成（buvid3/4, _uuid, b_lsid）
- `getBilibiliVideoInfo(bvid)` — 视频信息提取
- `parseBilibiliDashStreams()` — DASH JSON 解析
- `generateBilibiliDashManifest()` — DASH XML 生成（Phase 2）

### Bilibili API 端点

```
BASE: https://api.bilibili.com
GET /x/web-interface/view?bvid={bvid}&p={page}       视频元数据
GET /x/player/wbi/playurl?cid=&qn=120&fnval=4048     视频流地址（WBI 签名）
GET /x/web-interface/search/type?search_type=video    搜索
GET /x/space/wbi/arc/search?mid=...                   频道视频（WBI 签名）
GET /x/v2/reply/wbi/main                              评论（WBI 签名）
GET /x/player/wbi/v2                                  字幕元数据（WBI 签名）
GET /x/v1/dm/list.so?oid={cid}                        弹幕（XML）
```

### 反爬策略

- WBI 签名：动态 key + MD5
- 浏览器指纹：随机 Chrome UA、GPU、WebGL
- Cookie 轮换：buvid3/4、_uuid 等
- dm_img 参数：WebGL + 屏幕指纹
- 状态码 -352 检测和重试

## DASH Manifest 生成（Phase 2, WIP）

Bilibili 返回的 JSON DASH 格式包含 `video[]` 和 `audio[]` 数组，每个元素是带 `SegmentBase`（`init` + `indexRange`）的 fMP4 URL。生成标准 DASH XML 后 Shaka Player 原生播放。
