<p align="center">
 <img alt="" src="/_icons/logoColor.svg" width=500 align="center">
</p>

# FreeMikuFans — Bilibili × YouTube 聚合客户端

FreeMikuFans 是基于 [FreeTube](https://github.com/FreeTubeApp/FreeTube) v0.24.0 的衍生分支，在保持原版 YouTube 隐私友好客户端全部功能的基础上，**新增 Bilibili 视频源支持**。使用 Electron + Vue 3 + Shaka Player 构建。

<p align="center">
  <a href="https://www.gnu.org/licenses/agpl-3.0.html">
    <img alt="License: AGPLv3" src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" />
  </a>
</p>

---

## 特性

- **双视频源**：原生 YouTube（内置提取器 / Invidious API）+ Bilibili（WIP）
- **无广告观看**：YouTube 无广告；Bilibili 使用官方接口
- **隐私优先**：无 Cookie 追踪，订阅/历史/播放列表本地存储
- **Shaka Player**：支持 DASH / HLS / SABR 流媒体格式
- **DASH Manifest**：Bilibili fMP4 视频流实时生成标准 DASH XML
- **SponsorBlock / DeArrow**：保留原版功能

## Bilibili 集成状态

| 功能 | 状态 |
|------|------|
| BV/AV ID 互转 | ✅ 完整 |
| WBI 签名 + 设备指纹 | ✅ 完整 |
| 视频信息 + DASH 流 | ✅ 完整 |
| 搜索（全站） | ✅ 完整 |
| 关联视频推荐 | ✅ 完整 |
| 评论（支持排序/分页） | ✅ 完整 |
| 频道/UP主主页（视频列表+关于） | ✅ 完整 |
| DASH Manifest 生成 | ✅ Phase 2 |
| 弹幕 | ❌ 未实现 |
| 字幕（BCC→SRT） | ❌ 未实现 |
| 直播 | ❌ 未实现 |
| 收藏夹/合集 | ❌ 未实现 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式（Webpack Dev Server :9080 + Electron HMR）
pnpm run dev

# 生产构建
pnpm run build:arm64    # Apple Silicon
pnpm run build          # 本地架构
```

构建产物输出到 `./build/`，macOS 格式为 `.dmg` / `.zip` / `.7z`。

## 架构概览

```
src/
  main/index.js           Electron 主进程：窗口管理、Origin 请求头改写（Bilibili 412 修复）
  renderer/helpers/api/
    local.js              YouTube 内置提取器（youtubei.js/Innertube）
    invidious.js          Invidious API 集成
    bilibili.js           新增：Bilibili 提取器（BV/AV、WBI 签名、DASH 解析、搜索、评论、频道）
  renderer/views/
    Watch/Watch.js        核心视图：后端选择、Bilibili 视频信息提取、DASH manifest 生成
    SearchPage/           搜索：支持 Bilibili 搜索结果
    Channel/              频道：支持 Bilibili UP 主主页
  renderer/components/
    CommentSection/       评论：支持 Bilibili 评论（排序 + 分页 + 回复）
    ft-shaka-video-player/ Shaka Player 封装
```

### 后端切换

设置 → 后端偏好（`settings.backendPreference`）：
- `local` — YouTube 内置 API
- `invidious` — Invidious 实例
- `bilibili` — Bilibili API

## 技术要点

### Bilibili 反爬处理

| 措施 | 实现 |
|------|------|
| WBI 签名 | 动态 key + MD5 参数签名 |
| 浏览器指纹 | DeviceForger：随机 Chrome UA、GPU、WebGL |
| Cookie 轮换 | buvid3/4、_uuid、b_lsid 随机生成 |
| dm_img 参数 | WebGL + 屏幕指纹 Base64 |
| Origin 修复 | Electron `onBeforeSendHeaders` 改写 Origin 为 `https://www.bilibili.com` |
| 412 重试 | 自动刷新 Cookie + 设备指纹后重试 |

### DASH 流

Bilibili 返回的 JSON DASH 格式包含 `video[]` 和 `audio[]` 数组（fMP4 格式，含 `SegmentBase` 的 `init` + `indexRange`），实时生成标准 DASH XML 后由 Shaka Player 原生播放。

## License

[![GNU AGPLv3](https://www.gnu.org/graphics/agplv3-155x51.png)](https://www.gnu.org/licenses/agpl-3.0.html)

FreeMikuFans 基于 [FreeTube](https://github.com/FreeTubeApp/FreeTube)（AGPL-3.0）修改而来。  
由于 Bilibili 集成深度修改了 FreeTube 核心源码（包括主进程网络层、渲染进程视图/组件/API 层），**无法以独立链接库形式分发**，因此整个项目必须遵循 **GNU Affero General Public License v3.0** 开源。

> 简而言之：你可以自由使用、学习、分享和改进本软件，但任何公开部署或分发都必须提供完整的源代码。
