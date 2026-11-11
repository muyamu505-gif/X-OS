/* X手机模拟器 - SillyTavern UI Extension
 * All content is local fiction. No external social platform APIs are contacted.
 */
(() => {
  'use strict';

  const EXT_ID = 'x-phone-simulator';
  const META_KEY = 'xPhoneSimulatorState';
  const DEFAULT_STATE = {
    page: 'home',
    app: null,
    stack: [],
    selectedContact: null,
    notifications: [
      { id: 'n1', app: '微信', title: '林知夏', body: '你今天晚上还开播吗？我有事找你。', time: '09:32', unread: true },
      { id: 'n2', app: '微博', title: '实时热搜', body: '你的关注有 3 条新动态', time: '08:57', unread: true }
    ],
    contacts: [
      { id: 'lin', name: '林知夏', note: '好友', avatar: '知', online: true },
      { id: 'zhou', name: '周予安', note: '特别关注', avatar: '周', online: false },
      { id: 'group', name: '深夜摸鱼小分队', note: '群聊 · 6人', avatar: '群', online: true }
    ],
    chats: {
      lin: [
        { from: 'them', text: '你今天晚上还开播吗？我有事找你。', time: '09:32' },
        { from: 'me', text: '还没确定，怎么啦？', time: '09:34' },
        { from: 'them', text: '没什么，就是刷到你昨晚的直播切片了。', time: '09:35' }
      ],
      zhou: [{ from: 'them', text: '有空看一下我发你的链接。', time: '昨天' }],
      group: [{ from: 'them', text: '今晚有人一起打游戏吗？', time: '09:10' }]
    },
    weiboPosts: [
      { id: 'w1', user: '娱乐显微镜', avatar: '娱', text: '昨晚深夜直播间又出现了新话题？评论区已经吵起来了。', tag: '#直播间观察#', likes: 2381, comments: 462, liked: false },
      { id: 'w2', user: '今天也要开心', avatar: '今', text: '感觉最近大家都在讨论主播和粉丝之间的边界感。', tag: '#网络社交#', likes: 806, comments: 93, liked: false }
    ],
    redPosts: [
      { id: 'r1', user: '一颗晚睡的栗子', title: '深夜直播桌面布置分享', desc: '暖光灯、麦克风和一杯冰美式，记录一点日常。', likes: 1280, liked: false, color: 'peach' },
      { id: 'r2', user: '穿搭备忘录', title: '秋冬通勤穿搭｜简单但有氛围', desc: '最近很喜欢低饱和的日常搭配。', likes: 926, liked: false, color: 'sage' }
    ],
    followed: false,
    liveMessages: [
      { user: '汽水不加冰', text: '主播晚上好！' },
      { user: '晚风', text: '今天是闲聊局吗' },
      { user: '匿名观众', text: '刚从推荐页进来' },
      { user: '知更鸟', text: '这个背景音乐好听' }
    ],
    liveViewers: 128436,
    liveHeat: 865200,
    wallet: 8888,
    giftsSent: 0,
    walletTransactions: [],
    notes: '这里可以记录临时备忘。',
    browserUrl: '',
    browserQuery: '',
    browserResults: [],
    photos: [
      { id: 'p1', album: '截图', title: '直播间数据截图', detail: '昨晚直播结束后的数据记录', date: '今天 00:18' },
      { id: 'p2', album: '直播素材', title: '开播封面草稿', detail: '深夜闲聊主题封面构思', date: '昨天 21:06' },
      { id: 'p3', album: '最近项目', title: '桌面布置灵感', detail: '暖光灯与麦克风摆放参考', date: '昨天 16:42' }
    ],
    selectedAlbum: '最近项目',
    calendar: [
      { day: '11', title: '晚上 20:00', desc: '直播计划（待确认）' },
      { day: '13', title: '周五', desc: '和朋友吃饭' }
    ]
  };

  let state = structuredCloneSafe(DEFAULT_STATE);
  let overlay, phoneScreen, chatObserver, observedChat, lastChatKey = '';
  let ctx = null;
  let saveTimer = null;
  let initialized = false;
  let contextReady = false;
  let boundEventSource = null;
  let pendingDialog = null;
  let notificationSequence = 0;

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function currentContext() {
    try { return window.SillyTavern?.getContext?.() || null; } catch { return null; }
  }

  function mergeDefaults(saved) {
    const base = structuredCloneSafe(DEFAULT_STATE);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return base;
    const arrayKeys = ['stack', 'notifications', 'contacts', 'weiboPosts', 'redPosts', 'liveMessages', 'browserResults', 'photos', 'calendar', 'walletTransactions'];
    const objectKeys = ['chats'];
    const stringKeys = ['page', 'selectedContact', 'notes', 'browserUrl', 'browserQuery', 'selectedAlbum'];
    const booleanKeys = ['followed'];
    const numberKeys = ['liveViewers', 'liveHeat', 'wallet', 'giftsSent'];
    for (const key of arrayKeys) {
      if (Array.isArray(saved[key])) base[key] = saved[key].filter(item => item && typeof item === 'object' && !Array.isArray(item));
    }
    for (const key of stringKeys) if (typeof saved[key] === 'string' || saved[key] === null && key === 'selectedContact') base[key] = saved[key];
    for (const key of booleanKeys) if (typeof saved[key] === 'boolean') base[key] = saved[key];
    for (const key of numberKeys) if (Number.isFinite(saved[key])) base[key] = saved[key];
    for (const key of objectKeys) {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        base[key] = Object.fromEntries(Object.entries(saved[key]).filter(([, messages]) => Array.isArray(messages)).map(([id, messages]) => [id, messages.filter(message => message && typeof message === 'object' && !Array.isArray(message))]));
      }
    }
    const pages = new Set(['home', 'notifications', 'wechat', 'chat', 'weibo', 'red', 'xplatform', 'live', 'wallet', 'photos', 'browser', 'calendar', 'notes']);
    if (!pages.has(base.page)) base.page = 'home';
    // The chat renderer always needs a contact to display; recover the built-in
    // starter contacts if an old or damaged save contains an empty contact list.
    if (!base.contacts.length) base.contacts = structuredCloneSafe(DEFAULT_STATE.contacts);
    const contactIds = new Set(base.contacts.map(contact => String(contact.id)));
    if (!contactIds.has(base.selectedContact)) base.selectedContact = base.contacts[0]?.id || null;
    base.contacts.forEach((contact, index) => {
      if (typeof contact.id !== 'string' || !contact.id) contact.id = `recovered-contact-${index + 1}`;
      if (typeof contact.name !== 'string') contact.name = '未命名联系人';
      if (typeof contact.avatar !== 'string') contact.avatar = contact.name.slice(0, 1);
      if (!Array.isArray(base.chats[contact.id])) base.chats[contact.id] = [];
    });
    base.stack = base.stack.filter(entry => entry && typeof entry.page === 'string' && pages.has(entry.page)).map(entry => ({
      page: entry.page,
      app: typeof entry.app === 'string' ? entry.app : null,
      selectedContact: typeof entry.selectedContact === 'string' ? entry.selectedContact : null
    }));
    return base;
  }

  function loadState() {
    const context = currentContext();
    ctx = context;
    const fromChat = context?.chatMetadata?.[META_KEY];
    try {
      // Chat metadata is the source of truth. Use local fallback only outside an active ST chat context.
      const local = context ? null : JSON.parse(localStorage.getItem(`${EXT_ID}:fallback`) || 'null');
      state = mergeDefaults(fromChat || local);
    } catch { state = mergeDefaults(fromChat); }
  }

  function persistState() {
    const snapshot = structuredCloneSafe(state);
    try { localStorage.setItem(`${EXT_ID}:fallback`, JSON.stringify(snapshot)); } catch { /* storage may be disabled */ }
    const contextAtChange = currentContext();
    const metadataAtChange = contextAtChange?.chatMetadata;
    const chatIdAtChange = contextAtChange?.chatId;
    // Update the active chat's metadata immediately. If the user switches chats
    // during the debounce window, the latest state is still attached to the old chat object.
    if (metadataAtChange) metadataAtChange[META_KEY] = snapshot;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const activeContext = currentContext();
      // Never let a delayed save from the previous chat overwrite the newly opened chat.
      if (!contextAtChange?.chatMetadata || activeContext?.chatMetadata !== metadataAtChange || activeContext?.chatId !== chatIdAtChange) return;
      try { await activeContext.saveMetadata?.(); } catch (error) { console.warn(`[${EXT_ID}] chat metadata save failed`, error); }
    }, 350);
  }

  function setPage(page, app = state.app, push = true) {
    if (push && state.page !== page) state.stack.push({ page: state.page, app: state.app, selectedContact: state.selectedContact });
    state.page = page;
    state.app = app;
    renderScreen();
    persistState();
  }

  function goBack() {
    const previous = state.stack.pop();
    if (previous) {
      state.page = previous.page;
      state.app = previous.app;
      state.selectedContact = previous.selectedContact;
    } else {
      state.page = 'home'; state.app = null; state.selectedContact = null;
    }
    renderScreen(); persistState();
  }

  function openPhone(page = 'home') {
    if (!overlay) buildOverlay();
    updateOverlayGeometry();
    overlay.classList.add('xphone-open');
    overlay.style.setProperty('display', 'flex', 'important');
    overlay.setAttribute('aria-hidden', 'false');
    if (page === 'home') { state.page = 'home'; state.app = null; state.stack = []; }
    renderScreen();
    persistState();
  }

  function closePhone() {
    if (!overlay) return;
    overlay.classList.remove('xphone-open');
    overlay.style.setProperty('display', 'none', 'important');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'xphone-overlay';
    overlay.className = 'xphone-overlay';
    overlay.style.cssText = 'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;display:none;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;padding:12px!important;overflow:hidden!important;isolation:isolate!important;margin:0!important;';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="xphone-backdrop" aria-hidden="true"></div>
      <section class="xphone-shell" role="dialog" aria-modal="true" aria-label="手机模拟器" style="width:320px;height:620px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);">
        <div class="xphone-notch"><span></span></div>
        <div class="xphone-status"><span class="xp-clock">09:41</span><span class="xp-status-right">5G　●●●　▰</span></div>
        <header class="xphone-header"><button class="xp-head-btn" data-action="back" aria-label="返回">‹</button><div class="xp-head-title">手机</div><button class="xp-head-btn" data-action="notifications" aria-label="通知">♧<i class="xp-notice-dot"></i></button></header>
        <main class="xphone-screen" id="xphone-screen"></main>
        <nav class="xphone-bottom-nav"><button data-action="back">‹</button><button data-action="home">○</button><button data-action="close">×</button></nav>
        <div class="xphone-resize-handle" role="button" tabindex="0" aria-label="拖动右下角调整手机大小" title="拖动调整大小"></div>
      </section>`;
    document.documentElement.appendChild(overlay);
    phoneScreen = overlay.querySelector('#xphone-screen');
    phoneScreen.style.cssText = 'flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;';
    attachPhoneResize(overlay.querySelector('.xphone-shell'));
    window.addEventListener('resize', updateOverlayGeometry);
    window.visualViewport?.addEventListener('resize', updateOverlayGeometry);
    overlay.addEventListener('click', handleClick);
    overlay.addEventListener('submit', handleSubmit);
    overlay.addEventListener('input', handleInput);
    overlay.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const dialog = event.target.closest('.xphone-shell, .xp-inline-device')?.querySelector('.xp-action-dialog');
      if (dialog) {
        dialog.remove();
        const root = event.target.closest('.xphone-shell, .xp-inline-device');
        if (pendingDialog?.root === root) pendingDialog = null;
        event.stopPropagation();
      } else {
        closePhone();
      }
    });
    updateClock();
    setInterval(updateClock, 30000);
  }

  function updateOverlayGeometry() {
    if (!overlay) return;
    const width = Math.max(1, document.documentElement.clientWidth || window.innerWidth || 360);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 640);
    overlay.style.setProperty('width', width + 'px', 'important');
    overlay.style.setProperty('height', height + 'px', 'important');
    overlay.style.setProperty('top', '0px', 'important');
    overlay.style.setProperty('left', '0px', 'important');
    const shell = overlay.querySelector('.xphone-shell'); if (!shell) return;
    const maxW = Math.max(220, width - 24), maxH = Math.max(220, height - 24);
    const w = Math.min(Math.max(220, parseFloat(shell.style.width) || 320), maxW), h = Math.min(Math.max(220, parseFloat(shell.style.height) || 620), maxH);
    shell.style.width = w + 'px'; shell.style.height = h + 'px';
    shell.style.setProperty('max-width', maxW + 'px', 'important'); shell.style.setProperty('max-height', maxH + 'px', 'important');
  }

  function attachPhoneResize(shell) {
    const key = `${EXT_ID}:windowSize`, minW = 220, minH = 220;
    const clamp = (w,h) => ({width:Math.min(Math.max(minW,(document.documentElement.clientWidth||innerWidth)-24),Math.max(minW,w)),height:Math.min(Math.max(minH,(window.visualViewport?.height||innerHeight)-24),Math.max(minH,h))});
    try { const saved=JSON.parse(localStorage.getItem(key)||'null'); if(saved&&Number.isFinite(saved.width)&&Number.isFinite(saved.height)){const z=clamp(saved.width,saved.height);shell.style.width=z.width+'px';shell.style.height=z.height+'px';} } catch(_) {}
    const h=shell.querySelector('.xphone-resize-handle'); if(!h)return; let d=null;
    h.addEventListener('pointerdown',e=>{const r=shell.getBoundingClientRect();d={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height};try{h.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
    h.addEventListener('pointermove',e=>{if(!d||d.id!==e.pointerId)return;const z=clamp(d.w+e.clientX-d.x,d.h+e.clientY-d.y);shell.style.width=z.width+'px';shell.style.height=z.height+'px';});
    const finish=e=>{if(!d||(e.pointerId!==undefined&&d.id!==e.pointerId))return;const r=shell.getBoundingClientRect();try{localStorage.setItem(key,JSON.stringify({width:Math.round(r.width),height:Math.round(r.height)}));}catch(_){}d=null;updateOverlayGeometry();};
    h.addEventListener('pointerup',finish);h.addEventListener('pointercancel',finish);
    h.addEventListener('keydown',e=>{
      if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
      e.preventDefault();
      const r=shell.getBoundingClientRect(),step=e.shiftKey?48:16;
      const dw=e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0;
      const dh=e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0;
      const z=clamp(r.width+dw,r.height+dh);
      shell.style.width=z.width+'px';shell.style.height=z.height+'px';
      try{localStorage.setItem(key,JSON.stringify({width:Math.round(z.width),height:Math.round(z.height)}));}catch(_){}
    });
  }

  function updateClock() {
    if (!overlay) return;
    const el = overlay.querySelector('.xp-clock');
    if (el) el.textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const dot = overlay.querySelector('.xp-notice-dot');
    if (dot) dot.style.display = state.notifications.some(n => n.unread) ? 'block' : 'none';
  }

  function appIcon(id, label, symbol, color, badge = '') {
    return `<button class="xp-app-icon" data-app="${id}"><span class="xp-app-glyph" style="--app-color:${color}">${symbol}${badge ? `<i>${badge}</i>` : ''}</span><span>${label}</span></button>`;
  }

  function renderHome() {
    const unread = state.notifications.filter(n => n.unread).length;
    return `<div class="xp-wallpaper">
      <div class="xp-home-date"><div class="xp-date-small">${new Intl.DateTimeFormat('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</div><div class="xp-date-large">${new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())}</div><div class="xp-weather">晴朗 · 18°　　${unread ? `${unread} 条未读通知` : '今天也要有好心情'}</div></div>
      <button class="xp-widget" data-action="notifications"><span class="xp-widget-label">通知中心</span><strong>${unread ? `${unread} 条新消息` : '暂无新通知'}</strong><small>点击查看消息提醒</small></button>
      <div class="xp-app-grid">
        ${appIcon('wechat', '微信', '聊', '#19a66a', state.notifications.some(n => n.app === '微信' && n.unread) ? '1' : '')}
        ${appIcon('weibo', '微博', '微', '#e84a54')}
        ${appIcon('red', '小红书', '书', '#e65b63')}
        ${appIcon('xplatform', 'X平台', 'X', '#24272c')}
        ${appIcon('photos', '相册', '▧', '#b5a0e7')}
        ${appIcon('wallet', '钱包', '¥', '#d7a64d')}
        ${appIcon('browser', '浏览器', '◉', '#4d9cce')}
        ${appIcon('calendar', '日历', '日', '#e46b55')}
      </div>
      </div>`;
  }

  function renderNotifications() {
    const rows = state.notifications.map(n => `<div class="xp-notification-row"><button class="xp-notification ${n.unread ? 'is-unread' : ''}" data-notice="${escapeHtml(n.id)}"><span class="xp-notice-app">${escapeHtml(n.app)}</span><span class="xp-notice-main"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.body)}</span></span><time>${escapeHtml(n.time)}</time></button><button class="xp-notice-delete" data-delete-notice="${escapeHtml(n.id)}" aria-label="删除通知">×</button></div>`).join('');
    return `<section class="xp-page xp-notifications"><div class="xp-page-title">通知中心</div><div class="xp-muted">${state.notifications.filter(n => n.unread).length} 条未读 · 共 ${state.notifications.length} 条</div>${rows || '<div class="xp-empty">暂时没有通知</div>'}<div class="xp-notice-tools"><button class="xp-text-btn" data-action="clear-notices">全部标为已读</button><button class="xp-text-btn" data-action="delete-all-notices">清空通知</button></div></section>`;
  }

  function renderWechat() {
    const rows = state.contacts.map(c => {
      const msgs = state.chats[c.id] || [];
      const last = msgs[msgs.length - 1];
      return `<button class="xp-contact" data-contact="${escapeHtml(c.id)}"><span class="xp-avatar xp-avatar-green">${escapeHtml(c.avatar)}</span><span class="xp-contact-main"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(last?.text || c.note)}</small></span><time>${escapeHtml(last?.time || '')}</time></button>`;
    }).join('');
    return `<section class="xp-page xp-wechat"><div class="xp-appbar"><div><div class="xp-app-title">微信</div><small>消息</small></div><button class="xp-circle-btn" data-action="wechat-add">＋</button></div><div class="xp-search"><span>⌕</span><input type="search" data-contact-search placeholder="搜索联系人和聊天记录"></div>${rows}<div class="xp-empty" data-contact-empty hidden>没有找到联系人或聊天记录</div><div class="xp-bottom-tabs"><span class="active">微信</span><span>通讯录</span><span>发现</span><span>我</span></div></section>`;
  }

  function renderChat() {
    const contact = state.contacts.find(c => c.id === state.selectedContact) || state.contacts[0];
    const msgs = state.chats[contact.id] || [];
    const bubbles = msgs.map((m, index) => `<div class="xp-chat-row ${m.from === 'me' ? 'mine' : ''}"><span class="xp-chat-avatar">${m.from === 'me' ? '我' : escapeHtml(contact.avatar)}</span><div class="xp-chat-bubble">${escapeHtml(m.text)}<small>${escapeHtml(m.time || '')}</small></div><button type="button" class="xp-chat-delete" data-delete-chat-message="${index}" aria-label="删除这条消息" title="删除消息">×</button></div>`).join('');
    return `<section class="xp-page xp-chat-page"><div class="xp-chat-title"><button type="button" data-action="wechat-list" aria-label="返回微信">‹</button><span>${escapeHtml(contact.name)}<small>${contact.online ? '在线' : '最近在线'}</small></span><button type="button" class="xp-chat-clear" data-action="clear-chat" aria-label="清空聊天记录" title="清空聊天记录">清空</button></div><div class="xp-chat-history">${bubbles || '<div class="xp-empty">还没有聊天记录</div>'}</div><form class="xp-chat-compose" data-form="wechat"><input name="message" autocomplete="off" placeholder="发送消息…" maxlength="300"><button type="submit">发送</button></form></section>`;
  }

  function renderWeibo() {
    const posts = state.weiboPosts.map(p => `<article class="xp-social-post" data-post-id="${escapeHtml(p.id)}"><div class="xp-post-author"><span class="xp-avatar xp-avatar-red">${escapeHtml(p.avatar || p.user?.[0] || '用')}</span><strong>${escapeHtml(p.user)}</strong><small>刚刚</small></div><p>${escapeHtml(p.text)}</p><a class="xp-hashtag">${escapeHtml(p.tag)}</a>${p.lastComment ? `<div class="xp-last-comment"><b>最新评论：</b>${escapeHtml(p.lastComment)}</div>` : ''}<div class="xp-post-actions"><button data-like-post="${escapeHtml(p.id)}" class="${p.liked ? 'is-liked' : ''}">♡ ${escapeHtml(p.likes)}</button><button data-action="weibo-comment">评论 ${escapeHtml(p.comments)}</button><button data-action="share">转发</button></div></article>`).join('');
    return `<section class="xp-page xp-weibo"><div class="xp-appbar"><div class="xp-app-title xp-weibo-brand">微博</div><button class="xp-circle-btn" data-action="weibo-compose">＋</button></div><div class="xp-social-search"><span>⌕</span><input type="search" data-weibo-search placeholder="搜索用户、动态或话题"></div><div class="xp-hot-search"><strong>热搜榜</strong><span>1　直播间新话题　热</span><span>2　主播互动边界讨论　沸</span><span>3　深夜闲聊切片　新</span></div>${posts}</section>`;
  }

  function renderRed() {
    const posts = state.redPosts.map(p => `<article class="xp-red-card"><div class="xp-red-cover ${escapeHtml(p.color)}"><span>生活灵感</span></div><div class="xp-red-card-body"><strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.desc)}</p><div><small>${escapeHtml(p.user)}</small><button data-like-red="${escapeHtml(p.id)}" class="${p.liked ? 'is-liked' : ''}">♡ ${escapeHtml(p.likes)}</button></div></div></article>`).join('');
    return `<section class="xp-page xp-red"><div class="xp-appbar"><div class="xp-app-title xp-red-brand">小红书</div><button class="xp-circle-btn" data-action="red-compose">＋</button></div><div class="xp-red-tabs"><b>推荐</b><span>关注</span><span>附近</span></div>${posts}</section>`;
  }

  function renderXPlatform() {
    return `<section class="xp-page xp-xplatform"><div class="xp-x-top"><div class="xp-x-logo">X</div><div><strong>X平台</strong><small>综合直播社区</small></div><button data-action="notifications">♧</button></div><div class="xp-x-tabs"><b>推荐</b><span>关注</span><span>游戏</span><span>语音</span><span>颜值</span></div><article class="xp-live-card"><div class="xp-live-cover"><span class="xp-live-tag">● LIVE</span><span class="xp-live-count">${Number(state.liveViewers).toLocaleString('zh-CN')} 人在线</span><div class="xp-live-cover-title">深夜闲聊｜今天不想早睡</div></div><div class="xp-live-info"><strong>沉沦的直播间</strong><small>聊天 · 日常　　热度 ${Number(state.liveHeat).toLocaleString('zh-CN')}</small><button data-action="enter-live">进入直播间　›</button></div></article><div class="xp-x-section-title">热门直播</div><button type="button" class="xp-mini-live" data-action="enter-live"><span class="xp-mini-thumb game">GAME</span><span><b>今晚冲分车队</b><small>游戏 · 3.2万人在线</small></span><i>›</i></button><button type="button" class="xp-mini-live" data-action="enter-live"><span class="xp-mini-thumb voice">VOICE</span><span><b>深夜情绪电台</b><small>语音 · 8.6千人在线</small></span><i>›</i></button><div class="xp-x-bottom"><button type="button" data-action="x-home">首页</button><button type="button" data-action="follow">关注</button><button type="button" data-action="enter-live">＋</button><button type="button" data-action="notifications">消息</button><button type="button" data-action="wallet">我的</button></div></section>`;
  }

  function renderLive() {
    const lines = state.liveMessages.slice(-30).map(m => `<div class="xp-barrage"><b>${escapeHtml(m.user)}：</b>${escapeHtml(m.text)}</div>`).join('');
    return `<section class="xp-page xp-live-room"><div class="xp-live-video"><span class="xp-live-tag">● LIVE</span><span class="xp-live-video-label">主播画面区域</span><small>这里显示由剧情描述的直播画面</small></div><div class="xp-live-room-info"><div><strong>深夜闲聊｜今天不想早睡</strong><small>沉沦　·　聊天分区　·　${Number(state.liveViewers).toLocaleString('zh-CN')} 人在线</small></div><button data-action="follow" class="xp-follow ${state.followed ? 'following' : ''}">${state.followed ? '已关注' : '＋ 关注'}</button></div><div class="xp-live-metrics"><span>热度 <b>${Number(state.liveHeat).toLocaleString('zh-CN')}</b></span><span>本地模拟礼物 <b>${state.giftsSent}</b></span><span>余额 <b>${state.wallet}</b> 钻石</span></div><div class="xp-barrage-list">${lines}</div><form class="xp-live-compose" data-form="barrage"><input name="message" autocomplete="off" placeholder="和主播聊两句…" maxlength="100"><button type="submit">发送</button><button type="button" data-action="gift">礼物</button></form></section>`;
  }

  function renderWallet() {
    const records = (state.walletTransactions || []).slice(0,8).map(item => `<div class="xp-wallet-record"><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.time)}</small></span><strong class="${item.amount < 0 ? 'is-minus' : 'is-plus'}">${item.amount > 0 ? '+' : ''}${item.amount}</strong></div>`).join('');
    return `<section class="xp-page xp-wallet"><div class="xp-appbar"><div class="xp-app-title">钱包</div></div><div class="xp-wallet-card"><small>模拟账户余额</small><strong>${Number(state.wallet).toLocaleString('zh-CN')} <em>钻石</em></strong><span>仅供剧情模拟，不涉及真实支付</span></div><div class="xp-wallet-actions"><button data-action="wallet-record">完整账单</button><button data-action="wallet-recharge">模拟充值</button></div><div class="xp-section-heading">最近记录</div><div class="xp-wallet-records">${records || '<div class="xp-empty">暂无账单记录</div>'}</div><p class="xp-muted">本地模拟钱包不会连接任何支付渠道。</p></section>`;
  }

  function renderPhotos() {
    const albums = ['最近项目', '收藏', '截图', '下载', '直播素材', '其他'];
    const current = state.selectedAlbum || '最近项目';
    const items = (state.photos || []).filter(p => current === '最近项目' || p.album === current || (current === '收藏' && p.favorite));
    const tiles = albums.map((name, i) => `<button class="xp-photo-album ${current === name ? 'active' : ''}" data-album="${escapeHtml(name)}"><span class="xp-photo-album-art art-${i}">▧</span><b>${name}</b><small>${name === '最近项目' ? (state.photos || []).length : name === '收藏' ? (state.photos || []).filter(p => p.favorite).length : (state.photos || []).filter(p => p.album === name).length} 项</small></button>`).join('');
    const cards = items.map(p => `<article class="xp-photo-item"><div class="xp-photo-preview">${p.favorite ? '★' : '▧'}</div><div><b>${escapeHtml(p.title)}</b><small>${escapeHtml(p.detail || '')}</small><time>${escapeHtml(p.date || '')}</time></div><div class="xp-photo-actions"><button data-favorite-photo="${escapeHtml(p.id)}" title="收藏">${p.favorite ? '★' : '☆'}</button><button data-delete-photo="${escapeHtml(p.id)}" title="删除素材">删除</button></div></article>`).join('');
    return `<section class="xp-page xp-photos"><div class="xp-appbar"><div><div class="xp-app-title">相册</div><small>整理你的灵感与记录</small></div><span class="xp-photo-count">${(state.photos || []).length} 项</span></div><div class="xp-photo-albums">${tiles}</div><div class="xp-section-heading">${escapeHtml(current)} <small>${items.length} 项</small></div><div class="xp-photo-items">${cards || '<div class="xp-empty">这个相册还没有内容</div>'}</div><form class="xp-inline-add-form" data-form="photo"><input name="title" maxlength="36" placeholder="添加一条图片/素材记录" required><input name="detail" maxlength="80" placeholder="备注（可选）"><button type="submit">添加</button></form><p class="xp-muted">相册为本地素材索引，可记录图片名称与用途；不会读取设备私人照片。</p></section>`;
  }

  function renderBrowser() {
    const results = (state.browserResults || []).map(r => `<button class="xp-browser-result" data-browser-result="${escapeHtml(r.id)}"><span>${escapeHtml(r.site)}</span><b>${escapeHtml(r.title)}</b><small>${escapeHtml(r.desc)}</small></button>`).join('');
    return `<section class="xp-page xp-browser"><div class="xp-appbar"><div class="xp-app-title">浏览器</div><span class="xp-browser-private">外部网页搜索</span></div><form data-form="browser" class="xp-browser-form"><input name="url" value="${escapeHtml(state.browserQuery || '')}" placeholder="搜索网页或输入网址"><button type="submit">搜索</button></form><div class="xp-browser-home"><div class="xp-browser-logo">◉</div><strong>使用手机浏览器打开网页</strong><p>搜索内容会跳转到设备的外部浏览器，不会在模拟器里加载网页。</p><div class="xp-browser-shortcuts"><button type="button" data-browser-shortcut="https://www.google.com/">Google</button><button type="button" data-browser-shortcut="https://www.baidu.com/">百度</button><button type="button" data-browser-shortcut="https://www.bing.com/">Bing</button></div><div class="xp-browser-suggest"><span>提示</span><b>输入关键词进行 Google 搜索，或输入完整网址直接访问</b></div></div></section>`;
  }

  function renderCalendar() {
    const date = new Date();
    const year = date.getFullYear(), month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = [...Array(firstDay).fill(''), ...Array.from({length: days}, (_,i)=>String(i+1))];
    return `<section class="xp-page xp-calendar"><div class="xp-appbar"><div><div class="xp-app-title">日历</div><small>安排好每一个重要时刻</small></div><span class="xp-calendar-year">${year}</span></div><div class="xp-calendar-month">${year}年 ${month+1}月</div><div class="xp-calendar-week">日　一　二　三　四　五　六</div><div class="xp-calendar-grid">${cells.map(d=>`<span class="${d && state.calendar.some(e=>Number(e.day)===Number(d)) ? 'has-event' : ''} ${Number(d)===date.getDate() ? 'today' : ''}">${d}</span>`).join('')}</div><div class="xp-section-heading">近期安排 <small>${state.calendar.length} 项</small></div><div class="xp-calendar-events">${state.calendar.map((e,i)=>`<div class="xp-calendar-event"><span><b>${escapeHtml(e.day)}日　${escapeHtml(e.title)}</b><small>${escapeHtml(e.desc)}</small></span><button type="button" data-delete-calendar="${i}" aria-label="删除日程">×</button></div>`).join('') || '<div class="xp-empty">暂无安排</div>'}</div><form class="xp-calendar-add" data-form="calendar"><input name="day" type="number" min="1" max="31" placeholder="日期" required><input name="title" maxlength="32" placeholder="事项 / 时间" required><input name="desc" maxlength="60" placeholder="备注"><button type="submit">添加日程</button></form></section>`;
  }

  function renderNotes() {
    return `<section class="xp-page xp-notes-page"><div class="xp-appbar"><div><div class="xp-app-title">备忘录</div><small>随手记下，不遗漏灵感</small></div><span class="xp-notes-saved"><span data-notes-count>${String(state.notes || '').length}</span> 字 · 自动保存</span></div><div class="xp-notes-paper"><div class="xp-notes-date">${new Intl.DateTimeFormat('zh-CN',{dateStyle:'full'}).format(new Date())}</div><textarea class="xp-notes" data-notes placeholder="写点什么……">${escapeHtml(state.notes)}</textarea></div><p class="xp-muted">内容自动保存在当前聊天。</p></section>`;
  }

  function renderScreen() {
    const titles = { home: '手机', notifications: '通知中心', wechat: '微信', chat: '微信', weibo: '微博', red: '小红书', xplatform: 'X平台', live: '直播间', wallet: '钱包', photos: '相册', browser: '浏览器', calendar: '日历', notes: '备忘录' };
    const renderers = { home: renderHome, notifications: renderNotifications, wechat: renderWechat, chat: renderChat, weibo: renderWeibo, red: renderRed, xplatform: renderXPlatform, live: renderLive, wallet: renderWallet, photos: renderPhotos, browser: renderBrowser, calendar: renderCalendar, notes: renderNotes };
    const renderer = renderers[state.page] || renderHome;
    if (phoneScreen && overlay) {
      const title = overlay.querySelector('.xp-head-title');
      if (title) title.textContent = titles[state.page] || '手机';
      phoneScreen.innerHTML = renderer();
      const dot = overlay.querySelector('.xp-notice-dot');
      if (dot) dot.style.display = state.notifications.some(n => n.unread) ? 'block' : 'none';
    }
    document.querySelectorAll('.xphone-inline-host:not([hidden])').forEach(host => {
      const screen = host.querySelector('.xphone-inline-screen');
      const title = host.querySelector('.xp-inline-title');
      if (screen) screen.innerHTML = renderer();
      if (title) title.textContent = titles[state.page] || '手机';
      const dot = host.querySelector('.xp-inline-dot');
      if (dot) dot.style.display = state.notifications.some(n => n.unread) ? 'inline-block' : 'none';
    });
  }

  function addNotification(app, title, body) {
    const now = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    state.notifications.unshift({ id: `n${Date.now()}-${++notificationSequence}`, app, title, body, time: now, unread: true });
    state.notifications = state.notifications.slice(0, 30);
  }

  function handleClick(event) {
    const appButton = event.target.closest('[data-app]');
    if (appButton) { const app = appButton.dataset.app; setPage(app === 'wechat' ? 'wechat' : app); return; }
    const contactButton = event.target.closest('[data-contact]');
    if (contactButton) { state.selectedContact = contactButton.dataset.contact; setPage('chat', 'wechat'); return; }
    const deleteChatMessage = event.target.closest('[data-delete-chat-message]');
    if (deleteChatMessage) {
      const messages = state.chats[state.selectedContact] || [];
      const index = Number(deleteChatMessage.dataset.deleteChatMessage);
      if (Number.isInteger(index) && index >= 0 && index < messages.length) messages.splice(index, 1);
      renderScreen(); persistState(); return;
    }
    const deleteNotice = event.target.closest('[data-delete-notice]');
    if (deleteNotice) { state.notifications = state.notifications.filter(n => n.id !== deleteNotice.dataset.deleteNotice); renderScreen(); persistState(); return; }
    const notice = event.target.closest('[data-notice]');
    if (notice) {
      const n = state.notifications.find(x => x.id === notice.dataset.notice);
      if (n) {
        n.unread = false;
        const pages = { '微信': 'wechat', '微博': 'weibo', '小红书': 'red', 'X平台': 'xplatform', '直播间': 'live', '钱包': 'wallet', '相册': 'photos', '日历': 'calendar', '备忘录': 'notes', '浏览器': 'browser' };
        setPage(pages[n.app] || 'notifications');
      }
      persistState();
      return;
    }
    const likePost = event.target.closest('[data-like-post]');
    if (likePost) { const p = state.weiboPosts.find(x => x.id === likePost.dataset.likePost); if (p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; renderScreen(); persistState(); } return; }
    const likeRed = event.target.closest('[data-like-red]');
    if (likeRed) { const p = state.redPosts.find(x => x.id === likeRed.dataset.likeRed); if (p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; renderScreen(); persistState(); } return; }
    const album = event.target.closest('[data-album]');
    if (album) { state.selectedAlbum = album.dataset.album; renderScreen(); persistState(); return; }
    const favoritePhoto = event.target.closest('[data-favorite-photo]');
    if (favoritePhoto) { const p = state.photos.find(x => x.id === favoritePhoto.dataset.favoritePhoto); if (p) p.favorite = !p.favorite; renderScreen(); persistState(); return; }
    const deletePhoto = event.target.closest('[data-delete-photo]');
    if (deletePhoto) { state.photos = state.photos.filter(p => p.id !== deletePhoto.dataset.deletePhoto); renderScreen(); persistState(); return; }
    const deleteCalendar = event.target.closest('[data-delete-calendar]');
    if (deleteCalendar) { const index = Number(deleteCalendar.dataset.deleteCalendar); if (Number.isInteger(index) && index >= 0 && index < state.calendar.length) state.calendar.splice(index, 1); renderScreen(); persistState(); return; }
    const browserShortcut = event.target.closest('[data-browser-shortcut]');
    if (browserShortcut) { openExternalBrowser(browserShortcut.dataset.browserShortcut); return; }
    const browserResult = event.target.closest('[data-browser-result]');
    if (browserResult) { const r = state.browserResults.find(x => x.id === browserResult.dataset.browserResult); if (r?.page) setPage(r.page); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    const inlineHost = event.target.closest('.xphone-inline-host');
    if (action === 'dialog-close') { closeActionDialog(event); return; }
    switch (action) {
      case 'close':
        if (inlineHost) {
          inlineHost.hidden = true;
          const entry = inlineHost.closest('.mes')?.querySelector('.xphone-inline-entry');
          if (entry) entry.textContent = '▣ 展开手机';
        } else closePhone();
        break;
      case 'back': goBack(); break;
      case 'home': state.stack = []; setPage('home', null, false); break;
      case 'notifications': setPage('notifications'); break;
      case 'wechat-list': setPage('wechat', 'wechat'); break;
      case 'clear-chat': openActionDialog('clear-chat', '清空聊天记录', '确定删除与当前联系人的全部聊天记录吗？', inlineHost); break;
      case 'clear-notices': state.notifications.forEach(n => n.unread = false); renderScreen(); persistState(); break;
      case 'delete-all-notices': state.notifications = []; renderScreen(); persistState(); break;
      case 'enter-live': setPage('live', 'xplatform'); break;
      case 'x-home': setPage('xplatform', 'xplatform'); break;
      case 'wallet': setPage('wallet', 'xplatform'); break;
      case 'follow': state.followed = !state.followed; renderScreen(); persistState(); break;
      case 'gift': openActionDialog('gift', '赠送礼物', '选择一份礼物支持主播。将扣除模拟钻石，不涉及真实支付。', inlineHost); break;
      case 'wechat-add': openActionDialog('wechat-add', '添加联系人', '创建一个本地模拟联系人', inlineHost, '输入联系人昵称……'); break;
      case 'weibo-compose': openActionDialog('weibo-compose', '发布微博', '分享此刻想说的话', inlineHost, '写一条微博动态……'); break;
      case 'red-compose': openActionDialog('red-compose', '发布笔记', '记录生活灵感与日常', inlineHost, '写一篇小红书笔记……'); break;
      case 'weibo-comment': {
        const post = event.target.closest('[data-post-id]');
        openActionDialog('comment', '发表评论', '评论仅保存在本地模拟动态中', inlineHost, '说点什么……', post?.dataset.postId || '');
        break;
      }
      case 'share': addNotification('微博', '转发成功', '这条动态已加入本地模拟分享记录。'); renderScreen(); persistState(); break;
      case 'wallet-record': openInfoDialog('账单记录', (state.walletTransactions || []).map(t => `${t.title}：${t.amount > 0 ? '+' : ''}${t.amount}钻（${t.time}）`).join('\n') || '暂无账单记录。', inlineHost); break;
      case 'wallet-recharge': openInfoDialog('模拟充值', '此演示版不接入真实充值或支付渠道。', inlineHost); break;
    }
  }

  function openActionDialog(kind, title, description, inlineHost, placeholder, extra = '') {
    const root = inlineHost?.querySelector('.xp-inline-device') || overlay?.querySelector('.xphone-shell');
    if (!root) return;
    root.querySelector('.xp-action-dialog')?.remove();
    pendingDialog = { kind, extra, root };
    root.insertAdjacentHTML('beforeend', `<div class="xp-action-dialog"><form class="xp-dialog-card" data-form="dialog"><button type="button" class="xp-dialog-close" data-action="dialog-close" aria-label="关闭">×</button><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p>${kind === 'gift' ? `<select name="value"><option value="小心心">小心心 · 10钻</option><option value="玫瑰">玫瑰 · 99钻</option><option value="星海">星海 · 520钻</option></select>` : kind === 'clear-chat' ? `<div class="xp-dialog-confirm-note">此操作会删除与该联系人的全部本地聊天记录，且无法撤销。</div><input type="hidden" name="value" value="confirm">` : `<textarea name="value" maxlength="300" placeholder="${escapeHtml(placeholder || '')}" ${kind === 'comment' ? 'required' : ''}></textarea>`}<button class="xp-dialog-submit" type="submit">${kind === 'gift' ? '确认赠送' : kind === 'comment' ? '发表评论' : kind === 'clear-chat' ? '确认清空' : '发布'}</button></form></div>`);
    root.querySelector('.xp-action-dialog textarea, .xp-action-dialog select')?.focus();
  }

  function openInfoDialog(title, description, inlineHost) {
    const root = inlineHost?.querySelector('.xp-inline-device') || overlay?.querySelector('.xphone-shell');
    if (!root) return;
    root.querySelector('.xp-action-dialog')?.remove();
    if (pendingDialog?.root === root) pendingDialog = null;
    root.insertAdjacentHTML('beforeend', `<div class="xp-action-dialog"><div class="xp-dialog-card"><button type="button" class="xp-dialog-close" data-action="dialog-close" aria-label="关闭">×</button><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p><button type="button" class="xp-dialog-submit" data-action="dialog-close">知道了</button></div></div>`);
  }

  function closeActionDialog(event) {
    const root = event.target.closest('.xphone-shell, .xp-inline-device');
    root?.querySelector('.xp-action-dialog')?.remove();
    if (!root || pendingDialog?.root === root) pendingDialog = null;
  }

  function completeDialog(event, data) {
    const formRoot = event.target.closest('.xphone-shell, .xp-inline-device');
    if (!pendingDialog || pendingDialog.root !== formRoot) return;
    const { kind, extra, root } = pendingDialog;
    const value = String(data.get('value') || '').trim();
    root?.querySelector('.xp-action-dialog')?.remove();
    pendingDialog = null;
    if (kind === 'clear-chat' && value === 'confirm') {
      if (state.selectedContact) state.chats[state.selectedContact] = [];
    } else if (kind === 'weibo-compose' && value) {
      state.weiboPosts.unshift({ id: `w${Date.now()}`, user: '我', avatar: '我', text: value, tag: '#我的动态#', likes: 0, comments: 0, liked: false });
      state.weiboPosts = state.weiboPosts.slice(0, 100);
    } else if (kind === 'red-compose' && value) {
      state.redPosts.unshift({ id: `r${Date.now()}`, user: '我', title: value, desc: '刚刚发布 · 本地模拟笔记', likes: 0, liked: false, color: 'peach' });
      state.redPosts = state.redPosts.slice(0, 100);
    } else if (kind === 'comment' && value) {
      const post = state.weiboPosts.find(p => p.id === extra);
      if (post) { post.comments = Number(post.comments || 0) + 1; post.lastComment = value; }
    } else if (kind === 'wechat-add' && value) {
      const name = value.slice(0, 24);
      const duplicate = state.contacts.find(contact => String(contact.name || '').trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase());
      if (duplicate) {
        addNotification('微信', '联系人已存在', `“${name}”已在通讯录中。`);
      } else {
        const id = `contact${Date.now()}`;
        state.contacts.unshift({ id, name, note: '新联系人', avatar: name.slice(0, 1), online: false });
        state.chats[id] = [];
        addNotification('微信', '联系人已添加', `已添加联系人：${name}`);
      }
    } else if (kind === 'gift') {
      const prices = { '小心心': 10, '玫瑰': 99, '星海': 520 };
      const price = prices[value];
      if (!price) return;
      if (state.wallet < price) { addNotification('钱包', '余额不足', '模拟钱包余额不足，暂时无法赠送礼物。'); }
      else {
        state.wallet -= price;
        state.giftsSent += 1;
        state.walletTransactions.unshift({ id: `tx${Date.now()}`, title: `赠送礼物：${value}`, amount: -price, time: nowTime() });
        state.walletTransactions = state.walletTransactions.slice(0, 100);
        state.liveMessages.push({ user: '系统', text: `你送出了 ${value} ×1` });
        state.liveMessages = state.liveMessages.slice(-200);
      }
    }
    renderScreen();
    persistState();
  }

  function handleInput(event) {
    if (event.target.matches('[data-notes]')) {
      state.notes = event.target.value;
      const count = event.target.closest('.xp-notes-page')?.querySelector('[data-notes-count]');
      if (count) count.textContent = String(state.notes.length);
      persistState();
    }
    if (event.target.matches('[data-weibo-search]')) {
      const query = event.target.value.trim().toLocaleLowerCase();
      event.target.closest('.xp-weibo')?.querySelectorAll('.xp-social-post').forEach(post => {
        post.hidden = !post.textContent.toLocaleLowerCase().includes(query);
      });
    }
    if (event.target.matches('[data-contact-search]')) {
      const query = event.target.value.trim().toLocaleLowerCase();
      const page = event.target.closest('.xp-wechat');
      let visible = 0;
      page?.querySelectorAll('.xp-contact').forEach(row => {
        const contact = state.contacts.find(item => String(item.id) === row.dataset.contact);
        const history = contact ? (state.chats[contact.id] || []).map(message => message.text || '').join(' ') : '';
        const searchable = [row.textContent, contact?.name, contact?.note, history].join(' ').toLocaleLowerCase();
        row.hidden = !searchable.includes(query);
        if (!row.hidden) visible++;
      });
      const empty = page?.querySelector('[data-contact-empty]');
      if (empty) empty.hidden = visible !== 0;
    }
  }

  function handleSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    const type = form.dataset.form;
    const data = new FormData(form);
    if (type === 'dialog') { completeDialog(event, data);
    } else if (type === 'wechat') {
      const text = String(data.get('message') || '').trim();
      if (!text || !state.selectedContact) return;
      const arr = state.chats[state.selectedContact] || (state.chats[state.selectedContact] = []);
      arr.push({ from: 'me', text, time: nowTime() });
      if (arr.length > 200) arr.splice(0, arr.length - 200);
      const contactIndex = state.contacts.findIndex(contact => contact.id === state.selectedContact);
      if (contactIndex > 0) state.contacts.unshift(state.contacts.splice(contactIndex, 1)[0]);
      renderScreen(); persistState();
    } else if (type === 'barrage') {
      const text = String(data.get('message') || '').trim();
      if (!text) return;
      state.liveMessages.push({ user: '我', text });
      state.liveMessages = state.liveMessages.slice(-200);
      renderScreen(); persistState();
    } else if (type === 'browser') {
      const query = String(data.get('url') || '').trim();
      if (!query) return;
      state.browserQuery = query;
      persistState();
      openExternalBrowser(query);
      // Keep the phone open and the browser page intact; external navigation must not
      // trigger a simulator re-render or a route change that looks like the phone folded.
    } else if (type === 'photo') {
      const title = String(data.get('title') || '').trim();
      if (!title) return;
      state.photos.unshift({ id: `p${Date.now()}`, album: state.selectedAlbum === '收藏' ? '最近项目' : state.selectedAlbum || '最近项目', title, detail: String(data.get('detail') || '').trim(), date: `今天 ${nowTime()}` });
      state.photos = state.photos.slice(0, 200);
      renderScreen(); persistState();
    } else if (type === 'calendar') {
      const day = Math.max(1, Math.min(31, Number(data.get('day')) || 1));
      const title = String(data.get('title') || '').trim();
      if (!title) return;
      state.calendar.push({ day, title, desc: String(data.get('desc') || '').trim() });
      if (state.calendar.length > 200) state.calendar = state.calendar.slice(-200);
      state.calendar.sort((a,b) => Number(a.day)-Number(b.day));
      renderScreen(); persistState();
    }
  }

  function openExternalBrowser(input) {
    const raw = String(input || '').trim();
    if (!raw) return;
    let url;
    if (/^(https?:)?\/\//i.test(raw)) {
      url = raw.startsWith('//') ? 'https:' + raw : raw;
    } else if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw) && !/\s/.test(raw)) {
      url = 'https://' + raw;
    } else {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(raw);
    }
    try {
      const opened = window.open(url, '_blank');
      if (!opened) {
        const link = document.createElement('a');
        link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.style.display = 'none'; document.body.appendChild(link); link.click(); link.remove();
      }
    } catch (error) {
      console.warn(`[${EXT_ID}] external browser launch failed`, error);
      addNotification('浏览器', '无法打开外部浏览器', '请检查 Android WebView 是否允许打开外部链接');
      persistState();
    }
  }

  function nowTime() { return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); }

  function createEntryButtons() {
    let floating=document.getElementById('xphone-floating-entry');
    if(!floating){
      floating=document.createElement('button');floating.id='xphone-floating-entry';floating.type='button';
      floating.setAttribute('aria-label','打开 X 手机模拟器');floating.title='X 手机 · 点击打开，拖动移动';
      floating.innerHTML='<span class="xphone-fab-mark">X</span><small>手机</small>';document.documentElement.appendChild(floating);
      const key=`${EXT_ID}:floatingPosition`,clamp=(v,l,h)=>Math.max(l,Math.min(h,v)),size=54,margin=12;
      let saved=null;try{saved=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
      let edge=saved?.edge==='left'?'left':'right',yr=Number.isFinite(saved?.y)?saved.y:0.76,x=0,y=0,d=null,moved=false;
      const place=()=>{const vw=window.visualViewport?.width||document.documentElement.clientWidth||innerWidth,vh=window.visualViewport?.height||document.documentElement.clientHeight||innerHeight,ox=window.visualViewport?.offsetLeft||0,oy=window.visualViewport?.offsetTop||0;x=edge==='left'?ox+margin:ox+vw-size-margin;y=oy+margin+clamp(yr,0,1)*Math.max(0,vh-size-2*margin);floating.style.setProperty('left',x+'px','important');floating.style.setProperty('top',y+'px','important');};
      const save=()=>{const vh=window.visualViewport?.height||innerHeight,oy=window.visualViewport?.offsetTop||0;yr=clamp((y-oy-margin)/Math.max(1,vh-size-2*margin),0,1);try{localStorage.setItem(key,JSON.stringify({edge,y:yr}));}catch(_){}};
      floating.addEventListener('pointerdown',e=>{d={id:e.pointerId,sx:e.clientX,sy:e.clientY,x,y,moved:false};try{floating.setPointerCapture(e.pointerId);}catch(_){}});
      floating.addEventListener('pointermove',e=>{if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(Math.hypot(dx,dy)<5&&!d.moved)return;d.moved=true;moved=true;const vw=window.visualViewport?.width||innerWidth,vh=window.visualViewport?.height||innerHeight,ox=window.visualViewport?.offsetLeft||0,oy=window.visualViewport?.offsetTop||0;x=clamp(d.x+dx,ox+margin,ox+vw-size-margin);y=clamp(d.y+dy,oy+margin,oy+vh-size-margin);floating.style.setProperty('left',x+'px','important');floating.style.setProperty('top',y+'px','important');e.preventDefault();});
      const finish=e=>{if(!d||(e.pointerId!==undefined&&d.id!==e.pointerId))return;if(d.moved){const vw=window.visualViewport?.width||innerWidth,ox=window.visualViewport?.offsetLeft||0;edge=Math.abs(x-ox-margin)<Math.abs(x-(ox+vw-size-margin))?'left':'right';place();save();}d=null;if(moved)setTimeout(()=>{moved=false;},250);};
      floating.addEventListener('pointerup',finish);floating.addEventListener('pointercancel',finish);floating.addEventListener('click',e=>{if(moved){e.preventDefault();return;}openPhone();});
      window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);place();
    }
    if (floating) {
      floating.style.setProperty('position','fixed','important');
      floating.style.setProperty('display','flex','important');
      floating.style.setProperty('visibility','visible','important');
      floating.style.setProperty('opacity','1','important');
      floating.style.setProperty('pointer-events','auto','important');
      floating.style.setProperty('z-index','2147483646','important');
    }
    document.getElementById('xphone-topbar-entry')?.remove();
  }
  function scanChatMessages() {
    const messages = document.querySelectorAll('#chat .mes');
    messages.forEach(message => {
      if (message.querySelector('.xphone-inline-entry')) return;
      const mesText = message.querySelector('.mes_text');
      const text = mesText?.textContent || '';
      if (!text.includes('[[PHONE]]') && !text.includes('【打开手机】')) return;
      // Hide the control token from the visible roleplay text after detecting it.
      if (mesText) {
        const walker = document.createTreeWalker(mesText, NodeFilter.SHOW_TEXT);
        const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/\[\[PHONE\]\]|【打开手机】/g, ''); });
      }
      const button = document.createElement('button');
      button.className = 'xphone-inline-entry'; button.type = 'button'; button.textContent = '▣ 展开手机';
      const host = document.createElement('div');
      host.className = 'xphone-inline-host'; host.hidden = true;
      host.innerHTML = `<div class="xp-inline-device"><div class="xp-inline-status"><span>● ${new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', hour12:false})}</span><span>5G　▰</span></div><div class="xp-inline-toolbar"><button data-action="back">‹</button><strong class="xp-inline-title">手机</strong><span><i class="xp-inline-dot"></i><button data-action="close">×</button></span></div><div class="xphone-inline-screen"></div><div class="xp-inline-nav"><button data-action="back">‹</button><button data-action="home">○</button><button data-action="close">×</button></div></div>`;
      button.addEventListener('click', () => { host.hidden = !host.hidden; button.textContent = host.hidden ? '▣ 展开手机' : '▣ 收起手机'; if (!host.hidden) renderScreen(); });
      host.addEventListener('click', handleClick);
      host.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const dialog = host.querySelector('.xp-action-dialog');
        if (dialog) { dialog.remove(); if (pendingDialog?.root === host.querySelector('.xp-inline-device')) pendingDialog = null; event.stopPropagation(); }
      });
      host.addEventListener('submit', handleSubmit);
      host.addEventListener('input', handleInput);
      const contentRoot = message.querySelector('.mes_text') || message;
      contentRoot.appendChild(button);
      contentRoot.appendChild(host);
    });
  }

  function observeChat() {
    const chat = document.querySelector('#chat');
    if (!chat) return;
    // SillyTavern can replace the chat container during layout/app lifecycle changes.
    // Rebind instead of keeping an observer attached to a detached old node.
    if (chatObserver && observedChat === chat) { scanChatMessages(); return; }
    if (chatObserver) chatObserver.disconnect();
    observedChat = chat;
    chatObserver = new MutationObserver(() => scanChatMessages());
    chatObserver.observe(chat, { childList: true, subtree: true });
    scanChatMessages();
  }

  function addSettingsPanel() {
    const target = document.querySelector('#extensions_settings2, #extensions_settings');
    if (!target || document.getElementById('xphone-settings')) return;
    const panel = document.createElement('div'); panel.id = 'xphone-settings'; panel.className = 'inline-drawer';
    panel.innerHTML = `<div class="inline-drawer-toggle inline-drawer-header"><b>X手机模拟器</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><p>打开手机桌面，体验微信、微博、小红书与X平台的本地模拟交互。</p><div class="flex-container"><button id="xphone-settings-open" class="menu_button">打开手机</button><button id="xphone-settings-reset" class="menu_button">重置演示数据</button></div><div id="xphone-reset-confirm" class="xphone-reset-confirm" hidden><p>确定重置当前聊天的手机模拟数据吗？此操作无法撤销。</p><div class="flex-container"><button id="xphone-reset-cancel" class="menu_button">取消</button><button id="xphone-reset-accept" class="menu_button">确认重置</button></div></div><small>数据默认按当前聊天保存；所有社交内容、礼物与钱包均为本地虚构模拟，不会连接外部平台或真实支付。</small></div>`;
    target.appendChild(panel);
    panel.querySelector('.inline-drawer-toggle').addEventListener('click', () => panel.classList.toggle('open'));
    panel.querySelector('#xphone-settings-open').addEventListener('click', () => openPhone());
    const resetConfirm = panel.querySelector('#xphone-reset-confirm');
    panel.querySelector('#xphone-settings-reset').addEventListener('click', () => { resetConfirm.hidden = !resetConfirm.hidden; });
    panel.querySelector('#xphone-reset-cancel').addEventListener('click', () => { resetConfirm.hidden = true; });
    panel.querySelector('#xphone-reset-accept').addEventListener('click', () => {
      state = structuredCloneSafe(DEFAULT_STATE);
      persistState();
      renderScreen();
      resetConfirm.hidden = true;
      panel.querySelector('#xphone-settings-reset').textContent = '已重置';
      window.setTimeout(() => { const button = panel.querySelector('#xphone-settings-reset'); if (button) button.textContent = '重置演示数据'; }, 1600);
    });
  }

  function initialize() {
    const context = currentContext();
    if (!initialized) {
      loadState();
      buildOverlay();
      initialized = true;
    } else if (context && !contextReady) {
      // SillyTavern may expose its context after third-party scripts begin executing.
      loadState();
      renderScreen();
    }
    createEntryButtons();
    addSettingsPanel();
    observeChat();
    if (context) contextReady = true;
    if (context?.eventSource && boundEventSource !== context.eventSource) {
      boundEventSource = context.eventSource;
      if (context.event_types?.CHAT_CHANGED) {
        context.eventSource.on(context.event_types.CHAT_CHANGED, () => { loadState(); renderScreen(); scanChatMessages(); });
      }
      if (context.event_types?.APP_READY) {
        context.eventSource.on(context.event_types.APP_READY, () => { createEntryButtons(); addSettingsPanel(); observeChat(); });
      }
    }
    if (!window.__xPhoneSimulatorReady) {
      window.__xPhoneSimulatorReady = true;
      console.info(`[${EXT_ID}] ready`);
    }
  }

  function boot() {
    const run = () => { try { initialize(); } catch (error) { console.error(`[${EXT_ID}] initialization failed`, error); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();

    // SillyTavern may mount or replace its extension settings/top bar after this script boots.
    // Keep the launcher and settings shortcut recoverable if the host re-renders those regions.
    let entryRepairQueued = false;
    const repairEntries = () => {
      if (entryRepairQueued) return;
      entryRepairQueued = true;
      queueMicrotask(() => {
        entryRepairQueued = false;
        try {
          if (!document.getElementById('xphone-floating-entry') ||
              !document.getElementById('xphone-settings')) {
            createEntryButtons();
            addSettingsPanel();
          }
        } catch (error) { console.warn(`[${EXT_ID}] entry recovery failed`, error); }
      });
    };
    if (document.documentElement) {
      const entryObserver = new MutationObserver(repairEntries);
      entryObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    const waitForST = setInterval(() => {
      run();
      if (contextReady) clearInterval(waitForST);
    }, 800);
    setTimeout(() => clearInterval(waitForST), 30000);
  }

  boot();
})();