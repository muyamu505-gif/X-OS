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

当前版本：**1.1.26**

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


### 1.1.20
- Restored a persistent floating phone launcher with draggable placement, edge docking, and saved position.
- Added a high-visibility top-layer launcher and retained extension settings/top-bar entry points.


### 1.1.20
- Rebuilt the extension script from the last clean source to remove malformed appended code that prevented initialization.
- Restored a draggable, edge-docking floating launcher with saved position and settings/top-bar fallback.
- Added viewport-safe modal sizing and bottom-right drag resizing.


### 1.1.20
- Replaced the browser-native reset confirmation with an in-extension confirmation panel for a consistent mobile experience.


### 1.1.20
- Escape closes an open in-phone dialog before closing the phone window.
- Added keyboard resizing with arrow keys (Shift for larger steps) and a visible focus indicator.


### 1.1.20
- Write the latest simulator snapshot into the active chat metadata immediately, while keeping the disk save debounced. This reduces the chance of losing the last interaction when switching chats quickly.

### 1.1.20
- Reconnect the chat message observer when SillyTavern replaces its chat container, so inline phone markers continue to be detected after chat UI lifecycle changes.

### 1.1.20
- Keep modal actions bound to the phone surface that opened them. Submissions and Escape/close actions can no longer accidentally affect a dialog in the other phone view (floating phone vs. inline chat phone).

### 1.1.20
- Validate restored saved state before rendering: reject malformed collection types, constrain page names, normalize navigation history, repair invalid selected contacts, and restore starter contacts/chat arrays if a save is damaged.

### 1.1.20
- Keep informational dialogs scoped to the phone surface that opened them, so they do not cancel another surface's pending form.
- Route notification taps to the matching simulated app (including Xiaohongshu, live room, wallet, photos, calendar, notes, and browser); unknown app labels remain in the notification center.

### 1.1.20
- Prevent notification ID collisions during rapid updates and cap local message, post, photo, and calendar histories to keep saved state bounded.
- Escape saved IDs and album labels in rendered data attributes, and persist photo-album selection immediately.

### 1.1.20
- Make the floating phone respect the actual visual viewport on short screens and landscape layouts; reduce the minimum resizable shell dimensions so the phone remains reachable instead of being forced taller than the screen.

### 1.1.20
- Automatically restore the floating launcher, top-bar shortcut, and extension-settings entry if SillyTavern mounts or re-renders its interface after the extension starts. Explicitly enforce launcher visibility and clickability.

### 1.1.20
- Keep the area around the phone transparent instead of dimming it with gray side panels.
- Remove the top-bar phone shortcut; retain the floating phone launcher as the only global shortcut.
- Remove the home-screen common-app dock while keeping the main app grid.
- Browser searches now open Google results or a directly entered URL in a new external-browser tab/window, without re-rendering or closing the simulator.
- Add live contact filtering in WeChat and refine visual presentation across the simulated apps.

### 1.1.20
- Add live filtering for Weibo posts, photo-record deletion, calendar-event deletion, and a live character count for Notes.
- Make X Platform's featured live cards and bottom navigation actionable, routing to the live room, notifications, and wallet.

### 1.1.20
- Add persistent local wallet transaction history; each successful simulated gift records its amount and time, and the wallet shows recent entries.
- Add individual notification deletion and a clear-all action while retaining mark-all-read.


### 1.1.21
- Add per-message deletion in WeChat conversations and a clear empty-chat state.
- Add a back-to-conversation-list control in the chat header.


### 1.1.22
- Add a dedicated confirmation step before clearing all messages in the currently open WeChat conversation.


### 1.1.23
- Improve WeChat search so it matches all messages in each conversation, not only the latest preview.
- Show a clear empty state when no contact or conversation matches the search.

### 1.1.24
- Move a contact to the top of the WeChat conversation list after sending a message.
- Prevent duplicate WeChat contacts with the same name (case-insensitive); show a notification instead.


### 1.1.25
- Escape saved social-post style and counter fields before rendering, and tolerate incomplete author data in restored Weibo posts.


### 1.1.26
- Add a home-screen shortcut for Notes so the existing memo editor and autosave feature are directly accessible.
