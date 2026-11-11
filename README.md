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

当前版本：**1.1.59**

扩展源文件：`index.js`、`style.css`、`manifest.json`。


### 1.1.59
- Keep the external close button aligned with the phone when the window is repositioned using keyboard arrow keys.

### 1.1.58
- Add an external close button at the phone's upper-right corner; keep it aligned while dragging or resizing the device.


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

### 1.1.27
- Rework WeChat with four functional tabs: Chats, Contacts, Discover, and Me.
- Add a local Moments feed with publishing, likes, and comments.
- Refresh WeChat list, navigation, profile, and conversation styling to better match the familiar WeChat visual hierarchy.


### 1.1.28
- Add local group creation from the WeChat Contacts tab, with existing contacts invited automatically.
- Group conversations show member counts and sender labels; add a chat-info view for groups and contacts.


### 1.1.29
- Add editable local contact names and notes from the chat information menu.
- Add simulated text, image, voice, and file message types to the WeChat composer; attachment types are represented locally without uploading files.


### 1.1.30
- Fix Android soft-keyboard viewport resizing so focusing an input does not permanently shrink the phone window.
- Restore phone geometry after input focus ends and keep focused fields visible inside the phone.
- Remove viewport-relative max-height from the inline phone screen to prevent its lower half collapsing on keyboard open.


### 1.1.31
- Expanded Xiaohongshu interactions: functional Recommend/Following/Nearby tabs, per-note follow/unfollow, favorites, and local comments.
- Persisted the new Xiaohongshu tab and following list; older saved posts are migrated safely with optional comment/favorite defaults.


### 1.1.32
- Add a draggable top-edge phone handle around the status bar / Dynamic Island area and persist the phone position.
- Resize the entire phone proportionally from the bottom-right corner, including the app desktop and all app screens.
- Keep the phone as a floating, rounded device on narrow screens instead of forcing a full-screen layout; fit the initial phone to the available viewport.


### 1.1.33
- Expand Weibo with recommendation/following/mine feeds, local creator follow state, a personal profile summary, structured local comments, and functional repost records.


### 1.1.34
- Expand X platform with recommendation/following/category feeds, local dynamic publishing, likes, comments, creator following, multiple live-room entries, and a local profile summary.


### 1.1.35
- Replace hard-coded user identity with `{{user}}` and main-character references with `{{char}}`; remove character-card-specific naming from default X platform content for cross-card reuse.

### 1.1.36
- Add an on-device system settings page for current SillyTavern context detection, context-scope toggles, and API configuration.
- Store system/API settings separately from per-chat simulator data; API keys are not written to chat metadata.
- Add an OpenAI-compatible API connectivity test; the SillyTavern generation bridge remains the next integration step.


### 1.1.37
- Remove built-in role-specific NPCs and sample social content from fresh chat defaults; empty contacts and feeds are now valid states.
- Add explicit current-story import using SillyTavern `generateQuietPrompt()` and the active chat context.
- Import character-card fields, recent chat messages, and available character-book data according to context toggles; generated contacts and posts are stored only in the current chat metadata.
- Add current chat context status and role-aware import controls to the phone settings page.

### 1.1.38
- Correct the SillyTavern generation/import helper placement and verify top-level event handlers can call it.
- Abort context imports if the active chat changes while generation is in progress, preventing cross-chat data leakage.
- Use the documented `generateQuietPrompt()` availability check for the built-in SillyTavern API mode.

### 1.1.39
- Use SillyTavern `generateRaw()` for context import so the user's context-scope switches are respected and unrelated chat prompt content is not implicitly attached.
- Load selected global World Info books through the documented context API and include only selected entries plus the active card's embedded character book.
- Keep the context import payload explicitly limited to the chosen character-card fields, selected worldbooks, and configured recent chat messages.


### 1.1.40
- Fix whole-device resizing by preserving the phone's native aspect ratio and scaling the complete screen content to exactly fit the shell.
- Resize the frame, status bar, desktop icons, app pages, and bottom navigation together without leaving unused blank space.
- Keep the resized device within the visible viewport and preserve the saved size.


