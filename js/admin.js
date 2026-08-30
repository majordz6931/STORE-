(function () {
  "use strict";
  var logged = sessionStorage.getItem("major_admin_v4") === "1";
  var db = ElectroDB.load();
  var editingId = null;
  var cloudMessages = [];
  var cloudStatus = { state: "idle", lastOk: 0, lastErr: "", lastCount: 0 };
  function updateCloudBadge() {
    var el = document.querySelector(".last-sync");
    if (!el) return;
    if (!window.MajorCloud || !MajorCloud.isAdmin()) { el.innerHTML = T("admCloudLocal") + " <i style='background:var(--muted);box-shadow:none'></i>"; return; }
    if (cloudStatus.state === "saving") el.innerHTML = T("admCloudSyncing") + " <i style='background:var(--orange);box-shadow:0 0 8px var(--orange)'></i>";
    else if (cloudStatus.state === "error") el.innerHTML = T("admToastSyncErr") + " <i style='background:var(--red);box-shadow:0 0 8px var(--red)'></i> — hover for details";
    else if (cloudStatus.lastOk) el.innerHTML = T("admCloudOnline") + " · " + cloudStatus.lastCount + " " + T("admNavProducts") + " <i></i>";
    else el.innerHTML = T("admCloudReady") + " <i style='background:var(--cyan);box-shadow:0 0 8px var(--cyan)'></i>";
    if (cloudStatus.state === "error" && cloudStatus.lastErr) el.title = cloudStatus.lastErr;
  }
  function describeCloudError(err) {
    var raw = ((err && (err.message || err.hint)) || "").toString();
    if (/duplicate key value|unique constraint.*pkey|store_data pkey/i.test(raw))
      return "Cloud row already exists with this ID. Reloading... (this should not repeat).";
    if (/PGRST205|Could not find the table|relation.*does not exist|does not exist in schema/i.test(raw))
      return "Supabase tables don't exist yet! You must run supabase-setup.sql in Supabase → SQL Editor first.";
    if (/401|403|jwt|policy|permission/i.test(raw) || /new row violates row-level security/i.test(raw))
      return "RLS rejected the write — re-run supabase-setup.sql (it relaxes the policies).";
    if (/jwt expired|token.*expir/i.test(raw))
      return "Your login session expired — click logout and log in again.";
    if (/401/i.test(raw))
      return "Not authenticated — click logout and log in again.";
    if (/fetch|network|failed/i.test(raw))
      return "Network problem — check your internet connection.";
    return raw || "unknown error";
  }
  /* فحص سريع: هل الجداول موجودة في Supabase؟ */
  async function checkTablesExist() {
    if (!window.MajorCloud) return { ok: false, reason: "no cloud client" };
    var exists = {};
    for (var k of ["store_data","orders","messages"]) {
      try {
        var r = await request("/"+k+"?select=id&limit=1", { method:"GET" }, false);
        exists[k] = true;
      } catch (e) {
        exists[k] = /PGRST205|Could not find the table|does not exist/.test(((e||{}).message||"")) ? false : "err:" + ((e||{}).message||"");
      }
    }
    return { ok: exists.store_data === true && exists.orders === true && exists.messages === true, exists: exists };
  }
  function request(path, options, authenticated) {
    options = options || {};
    options.headers = Object.assign({ apikey: window.MajorCloud.CONFIG.anonKey, Accept:"application/json", "Content-Type":"application/json", Prefer:"return=representation" }, options.headers || {});
    var token = authenticated && window.MajorCloud.isAdmin() ? (JSON.parse(localStorage.getItem("major_supabase_session")||"null")||{}).access_token : window.MajorCloud.CONFIG.anonKey;
    options.headers.Authorization = "Bearer " + token;
    return fetch(window.MajorCloud.CONFIG.url + "/rest/v1" + path, options).then(async function (r) {
      var t = await r.text(); var d = null; try { d = t?JSON.parse(t):null } catch (e) { d = t; }
      if (!r.ok) { var er = new Error((d && (d.message || d.msg)) || ("HTTP "+r.status)); er.status=r.status; er.payload=d; throw er; }
      return d;
    });
  }
  var $ = function (id) { return document.getElementById(id); };
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  /* ===== i18n: ترجمة كل نصوص لوحة التحكم ===== */
  function T(key) { return ElectroDB.t(key); }
  /* آمن: يستبدل أول عقدة نصية فقط ولا يلمس العناصر الفرعية (الحقول داخل labels...) */
  function safeAdminI18n(el, v) {
    if (v == null) return;
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) { n.nodeValue = v; return; }
    }
    el.insertBefore(document.createTextNode(v), el.firstChild);
  }
  function applyAdminI18n() {
    all("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); if (!k) return;
      safeAdminI18n(el, T(k));
    });
    all("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); if (!k) return;
      var v = T(k); if (v != null) el.setAttribute("placeholder", v);
    });
    all("[data-i18n-title]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-title"); if (!k) return;
      var v = T(k); if (v != null) el.setAttribute("title", v);
    });
    var ls = $("langSwitch"); if (ls && ls.value !== ElectroDB.getLang()) ls.value = ElectroDB.getLang();
  }
  function statusLabel(status) {
    var orderMap = { pending: "admStatusPending", confirmed: "admStatusConfirmed", shipped: "admStatusShipped", done: "admStatusDelivered", cancelled: "admStatusCancelled" };
    var k = orderMap[status];
    if (!k) return status;
    var v = T(k);
    return (v && v !== k) ? v : status;
  }
  function orderStatusOptions(current) {
    return ["pending","confirmed","shipped","done","cancelled"].map(function (s) {
      return "<option value='" + esc(s) + "' " + (current === s ? "selected" : "") + ">" + esc(statusLabel(s)) + "</option>";
    }).join("");
  }
  function money(n) { return ElectroDB.formatMoney(n); }
  function save() {
    ElectroDB.save(db);
    /* إظهار تذكير النشر بدلاً من الدفع التلقائي */
    var pr = $("publishReminder"); if (pr) pr.hidden = false;
    /* تحديث عداد المنتجات في الشريط الجانبي */
    var pb = $("productBadge"); if (pb) pb.textContent = db.products.length;
  }
  /* دفع بيانات المتجر (منتجات/أقسام/إعدادات/كوبونات) إلى Supabase — يتطلب تسجيل دخول الإدارة */
  function pushCloudStore() {
    try {
      if (!window.MajorCloud || !MajorCloud.isAdmin()) { updateCloudBadge(); toast("⚠ Not logged in — log in first", true); return; }
      var payload = { products: db.products, categories: db.categories, settings: db.settings, coupons: db.coupons };
      cloudStatus.state = "saving"; cloudStatus.lastErr = "";
      updateCloudBadge();
      /* تعطيل زر النشر مؤقتًا لمنع النقر المتكرر */
      var pubBtns = all("[id*=publish], [id*=Publish], .btn-publish");
      pubBtns.forEach(function (b) { b.disabled = true; });
      toast("☁️ publishing... (" + payload.products.length + " products)");
      /* مهلة 15 ثانية لمنع التجميد */
      var timeout = setTimeout(function () {
        cloudStatus.state = "error";
        cloudStatus.lastErr = "Request timed out — check Supabase connection";
        updateCloudBadge();
        toast("✗ Timed out — check your connection to Supabase", true);
        pubBtns.forEach(function (b) { b.disabled = false; });
      }, 15000);
      MajorCloud.saveStore(payload).then(function () {
        clearTimeout(timeout);
        cloudStatus.state = "idle";
        cloudStatus.lastOk = Date.now();
        cloudStatus.lastCount = payload.products.length;
        updateCloudBadge();
        var pr = $("publishReminder"); if (pr) pr.hidden = true;
        toast("✓ " + T("admToastSyncOk").replace("{n}", payload.products.length).replace("{c}", payload.categories.length));
        try { if (bc) bc.postMessage({ type: "store-updated", products: payload.products.length }); } catch (e) {}
      }).catch(function (e) {
        clearTimeout(timeout);
        cloudStatus.state = "error";
        cloudStatus.lastErr = describeCloudError(e);
        updateCloudBadge();
        toast("✗ " + T("admToastSyncErr") + ": " + cloudStatus.lastErr, true);
        console.error("[MAJOR STORE cloud sync error]", e);
      }).finally(function () {
        clearTimeout(timeout);
        pubBtns.forEach(function (b) { b.disabled = false; });
      });
    } catch (err) { toast("✗ publish error: " + err.message, true); }
  }
  function syncCloudOrders() {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    MajorCloud.getOrders().then(function (rows) {
      var map = {};
      (db.orders || []).forEach(function (o) { map[o.id] = o; });
      (rows || []).forEach(function (o) {
        if (!o.date) { try { o.date = new Date(o.created_at).toLocaleString(); } catch (e) { o.date = o.created_at || ""; } }
        var prev = map[o.id];
        /* احفظ إثبات الدفع المحلي إذا كانت نسخة السحابة بلا إثبات (العمود قد لا يوجد بعد) */
        if (prev && prev.proof_image && !o.proof_image) o.proof_image = prev.proof_image;
        map[o.id] = o;
      });
      db.orders = Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
      renderOrders(); renderOverview();
    }).catch(function () {});
  }
  function syncMessages() {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    MajorCloud.getMessages().then(function (rows) {
      cloudMessages = rows || [];
      renderMessages();
    }).catch(function () {});
  }
  function renderMessages() {
    var box = $("messagesList"), empty = $("messagesEmpty");
    var newCount = cloudMessages.filter(function (m) { return (m.status || "new") === "new"; }).length;
    var badge = $("messageBadge"); if (badge) badge.textContent = newCount || "";
    if (!cloudMessages.length) { if (box) box.innerHTML = ""; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    if (!box) return;
    box.innerHTML = cloudMessages.map(function (m) {
      var when = "";
      try { when = new Date(m.created_at).toLocaleString(); } catch (e) { when = m.created_at || ""; }
      var st = m.status || "new";
      var replyBlock = m.reply ? "<div class='msg-reply-done'><b>" + esc(T("admReply")) + "</b><p>" + esc(m.reply) + "</p></div>" : "";
      var stLabel = statusLabel(st);
      return "<article class='message-card " + esc(st) + "'>" +
        "<header><span class='msg-avatar'>" + esc(String(m.visitor_name || "?").charAt(0).toUpperCase()) + "</span>" +
        "<div class='msg-who'><b>" + esc(m.visitor_name) + "</b><small>" + esc(m.visitor_email || "—") + " · " + esc(when) + "</small></div>" +
        "<span class='msg-status " + esc(st) + "'>" + esc(stLabel) + "</span></header>" +
        "<p class='msg-text'>" + esc(m.message) + "</p>" + replyBlock +
        "<div class='msg-actions'><input data-msg-input='" + esc(m.id) + "' placeholder='" + esc(T("admWriteReply")) + "' value='" + (m.reply ? esc(m.reply) : "") + "' />" +
        "<button class='btn small primary' data-msg-send='" + esc(m.id) + "'>" + esc(T("admReplyBtn")) + " ⇥</button>" +
        "<button class='btn small outline' data-msg-done='" + esc(m.id) + "'>" + esc(T("admDone")) + "</button>" +
        "<button class='icon-danger' data-msg-delete='" + esc(m.id) + "'>×</button></div>" +
      "</article>";
    }).join("");
  }
  function sendMessageReply(id) {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    var input = document.querySelector("[data-msg-input='" + id + "']");
    var v = input ? input.value.trim() : "";
    MajorCloud.updateMessage(id, { reply: v, status: "replied", replied_at: new Date().toISOString() })
      .then(syncMessages).catch(function () { toast(T("admReplyFailed"), true); });
  }
  function markMessageDone(id) {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    MajorCloud.updateMessage(id, { status: "done" })
      .then(syncMessages).catch(function () { toast(T("admUpdateFailed"), true); });
  }
  function toast(msg, bad) {
    try {
      var e = $("adminToast"); if (!e) { console.log("[TOAST]", msg); return; }
      e.textContent = msg; e.className = "toast show" + (bad ? " bad" : "");
      clearTimeout(e._t); e._t = setTimeout(function () { try { e.classList.remove("show"); } catch(ex){} }, 2400);
    } catch(ex) { console.log("[TOAST]", msg); }
  }
  function renderBrand() {
    var mark = ElectroDB.getLogo();
    $("loginMark").innerHTML = mark;
    $("sideMark").innerHTML = mark;
    var ls = $("langSwitch"); if (ls && ls.value !== ElectroDB.getLang()) ls.value = ElectroDB.getLang();
  }
  function renderOverview() {
    var orders = db.orders || [], revenue = orders.reduce(function (s, o) { return s + Number(o.total || 0); }, 0);
    $("metricProducts").textContent = db.products.length;
    $("metricOrders").textContent = orders.length;
    $("metricPending").textContent = orders.filter(function (x) { return (x.status || "pending") === "pending"; }).length;
    $("metricRevenue").textContent = money(revenue);
    $("productBadge").textContent = db.products.length;
    $("orderBadge").textContent = orders.filter(function (x) { return (x.status || "pending") === "pending"; }).length;
    var mini = $("miniOrders");
    if (!orders.length) { mini.innerHTML = "<div class='empty-admin'>// " + esc(T("admNoOrders")) + "</div>"; return; }
    mini.innerHTML = orders.slice(0, 5).map(function (o) {
      var initials = String(o.name || "?").trim().split(/\s+/).slice(0, 2).map(function (x) { return x.charAt(0); }).join("").toUpperCase() || "?";
      return "<div class='mini-order'><span class='order-avatar'>" + esc(initials) + "</span><div><b>" + esc(o.name) + "</b><small>" + esc(o.id) + " · " + esc(o.date) + "</small></div><strong>" + money(o.total) + "</strong></div>";
    }).join("");
    var profile = $("profileName"); if (profile) profile.textContent = sessionStorage.getItem("major_admin_user") || "admin";
  }
  function renderProductCategoriesAdmin() {
    $("productCategory").innerHTML = db.categories.map(function (c) {
      var label = (ElectroDB.localize(c.name) || "");
      return "<option value='" + esc(c.id) + "'>" + esc(c.icon) + " " + esc(label) + "</option>";
    }).join("");
  }
  function renderProducts() {
    renderProductCategoriesAdmin();
    var q = $("adminProductSearch").value.toLowerCase().trim(), m = $("adminProductSort").value;
    var list = db.products.filter(function (p) {
      var ar = (p.name && p.name.ar) || "", en = (p.name && p.name.en) || "", desc = "";
      if (p.description) desc = (p.description.ar || "") + " " + (p.description.en || "");
      return !q || (ar + " " + en + " " + desc).toLowerCase().indexOf(q) >= 0;
    });
    if (m === "low") list.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
    if (m === "high") list.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
    var cards = [];
    list.forEach(function (p) {
      try {
        var name = ElectroDB.localize(p.name) || p.id;
        var cname = ElectroDB.localize((db.categories.find(function (x) { return x.id === p.category; }) || {}).name) || "";
        var descTxt = (ElectroDB.localize(p.description) || "").slice(0, 100);
        cards.push("<article class='admin-product-card'><div class='admin-product-art' style='background:" + esc(p.color || "#0d2235") + "'>" + (p.image ? "<img src='" + esc(p.image) + "' alt='' />" : "<span>" + esc(p.icon || "✦") + "</span>") + (p.badge ? "<em>" + esc(ElectroDB.localize(p.badge)) + "</em>" : "") + "</div><div class='admin-product-body'><small>" + esc(cname) + "</small><h3>" + esc(name) + "</h3><p>" + esc(descTxt) + "</p><div class='admin-product-meta'><strong>" + money(p.price) + "</strong><span>stock: " + (p.stock || 0) + "</span></div><div class='card-actions'><button class='btn small outline' data-edit-product='" + esc(p.id) + "'>edit</button><button class='icon-danger' data-delete-product='" + esc(p.id) + "'>del</button></div></div></article>");
      } catch (err) { console.error("[MAJOR ADMIN] skip bad product:", p.id, err.message); }
    });
    $("adminProductsGrid").innerHTML = cards.join("") || "<div class='empty-admin wide'>// no products matching your query.</div>";
  }

  function renderCategories() {
    $("categoryCount").textContent = db.categories.length;
    $("adminCategoriesList").innerHTML = db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      var label = ElectroDB.localize(c.name);
      return "<div class='admin-category'><span class='cat-swatch' style='background:" + esc(c.color) + "'>" + esc(c.icon) + "</span><div><b>" + esc(label) + "</b><small>" + count + " " + T("admNavProducts") + "</small></div><button data-delete-category='" + esc(c.id) + "'>×</button></div>";
    }).join("");
  }
  function renderHomepage() {
    var s = db.settings;
    $("homeBadge").value = (s.heroBadge && s.heroBadge.ar) || "";
    $("homeTitle").value = (s.heroTitle && s.heroTitle.ar) || "";
    $("homeText").value = (s.heroText && s.heroText.ar) || "";
    $("homeCta").value = (s.heroCta && s.heroCta.ar) || "";
    $("homeSecondary").value = (s.heroSecondary && s.heroSecondary.ar) || "";
    $("homeBadgeEn").value = (s.heroBadge && s.heroBadge.en) || "";
    $("homeTitleEn").value = (s.heroTitle && s.heroTitle.en) || "";
    $("homeTextEn").value = (s.heroText && s.heroText.en) || "";
    $("homeCtaEn").value = (s.heroCta && s.heroCta.en) || "";
    $("homeSecondaryEn").value = (s.heroSecondary && s.heroSecondary.en) || "";
  }
  function renderSettings() {
    var s = db.settings;
    $("settingBrand").value = s.brand;
    $("settingSubAR").value = (s.brandSubtitle && s.brandSubtitle.ar) || "";
    $("settingSubEN").value = (s.brandSubtitle && s.brandSubtitle.en) || "";
    $("settingFooterAR").value = (s.footerText && s.footerText.ar) || "";
    $("settingFooterEN").value = (s.footerText && s.footerText.en) || "";
    $("settingPhone").value = s.phone;
    $("settingWhatsapp").value = s.whatsapp;
    $("settingEmail").value = s.email;
    $("settingAddrAR").value = (s.address && s.address.ar) || "";
    $("settingAddrEN").value = (s.address && s.address.en) || "";
    $("settingDiscord").value = s.discordLink || "";
    $("settingAnnouncementEnabled").checked = s.announcementEnabled;
    $("settingAnnouncementAR").value = (s.announcement && s.announcement.ar) || "";
    $("settingAnnouncementEN").value = (s.announcement && s.announcement.en) || "";
  }
  function renderPayments() {
    $("paymentMethods").value = (db.settings.paymentMethods || []).join("\n");
  }
  /* ===== الكوبونات ===== */
  function renderCoupons() {
    var list = db.coupons || [];
    $("couponCount").textContent = list.length;
    $("couponList").innerHTML = list.map(function (c, i) {
      return "<div class='coupon-row'><span class='coupon-code'>" + esc(c.code) + "</span><span class='coupon-meta'>" + (c.type === "percent" ? c.value + " %" : "$" + c.value) + "</span><span class='coupon-state " + (c.active !== false ? "on" : "off") + "'>" + (c.active !== false ? "active" : "off") + "</span><button class='icon-danger' data-delete-coupon='" + i + "'>×</button></div>";
    }).join("") || "<div class='empty-admin'>// no coupons yet.</div>";
  }
  /* ===== الأقسام (ظهور + محتوى) ===== */
  function renderSectionsForm() {
    var s = db.settings;
    var labels = { hero: "Hero", categories: "Categories", shop: "Shop", features: "Features", about: "About", payments: "Payment methods", contact: "Newsletter / Contact" };
    $("sectionToggles").innerHTML = Object.keys(labels).map(function (k) {
      var on = s.sections ? s.sections[k] !== false : true;
      return "<label class='switch-line'><input type='checkbox' data-sec-toggle='" + k + "' " + (on ? "checked" : "") + " /><span></span>" + labels[k] + "</label>";
    }).join("");
    $("bulletsFields").innerHTML = (s.heroBullets || []).map(function (b, i) {
      return "<div class='bi'><label>" + (i + 1) + " AR<input data-bullet='ar' data-i='" + i + "' dir='rtl' value='" + esc((b && b.ar) || "") + "' /></label><label>EN<input data-bullet='en' data-i='" + i + "' value='" + esc((b && b.en) || "") + "' /></label></div>";
    }).join("");
    $("featuresFields").innerHTML = (s.features || []).map(function (f, i) {
      return "<div class='feature-edit'><div class='card-title'><h4>feature " + (i + 1) + "</h4></div><div class='two-fields'><label>icon<input data-feat='icon' data-i='" + i + "' maxlength='3' value='" + esc(f.icon) + "' /></label></div>" +
        "<div class='bi'><label>title AR<input data-feat='title-ar' data-i='" + i + "' dir='rtl' value='" + esc((f.title && f.title.ar) || "") + "' /></label><label>title EN<input data-feat='title-en' data-i='" + i + "' value='" + esc((f.title && f.title.en) || "") + "' /></label></div>" +
        "<div class='bi bi-text'><label>text AR<textarea data-feat='text-ar' data-i='" + i + "' dir='rtl' rows='2'>" + esc((f.text && f.text.ar) || "") + "</textarea></label><label>text EN<textarea data-feat='text-en' data-i='" + i + "' rows='2'>" + esc((f.text && f.text.en) || "") + "</textarea></label></div></div>";
    }).join("");
    $("aboutFields").innerHTML = "<div class='bi'><label>title AR<input data-about='title-ar' dir='rtl' value='" + esc((s.about && s.about.title && s.about.title.ar) || "") + "' /></label><label>title EN<input data-about='title-en' value='" + esc((s.about && s.about.title && s.about.title.en) || "") + "' /></label></div>" +
      "<div class='bi bi-text'><label>text AR<textarea data-about='text-ar' dir='rtl' rows='3'>" + esc((s.about && s.about.text && s.about.text.ar) || "") + "</textarea></label><label>text EN<textarea data-about='text-en' rows='3'>" + esc((s.about && s.about.text && s.about.text.en) || "") + "</textarea></label></div>";
    $("statsFields").innerHTML = (s.heroStats || []).map(function (x, i) {
      var v = localizeSafe(x);
      return "<div class='stats-row'><label>" + (i + 1) + " value<input data-stat='value' data-i='" + i + "' value='" + esc(v.value) + "' /></label><label>label AR<input data-stat='ar' data-i='" + i + "' dir='rtl' value='" + esc((x.ar && x.ar.label) || "") + "' /></label><label>label EN<input data-stat='en' data-i='" + i + "' value='" + esc((x.en && x.en.label) || "") + "' /></label></div>";
    }).join("");
  }
  function localizeSafe(x) { return ElectroDB.localize(x) || { value: "", label: "" }; }
  /* ===== إعدادات الدفع الرقمي (شبكات + عناوين + QR) ===== */
  function renderCryptoConfig() {
    var cfg = db.settings.cryptoConfig || {};
    var wrap = $("cryptoConfigWrap"); if (!wrap) return;
    var methods = Object.keys(cfg);
    if (!methods.length) { wrap.innerHTML = "<div class='empty-admin'>// no crypto config yet. add one below.</div>"; return; }
    wrap.innerHTML = methods.map(function (m) {
      var nets = (cfg[m] && cfg[m].networks) || [];
      var netsHtml = nets.map(function (n, i) {
        var qr = n.qr ? "<img class='qr-thumb' src='" + n.qr + "' alt='QR' />" : "";
        return "<div class='crypto-net'><div class='crypto-net-head'><b>network " + (i + 1) + "</b><button class='icon-danger' data-crypto-delnet='" + esc(m) + "' data-idx='" + i + "'>×</button></div>" +
          "<label>network name<input data-crypto-net-label='" + esc(m) + "' data-idx='" + i + "' value='" + esc(n.label) + "' placeholder='BSC — BNB Smart Chain (BEP20)' /></label>" +
          "<label>wallet address<input data-crypto-net-addr='" + esc(m) + "' data-idx='" + i + "' value='" + esc(n.address) + "' dir='ltr' placeholder='0x...' /></label>" +
          "<div class='crypto-qr-row'><div class='qr-preview'>" + qr + "</div><label class='qr-upload'>upload QR image<input type='file' accept='image/*' data-crypto-qr='" + esc(m) + "' data-idx='" + i + "' /><button class='btn small outline' type='button' data-crypto-qr-rem='" + esc(m) + "' data-idx='" + i + "'>remove QR</button></label></div>" +
          "</div>";
      }).join("");
      return "<div class='crypto-method'><div class='crypto-method-head'><span class='pay-coin'>₿</span><b>" + esc(m) + "</b><button class='icon-danger' data-crypto-delmethod='" + esc(m) + "'>×</button></div>" + netsHtml +
        "<button class='btn small outline' type='button' data-crypto-addnet='" + esc(m) + "'>＋ add network</button></div>";
    }).join("");
  }
  function cryptoNetById(method, idx) {
    var cfg = db.settings.cryptoConfig || {};
    if (!cfg[method]) cfg[method] = { networks: [] };
    if (!cfg[method].networks[idx]) cfg[method].networks[idx] = { id: ElectroDB.uid("nw"), label: "", address: "", qr: "" };
    return cfg[method].networks[idx];
  }
  function renderOrders() {
    var rows = $("ordersTable"), empty = $("ordersEmpty");
    if (!db.orders.length) { rows.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    rows.innerHTML = db.orders.map(function (o) {
      var items = (o.items || []).map(function (x) { return esc(ElectroDB.localize((x && x.name) || "?")) + " ×" + (x.qty || 1); }).join("<br />");
      var status = o.status || "pending";
      var couponTag = o.coupon ? "<small style='color:var(--cyan)'>" + esc(T("admPcHash")) + esc(o.coupon) + "</small>" : "";
      var noteTag = o.note ? "<small style='color:var(--ink-mid)'>" + esc(T("admPcNote")) + esc(o.note) + "</small>" : "";
      var fromTag = o.coupon ? "<small style='color:var(--cyan)'>" + esc(T("admPcFrom1")) + money(o.subtotal || 0) + "</small>" : "";
      var payCell = esc(o.payment) + (((o.cryptoNetwork || o.crypto_network)) ? "<small style='color:var(--purple)'>" + esc(o.cryptoNetwork || o.crypto_network) + "</small>" : "");
      var proofCell = o.proof_image
        ? "<button class='btn small outline proof-view' data-proof-order='" + esc(o.id) + "' title='" + esc(T("admProof")) + "'>🖼</button>"
        : "<span style='opacity:.25'>—</span>";
      return "<tr><td><b>" + esc(o.id) + "</b><small>" + esc(o.date) + "</small></td><td><b>" + esc(o.name || o.email || "—") + "</b>" + (o.phone ? "<small>" + esc(o.phone) + "</small>" : "") + (o.email ? "<small>" + esc(o.email) + "</small>" : "") + "</td><td>" + (o.country ? "<b>" + esc(o.country) + "</b>" : "") + couponTag + noteTag + "</td><td><b>" + money(o.total) + "</b>" + fromTag + "<small>" + items + "</small></td><td>" + payCell + "</td><td>" + proofCell + "</td><td><select class='status-select status-" + esc(status) + "' data-order-status='" + esc(o.id) + "'>" + orderStatusOptions(status) + "</select></td><td><button class='icon-danger' data-delete-order='" + esc(o.id) + "'>×</button></td></tr>";
    }).join("");
  }

  function openProof(id) {
    var o = (db.orders || []).find(function (x) { return x.id === id; });
    if (!o || !o.proof_image) return;
    var im = $("proofModalImg"), mt = $("proofModalMeta"), m = $("proofModal");
    if (im) im.src = o.proof_image;
    if (mt) mt.textContent = o.id + " — " + (o.email || o.name || "") + " — " + money(o.total || 0);
    if (m) { m.classList.add("show"); document.body.classList.add("locked"); }
  }
  function closeProof() {
    var m = $("proofModal");
    if (m) { m.classList.remove("show"); document.body.classList.remove("locked"); }
  }
  function renderAll() {
    db = ElectroDB.load();
    renderBrand(); renderOverview(); renderProducts(); renderCategories();
    renderHomepage(); renderSettings(); renderPayments(); renderOrders();
    renderCoupons(); renderSectionsForm(); renderCryptoConfig();
    applyAdminI18n();
    syncCloudOrders(); syncMessages();
    /* إخفاء تذكير النشر بعد التحديث */
    var pr = $("publishReminder"); if (pr) pr.hidden = true;
  }

  function openEditor(id) {
    editingId = id || null; var p = id ? db.products.find(function (x) { return x.id === id; }) : null;
    try {
      var el, v;
      el = $("editorTitle"); if (!el) { toast("Missing: editorTitle", true); return; }
      el.textContent = p ? T("admChTitleEdit") : T("admChTitle");
      el = $("productId"); if (el) el.value = p ? p.id : "";
      el = $("productNameAR"); if (el) el.value = p && p.name ? (p.name.ar || "") : "";
      el = $("productNameEN"); if (el) el.value = p && p.name ? (p.name.en || "") : "";
      el = $("productSpecsAR"); if (el) el.value = p && p.specs ? (p.specs.ar || "") : "";
      el = $("productSpecsEN"); if (el) el.value = p && p.specs ? (p.specs.en || "") : "";
      el = $("productCategory"); if (el) el.value = p ? p.category : (db.categories[0] ? db.categories[0].id : "");
      el = $("productPrice"); if (el) el.value = p ? p.price : "";
      el = $("productOldPrice"); if (el) el.value = p ? p.oldPrice || "" : "";
      el = $("productStock"); if (el) el.value = p ? p.stock || 10 : 10;
      el = $("productIcon"); if (el) el.value = p ? p.icon : "✦";
      el = $("productColor"); if (el) el.value = p ? p.color : "#0d2235";
      el = $("productBadgeAR"); if (el) el.value = p && p.badge ? (p.badge.ar || "") : "";
      el = $("productBadgeEN"); if (el) el.value = p && p.badge ? (p.badge.en || "") : "";
      el = $("productDescriptionAR"); if (el) el.value = p && p.description ? (p.description.ar || "") : "";
      el = $("productDescriptionEN"); if (el) el.value = p && p.description ? (p.description.en || "") : "";
      el = $("productImage"); if (el) el.value = p ? p.image || "" : "";
      el = $("productEditor"); if (el) el.classList.add("open");
    } catch (err) { toast("openEditor: " + err.message, true); console.error(err); }
  }
  function closeEditor() { try { $("productEditor").classList.remove("open"); } catch(e) {} }
  function setPanel(name) {
    all(".nav-item").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".tnav").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".admin-panel").forEach(function (x) { x.classList.toggle("active", x.id === "panel-" + name); });
    var nav = document.querySelector("[data-panel='" + name + "']");
    var navKey = name ? ("admNav" + name.charAt(0).toUpperCase() + name.slice(1)) : null;
    $("pageTitle").textContent = (navKey && T(navKey)) ? T(navKey) : (nav ? nav.textContent.replace(/\d+/g, "").trim() : "panel");
    if (window.innerWidth < 1000) $("dashboard").classList.remove("side-open");
  }
  function bind() {
    function enterDashboard() {
      try {
        logged = true;
        var dash = $("dashboard");
        if (dash) { dash.hidden = false; dash.setAttribute("data-auth", "ok"); }
        $("loginScreen").hidden = true;
        updateCloudBadge();
        renderAll();
        /* أول دخول: مزامنة فورية لاختبار الاتصال */
        pushCloudStore();
      } catch(err) { toast("enterDashboard error: " + err.message, true); }
    }
    /* BroadcastChannel: عند النشر، أي تبويب آخر مفتوح (متجر زائر) يتحدث فوراً */
    var bc = null;
    try { if (window.BroadcastChannel) bc = new BroadcastChannel("major-store-sync"); } catch (e) { bc = null; }
    /* تعريض القناة لل window لبث تغييرات اللغة عبر التبويبات */
    if (bc) window._majorCloudChannel = bc;
    var passToggle = $("passToggle");
    if (passToggle) passToggle.onclick = function () {
      var inp = $("loginPass");
      inp.type = inp.type === "password" ? "text" : "password";
      passToggle.textContent = inp.type === "password" ? "👁" : "🙈";
    };
    $("loginForm").onsubmit = function (e) {
      e.preventDefault();
      var u = $("loginUser").value.trim(), pw = $("loginPass").value;
      if (!u || !pw) { $("loginError").textContent = "// enter username and password"; return; }
      if (!window.MajorCloud) { $("loginError").textContent = "// auth service unavailable — check your connection"; return; }
      var btn = e.target.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "logging in..."; }
      MajorCloud.signIn(u, pw).then(function () {
        sessionStorage.setItem("major_admin_v4", "1");
        sessionStorage.setItem("major_admin_user", u);
        enterDashboard();
      }).catch(function (err) {
        $("loginError").textContent = "// ACCESS DENIED — " + describeAuthError(err);
        $("loginPass").value = "";
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = "login $"; }
      });
    };
    /* ترجمة سبب خطأ Supabase إلى رسالة واضحة */
    function describeAuthError(err) {
      var raw = ((err && err.message) || "").toString();
      if (/Invalid login credentials|invalid_grant/.test(raw)) return "wrong email or password — if you never created the admin user, run create-admin-user.sql in Supabase > SQL Editor (or create it in Authentication > Users), then log in with admin@majorstore.store";
      if (/Email not confirmed|unverified/i.test(raw)) return "this email is not confirmed — turn OFF \"Confirm email\" in Supabase > Auth > Providers > Email, or re-create the user";
      if (/not found|User already registered|user already/i.test(raw)) return "this user does not exist in Supabase — create it with create-admin-user.sql";
      if (/rate limit|too many|429/i.test(raw)) return "too many attempts — wait a few minutes and try again";
      if (/Email.*(disabled|not allowed|signup)|provider/i.test(raw)) return "the Email provider is disabled — enable it in Supabase > Authentication > Providers";
      if (/fetch|network|typeerror|failed/i.test(raw)) return "cannot reach Supabase — check your internet connection";
      if (/jwt|api key|invalid.*key|unauthorized/i.test(raw)) return "Supabase keys are wrong — check Project URL & anon key in js/cloud.js";
      return raw || "unknown error — check Supabase Authentication settings";
    }
    function doLogout() {
      sessionStorage.removeItem("major_admin_v4"); sessionStorage.removeItem("major_admin_user");
      if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.signOut().catch(function () {});
      location.reload();
    }
    $("logoutBtn").onclick = doLogout;
    var topLogout = $("topLogoutBtn"); if (topLogout) topLogout.onclick = doLogout;
    var pubBtn = $("publishNowBtn");
    if (pubBtn) pubBtn.onclick = function () { pushCloudStore(); };
    all(".nav-item").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all(".tnav").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all("[data-go]").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-go")); }; });
    var qp = $("quickPublishOverview"); if (qp) qp.onclick = function () { pushCloudStore(); };
    /* save() مُعدّلة بالفعل لتحديث التذكير — لا حاجة لل wrap */
    $("mobileSide").onclick = function () { $("dashboard").classList.toggle("side-open"); };
    $("newProductBtn").addEventListener("click", function (e) { e.preventDefault(); openEditor(); });
    all("[data-editor-close]").forEach(function (x) { x.onclick = closeEditor; });
    $("adminProductSearch").oninput = renderProducts; $("adminProductSort").onchange = renderProducts;

    $("productForm").onsubmit = function (e) {
      e.preventDefault();
      try {
        /* ==== helpers آمنة ==== */
        function fval(id) { var el = $(id); return el ? (el.value != null ? String(el.value) : "") : ""; }
        function nval(id, dflt) { var v = parseFloat(String(fval(id)).replace(",", ".")); return isNaN(v) ? (dflt || 0) : v; }

        var existing = editingId ? db.products.find(function (p) { return p.id === editingId; }) : null;
        var price = nval("productPrice", 0);
        var oldp = nval("productOldPrice", 0);
        var stock = parseInt(fval("productStock"), 10) || 0;
        var arName = fval("productNameAR").trim();
        var enName = fval("productNameEN").trim() || arName;

        if (!arName && !enName) return toast(T("admNameRequired"), true);
        if (!price || price < 0) return toast(T("admPriceRequired"), true);

        var data = {
          id: editingId || ElectroDB.uid("p"),
          category: fval("productCategory"),
          name: { ar: arName, en: enName },
          specs: { ar: fval("productSpecsAR").trim(), en: fval("productSpecsEN").trim() },
          price: price,
          oldPrice: oldp,
          stock: stock,
          icon: fval("productIcon") || "✦",
          color: fval("productColor") || "#0d2235",
          badge: { ar: fval("productBadgeAR").trim(), en: fval("productBadgeEN").trim() },
          description: { ar: fval("productDescriptionAR").trim(), en: fval("productDescriptionEN").trim() || fval("productDescriptionAR").trim() },
          image: fval("productImage").trim(),
          rating: existing ? existing.rating || 4.8 : 4.8,
          reviews: existing ? existing.reviews || 0 : 0
        };
        console.log("[MAJOR SAVE PRODUCT]", JSON.stringify({ id: data.id, name: data.name, price: data.price }));
        var idx = db.products.findIndex(function (p) { return p.id === data.id; });
        if (idx >= 0) db.products[idx] = data; else db.products.unshift(data);
        save(); closeEditor(); renderAll();
        toast(idx >= 0 ? (T("admProductUpdated") + price.toFixed(2) + ")") : T("admProductAdded"));
      } catch(err) { toast("Save error: " + err.message, true); console.error("[MAJOR ADMIN]", err); }
    };

    document.addEventListener("click", function (e) {
      var ms = e.target.closest("[data-msg-send]");
      if (ms) { sendMessageReply(ms.getAttribute("data-msg-send")); return; }
      var md = e.target.closest("[data-msg-done]");
      if (md) { markMessageDone(md.getAttribute("data-msg-done")); return; }
      var mdel = e.target.closest("[data-msg-delete]");
      if (mdel && confirm("delete message?")) {
        if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.deleteMessage(mdel.getAttribute("data-msg-delete")).then(syncMessages).catch(function () { toast(T("admDeleteFailed"), true); });
        return;
      }
      var pv = e.target.closest("[data-proof-order]");
      if (pv) { openProof(pv.getAttribute("data-proof-order")); return; }
      var pc = e.target.closest("[data-proof-close]");
      if (pc || (e.target && e.target.id === "proofModal")) { closeProof(); return; }
      var dcoup = e.target.closest("[data-delete-coupon]");
      if (dcoup && confirm(T("admCouponDel").replace("✓ ",""))) {
        db.coupons.splice(Number(dcoup.getAttribute("data-delete-coupon")), 1); save(); renderAll(); toast(T("admCouponDel"));
        return;
      }
      var qrrem = e.target.closest("[data-crypto-qr-rem]");
      if (qrrem) {
        var n1 = cryptoNetById(qrrem.getAttribute("data-crypto-qr-rem"), Number(qrrem.getAttribute("data-idx")));
        n1.qr = ""; save(); renderCryptoConfig(); return;
      }
      var dnet = e.target.closest("[data-crypto-delnet]");
      if (dnet) {
        var m1 = dnet.getAttribute("data-crypto-delnet"), idx1 = Number(dnet.getAttribute("data-idx"));
        (db.settings.cryptoConfig[m1] || {}).networks.splice(idx1, 1); save(); renderCryptoConfig(); return;
      }
      var dmet = e.target.closest("[data-crypto-delmethod]");
      if (dmet && confirm("delete this crypto config?")) {
        delete db.settings.cryptoConfig[dmet.getAttribute("data-crypto-delmethod")]; save(); renderCryptoConfig(); return;
      }
      var anet = e.target.closest("[data-crypto-addnet]");
      if (anet) {
        var m2 = anet.getAttribute("data-crypto-addnet");
        if (!db.settings.cryptoConfig[m2]) db.settings.cryptoConfig[m2] = { networks: [] };
        db.settings.cryptoConfig[m2].networks.push({ id: ElectroDB.uid("nw"), label: "", address: "", qr: "" });
        save(); renderCryptoConfig(); return;
      }
      var ep = e.target.closest("[data-edit-product]"); if (ep) openEditor(ep.getAttribute("data-edit-product"));
      var dp = e.target.closest("[data-delete-product]");
      if (dp && confirm(T("admProductDel").replace("✓ ",""))) { db.products = db.products.filter(function (x) { return x.id !== dp.getAttribute("data-delete-product"); }); save(); renderAll(); toast(T("admProductDel")); }
      var dc = e.target.closest("[data-delete-category]");
      if (dc && confirm(T("admCatDel").replace("✓ ",""))) { db.categories = db.categories.filter(function (x) { return x.id !== dc.getAttribute("data-delete-category"); }); save(); renderAll(); toast(T("admCatDel")); }
      var dord = e.target.closest("[data-delete-order]");
      if (dord && confirm(T("admOrderDel").replace("✓ ",""))) {
        var oid = dord.getAttribute("data-delete-order");
        db.orders = db.orders.filter(function (x) { return x.id !== oid; }); save(); renderAll(); toast(T("admOrderDel"));
        if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.deleteOrder(oid).catch(function () {});
      }
    });
    /* رفع صورة QR → base64 داخل إعدادات العملة */
    document.addEventListener("change", function (e) {
      var qrf = e.target.closest("[data-crypto-qr]");
      if (!qrf || !qrf.files || !qrf.files[0]) return;
      var m = qrf.getAttribute("data-crypto-qr"), idx = Number(qrf.getAttribute("data-idx"));
      var file = qrf.files[0];
      if (file.size > 400 * 1024) return toast("QR image too large (max 400KB)", true);
      var reader = new FileReader();
      reader.onload = function () {
        var n = cryptoNetById(m, idx);
        n.qr = String(reader.result);
        save(); renderCryptoConfig(); toast(T("admSaveCrypto") + " — " + m);
      };
      reader.readAsDataURL(file);
    });

    $("categoryForm").onsubmit = function (e) {
      e.preventDefault();
      var ar = $("categoryNameAR").value.trim(), en = $("categoryNameEN").value.trim();
      if (!ar && !en) return toast(T("admNameRequired"), true);
      db.categories.push({
        id: ElectroDB.uid("cat"),
        name: { ar: ar || en, en: en || ar },
        icon: $("categoryIcon").value || "✦",
        color: $("categoryColor").value
      });
      save(); e.target.reset(); renderAll(); toast(T("admCatAdded"));
    };

    $("paymentForm").onsubmit = function (e) {
      e.preventDefault();
      var list = ($("paymentMethods").value || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (!list.length) return toast("add at least one payment method", true);
      db.settings.paymentMethods = list;
      save(); renderAll(); $("paymentsSaved").textContent = T("admPaySaved"); toast(T("admPayCount").replace("{n}", list.length));
    };

    $("homepageForm").onsubmit = function (e) {
      e.preventDefault();
      db.settings.heroBadge = { ar: $("homeBadge").value, en: $("homeBadgeEn").value };
      db.settings.heroTitle = { ar: $("homeTitle").value, en: $("homeTitleEn").value };
      db.settings.heroText = { ar: $("homeText").value, en: $("homeTextEn").value };
      db.settings.heroCta = { ar: $("homeCta").value, en: $("homeCtaEn").value };
      db.settings.heroSecondary = { ar: $("homeSecondary").value, en: $("homeSecondaryEn").value };
      save(); renderAll(); $("homeSaved").textContent = T("admHomeSaved"); toast(T("admHomeSavedToast"));
    };

    $("settingsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.brand = $("settingBrand").value;
      s.brandSubtitle = { ar: $("settingSubAR").value, en: $("settingSubEN").value };
      s.footerText = { ar: $("settingFooterAR").value, en: $("settingFooterEN").value };
      s.phone = $("settingPhone").value;
      s.whatsapp = $("settingWhatsapp").value;
      s.email = $("settingEmail").value;
      s.address = { ar: $("settingAddrAR").value, en: $("settingAddrEN").value };
      s.discordLink = $("settingDiscord").value;
      s.announcementEnabled = $("settingAnnouncementEnabled").checked;
      s.announcement = { ar: $("settingAnnouncementAR").value, en: $("settingAnnouncementEN").value };
      save(); renderAll(); $("settingsSaved").textContent = T("admSetSaved"); toast(T("admSetSaved"));
    };

    $("couponForm").onsubmit = function (e) {
      e.preventDefault();
      var code = $("couponCode").value.trim().toUpperCase();
      var val = Number($("couponValue").value);
      if (!code || !val || val <= 0) return toast(T("admValidCode"), true);
      if ((db.coupons || []).some(function (c) { return c.code === code; })) return toast(T("admExistsCode"), true);
      db.coupons = db.coupons || [];
      db.coupons.push({ code: code, type: $("couponType").value, value: val, active: $("couponActive").checked });
      save(); e.target.reset(); renderAll(); toast(T("admCouponAdded").replace("{code}", code));
    };
    $("sectionsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.sections = s.sections || {};
      all("[data-sec-toggle]").forEach(function (cb) { s.sections[cb.getAttribute("data-sec-toggle")] = cb.checked; });
      s.heroBullets = (s.heroBullets || []).map(function (b, i) {
        return { ar: qval("bullet", "ar", i), en: qval("bullet", "en", i) };
      });
      s.features = (s.features || []).map(function (f, i) {
        return {
          icon: qval("feat", "icon", i) || f.icon,
          title: { ar: qval("feat", "title-ar", i), en: qval("feat", "title-en", i) },
          text: { ar: qval("feat", "text-ar", i), en: qval("feat", "text-en", i) }
        };
      });
      s.about = s.about || {};
      s.about.title = { ar: qval("about", "title-ar"), en: qval("about", "title-en") };
      s.about.text = { ar: qval("about", "text-ar"), en: qval("about", "text-en") };
      s.heroStats = (s.heroStats || []).map(function (x, i) {
        var val = qval("stat", "value", i) || ((x && x.ar && x.ar.value) || "");
        return {
          ar: { value: val, label: qval("stat", "ar", i) },
          en: { value: val, label: qval("stat", "en", i) }
        };
      });
      save(); renderAll(); $("sectionsSaved").textContent = T("admSecSaved"); toast(T("admPhotoshop"));
    };
    function qval(attr, val, i) {
      var sel = "[data-" + attr + "='" + val + "']" + (i == null ? "" : "[data-i='" + i + "']");
      var el = document.querySelector(sel);
      return el ? el.value : "";
    }
    $("cryptoSaveBtn").onclick = function () {
      db.settings.cryptoConfig = db.settings.cryptoConfig || {};
      all("[data-crypto-net-label]").forEach(function (inp) {
        var m = inp.getAttribute("data-crypto-net-label"), idx = Number(inp.getAttribute("data-idx"));
        var n = cryptoNetById(m, idx);
        n.label = inp.value.trim() || n.label;
        var a = document.querySelector("[data-crypto-net-addr='" + m + "'][data-idx='" + idx + "']");
        if (a) n.address = a.value.trim();
      });
      save(); $("cryptoSaved").textContent = T("admPaySaved"); renderCryptoConfig(); toast(T("admSaveCrypto"));
    };
    $("cryptoAddMethod").onclick = function () {
      db.settings.cryptoConfig = db.settings.cryptoConfig || {};
      var m = window.prompt(T("admAddCryptoPrompt") || "Payment method key (BEP20)");
      if (!m || !m.trim()) return;
      m = m.trim();
      if (!db.settings.cryptoConfig[m]) db.settings.cryptoConfig[m] = { networks: [] };
      db.settings.cryptoConfig[m].networks.push({ id: ElectroDB.uid("nw"), label: "", address: "", qr: "" });
      renderCryptoConfig(); toast(T("admSaveCrypto"));
    };
    $("ordersTable").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-order-status"); if (!id) return;
      var o = db.orders.find(function (x) { return x.id === id; });
      if (o) {
        o.status = e.target.value; save(); renderAll(); toast(T("admStatusChanged") + statusLabel(e.target.value));
        if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.updateOrder(id, { status: o.status }).catch(function () {});
      }
    });
    $("clearOrdersBtn").onclick = function () {
      if (!db.orders.length || !confirm(T("admClearOrders"))) return;
      var ids = db.orders.map(function (o) { return o.id; });
      db.orders = []; save(); renderAll(); toast(T("admClearOrders"));
      if (window.MajorCloud && MajorCloud.isAdmin()) {
        var chain = Promise.resolve();
        ids.forEach(function (id) { chain = chain.then(function () { return MajorCloud.deleteOrder(id).catch(function () {}); }); });
        chain.then(syncCloudOrders);
      }
    };
    $("langSwitch").onchange = function () { ElectroDB.setLang(this.value); try { if (window._majorCloudChannel) window._majorCloudChannel.postMessage({ lang: this.value }); } catch(e){} };
  }
  console.log("[MAJOR ADMIN] bind() called, handlers registered");
  bind();
  if (logged && window.MajorCloud && MajorCloud.isAdmin()) {
    var dash = $("dashboard");
    if (dash) { dash.hidden = false; dash.setAttribute("data-auth", "ok"); }
    $("loginScreen").hidden = true; renderAll();
  } else {
    sessionStorage.removeItem("major_admin_v4");
    $("loginScreen").hidden = false;
    var dash2 = $("dashboard"); if (dash2) { dash2.hidden = true; dash2.removeAttribute("data-auth"); }
  }
  window.addEventListener("major-db-updated", renderAll);
  window.addEventListener("major-lang-changed", function () {
    applyAdminI18n();
    renderBrand(); renderOverview(); renderProducts(); renderCategories(); renderHomepage(); renderSettings(); renderPayments();
    renderOrders(); renderCoupons(); renderSectionsForm(); renderCryptoConfig();
  });
  /* استقبال الطلبات والرسائل الجديدة من Supabase أثناء فتح اللوحة */
  window.setInterval(function () {
    if (logged && !document.hidden) { syncCloudOrders(); syncMessages(); }
  }, 20000);
})();