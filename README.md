# X手机模拟器（X-OS）

适用于 SillyTavern 的独立 UI 扩展。手机模拟器与角色卡分离，扩展不会读取、修改或上传角色卡 JSON。

## 安装

1. 打开 SillyTavern。
2. 进入 **Extensions（扩展） → Install Extension（安装扩展）**。
3. 在 Git Repository URL 中粘贴：

   `https://github.com/muyamu505-gif/X-OS`

4. 安装完成后刷新 SillyTavern 页面。

需要安装 Git，并使用支持第三方扩展的 SillyTavern 版本（最低版本以 manifest.json 为准）。

## 功能

- 桌面悬浮入口，以及 AI 消息标记 `[[PHONE]]` / `【打开手机】` 展开内嵌手机。
- 浅灰蓝 Android 风格系统界面、通知中心、应用切换和返回导航。
- 微信：联系人、聊天记录和本地发送消息。
- 微博、小红书：动态浏览、点赞、评论与发布模拟内容。
- X 平台：直播大厅、直播间弹幕、关注和模拟礼物。
- 相册：素材条目、分类与收藏。
- 浏览器：模拟搜索与应用内跳转。
- 日历：添加日程；备忘录：自动保存。
- 聊天数据优先保存于当前 SillyTavern 聊天元数据。

## 数据与隐私

所有社交内容、直播互动、礼物和钱包余额均为本地剧情模拟，不连接真实社交平台、支付渠道或外部 API。不要将模拟钱包视为真实账户。

## 版本

当前版本：**1.1.1**

扩展源文件：`index.js`、`style.css`、`manifest.json`。


### 1.1.2
- Fixed phone window viewport positioning and edge clipping on mobile.
- Reduced the default floating phone size and added a draggable bottom-right resize handle with saved dimensions.


### 1.1.3
- Hardened the phone modal overlay and shell against host-theme/mobile CSS overrides.
- Reduced the default phone size and enforced viewport-safe bounds.


### 1.1.4
- Fixed inline phone insertion inside message text flow and constrained its layout to a centered, self-contained device.


### 1.1.5
- Rebuilt floating phone viewport sizing with explicit pixel dimensions for Android WebViews.
- Portaled the floating phone overlay to the document root to avoid host layout clipping.


### 1.1.12
- Restored a persistent floating phone launcher with draggable placement, edge docking, and saved position.
- Added a high-visibility top-layer launcher and retained extension settings/top-bar entry points.


### 1.1.12
- Rebuilt the extension script from the last clean source to remove malformed appended code that prevented initialization.
- Restored a draggable, edge-docking floating launcher with saved position and settings/top-bar fallback.
- Added viewport-safe modal sizing and bottom-right drag resizing.


### 1.1.12
- Replaced the browser-native reset confirmation with an in-extension confirmation panel for a consistent mobile experience.


### 1.1.12
- Escape closes an open in-phone dialog before closing the phone window.
- Added keyboard resizing with arrow keys (Shift for larger steps) and a visible focus indicator.


### 1.1.12
- Write the latest simulator snapshot into the active chat metadata immediately, while keeping the disk save debounced. This reduces the chance of losing the last interaction when switching chats quickly.

### 1.1.12
- Reconnect the chat message observer when SillyTavern replaces its chat container, so inline phone markers continue to be detected after chat UI lifecycle changes.

### 1.1.12
- Keep modal actions bound to the phone surface that opened them. Submissions and Escape/close actions can no longer accidentally affect a dialog in the other phone view (floating phone vs. inline chat phone).