### 1.1.41
- Make story-context re-import merge-safe: retain manually created contacts, chat history, Moments, Weibo, Xiaohongshu, and X posts.
- Refresh only X-OS-tagged imported records, preserve user edits and conversations, and avoid duplicate imported social posts.
- Keep imported contacts and posts scoped to the active SillyTavern chat metadata.


### 1.1.42
- Route story-derived social posts to WeChat Moments, Weibo, Xiaohongshu, or X according to their content type instead of placing every post in X.
- Keep platform-specific post structures and interaction fields compatible with each app.
- Show per-platform import counts in the current-chat import summary.


### 1.1.43
- Extract story-supported livestream rooms only when a current card, selected worldbook, or chat explicitly establishes an active/planned stream.
- Render extracted rooms in the X Platform live list and room view; avoid invented viewer counts and heat for story-derived rooms.
- Keep a neutral generic current-character room fallback without hardcoded sample hosts or fixed NPC streamers.


### 1.1.44
- Import only explicitly evidenced livestream chat/barrage lines from the active story context and attach them to their matching room.
- Scope locally sent barrages to the currently open room and keep messages from separate rooms isolated.
- Display unknown viewer counts and heat as “not recorded” rather than rendering misleading zero values; show room descriptions and a proper empty state.


### 1.1.45
- Correct the inner phone screen offset so the scaled desktop and app content align with the phone frame instead of being shifted right/down and clipped.
- Remove the two visible diagonal marks from the bottom-right resize handle while retaining its pointer and keyboard resizing behavior.


### 1.1.46
- Fix persistence of story-imported livestream rooms and import summary when reopening the same chat.
- Keep chat-specific X-OS data out of the global local-storage fallback, preventing story data from leaking when SillyTavern has no active chat context.
- Scope locally simulated gift messages to the currently open livestream room.
- Report the number of livestream messages actually imported after validation and deduplication.


### 1.1.47
- Remove fabricated default viewer and heat counts from the generic livestream room; unknown values remain explicitly unrecorded instead of displaying zero or sample numbers.


### 1.1.48
- Start with an empty X-platform following list instead of automatically following the `{{char}}` template macro.
- Sanitize legacy saved following lists to remove `{{user}}` and `{{char}}` macros; template placeholders are not creator accounts.


### 1.1.49
- Fix persistence migration for creator-following lists: Weibo, Xiaohongshu, and X following arrays are now restored as strings instead of being incorrectly filtered as object records.
- Preserve the existing cleanup of `{{user}}` and `{{char}}` template macros from X following.


### 1.1.50
- Guard the WeChat conversation renderer when the selected contact no longer exists or the address book is empty. Show a recoverable empty state instead of throwing and breaking the phone screen.


### 1.1.50
- Track livestream follows independently by room instead of sharing one global follow toggle.
- Migrate the legacy single follow flag to its previously active room when loading older saves.


### 1.1.51
- Remove the white phone title strip and bottom navigation strip from both floating and inline phone views; retain the status area, app-level back actions, and resize/drag handles.
- Hide visible vertical and horizontal scrollbars throughout the phone while preserving scrolling and touch gestures.
- Restyle Notes, Calendar, and Wallet with iOS-inspired layouts; add month navigation and year/month-aware calendar events while keeping legacy date-only entries visible.
- Redesign the in-simulator browser start page with a Safari-inspired address/search bar and favorites. External websites still open in the device browser and are rendered by that browser, not by X-OS.


### 1.1.52
- Add a bottom gesture-navigation pill to floating and inline phone views.
- A single tap triggers Back; two quick taps return directly to the phone home screen.


### 1.1.53
- Improve gesture navigation accessibility with Enter/Space keyboard activation and visible focus feedback.
- Isolate double-tap recognition per navigation pill so taps on separate phone views are not combined.


### 1.1.54
- Replace non-functional Safari-style bottom toolbar icons with a clear note explaining that links open in the device's default browser.


### 1.1.55
- Validate calendar dates against the selected month, including leap years, instead of silently clamping invalid days.
- Show a local notification when a submitted calendar date is invalid.


### 1.1.56
- Preserve explicitly entered zero/invalid year or month values for validation instead of silently replacing them with the current date.
- Persist the calendar validation notification so it remains available after navigating away.
