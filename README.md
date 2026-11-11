# X-OS｜X手机模拟器

一个独立的 SillyTavern 手机模拟器扩展。角色卡与本扩展完全分开；本仓库只提供扩展本身。

## 直接安装（推荐）

在 SillyTavern 中打开 **扩展 → 安装扩展（Install Extension）**，粘贴下面的仓库地址：

```
https://github.com/muyamu505-gif/X-OS
```

选择安装目标后安装即可。SillyTavern 通过 Git 克隆仓库，因此服务器端需要已安装 Git。

## 功能

- 酒馆界面悬浮手机入口。
- AI 回复中出现 `[[PHONE]]` 或 `【打开手机】` 时，在该条消息下方显示可展开的手机面板。
- 仿 Android 手机桌面、状态栏、通知中心。
- 微信、微博、小红书、X平台等本地模拟应用。
- 应用切换、返回、未读通知和本地状态保存。
- 相册、钱包、浏览器、日历、备忘录等入口。

## 目录结构

仓库根目录提供 SillyTavern 所需的 `manifest.json`。实际扩展脚本与样式位于：

- `X-Phone-Simulator-Extension/index.js`
- `X-Phone-Simulator-Extension/style.css`

## 使用提示

让角色在需要展示手机入口的回复中输出以下任一标记：

- `[[PHONE]]`
- `【打开手机】`

扩展会在该条 AI 消息下方添加“展开手机”按钮。

## 数据与隐私

所有应用内容均为本地虚构模拟，不会连接真实微信、微博、小红书或 X平台服务。消息、动态、点赞、弹幕、关注、礼物和充值都只修改本地模拟状态，不会发生真实支付。扩展不会自动读取或修改角色卡 JSON。

## 手动安装

如果不使用 URL 安装，可将仓库克隆到 SillyTavern 的扩展目录。请确保仓库根目录的 `manifest.json` 保留在扩展文件夹根部。

## 许可

代码按 AGPL-3.0-or-later 提供，详见 `X-Phone-Simulator-Extension/LICENSE`。
