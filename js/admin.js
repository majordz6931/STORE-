(function () {
  "use strict";
  var logged = sessionStorage.getItem("major_admin_v4") === "1";
  var db = ElectroDB.load();
  var editingId = null;
  var cloudMessages = [];
  var $ = function (id) { return document.getElementById(id); };
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function money(n) { return ElectroDB.formatMoney(n); }
  function save() {
    ElectroDB.save(db);
    pushCloudStore();
  }
  /* دفع بيانات المتجر (منتجات/أقسام/إعدادات/كوبونات) إلى Supabase — يتطلب تسجيل دخول الإدارة */
  function pushCloudStore() {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    var payload = { products: db.products, categories: db.categories, settings: db.settings, coupons: db.coupons };
    MajorCloud.saveStore(payload).catch(function (e) { toast("cloud sync failed: " + ((e && e.message) || "error"), true); });
  }
  function syncCloudOrders() {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    MajorCloud.getOrders().then(function (rows) {
      var map = {};
      (db.orders || []).forEach(function (o) { map[o.id] = o; });
      (rows || []).forEach(function (o) {
        if (!o.date) { try { o.date = new Date(o.created_at).toLocaleString(); } catch (e) { o.date = o.created_at || ""; } }
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
      var replyBlock = m.reply ? "<div class='msg-reply-done'><b>↩ reply</b><p>" + esc(m.reply) + "</p></div>" : "";
      return "<article class='message-card " + esc(st) + "'>" +
        "<header><span class='msg-avatar'>" + esc(String(m.visitor_name || "?").charAt(0).toUpperCase()) + "</span>" +
        "<div class='msg-who'><b>" + esc(m.visitor_name) + "</b><small>" + esc(m.visitor_email || "—") + " · " + esc(when) + "</small></div>" +
        "<span class='msg-status " + esc(st) + "'>" + esc(st) + "</span></header>" +
        "<p class='msg-text'>" + esc(m.message) + "</p>" + replyBlock +
        "<div class='msg-actions'><input data-msg-input='" + esc(m.id) + "' placeholder='write reply...' value='" + (m.reply ? esc(m.reply) : "") + "' />" +
        "<button class='btn small primary' data-msg-send='" + esc(m.id) + "'>reply ⇥</button>" +
        "<button class='btn small outline' data-msg-done='" + esc(m.id) + "'>done</button>" +
        "<button class='icon-danger' data-msg-delete='" + esc(m.id) + "'>×</button></div>" +
      "</article>";
    }).join("");
  }
  function sendMessageReply(id) {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    var input = document.querySelector("[data-msg-input='" + id + "']");
    var v = input ? input.value.trim() : "";
    MajorCloud.updateMessage(id, { reply: v, status: "replied", replied_at: new Date().toISOString() })
      .then(syncMessages).catch(function () { toast("reply failed", true); });
  }
  function markMessageDone(id) {
    if (!window.MajorCloud || !MajorCloud.isAdmin()) return;
    MajorCloud.updateMessage(id, { status: "done" })
      .then(syncMessages).catch(function () { toast("update failed", true); });
  }
  function toast(msg, bad) {
    var e = $("adminToast"); e.textContent = msg; e.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove("show"); }, 2400);
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
    if (!orders.length) { mini.innerHTML = "<div class='empty-admin'>// no orders yet<br /><small>you'll see orders here as they arrive.</small></div>"; return; }
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
    if (m === "low") list.sort(function (a, b) { return a.price - b.price; });
    if (m === "high") list.sort(function (a, b) { return b.price - a.price; });
    $("adminProductsGrid").innerHTML = list.map(function (p) {
      var name = ElectroDB.localize(p.name);
      var cname = ElectroDB.localize((db.categories.find(function (x) { return x.id === p.category; }) || {}).name);
      return "<article class='admin-product-card'><div class='admin-product-art' style='background:" + esc(p.color) + "'>" + (p.image ? "<img src='" + esc(p.image) + "' alt='' />" : "<span>" + esc(p.icon) + "</span>") + (p.badge ? "<em>" + esc(ElectroDB.localize(p.badge)) + "</em>" : "") + "</div><div class='admin-product-body'><small>" + esc(cname) + "</small><h3>" + esc(name) + "</h3><p>" + esc(ElectroDB.localize(p.description).slice(0, 100)) + "</p><div class='admin-product-meta'><strong>" + money(p.price) + "</strong><span>stock: " + (p.stock || 0) + "</span></div><div class='card-actions'><button class='btn small outline' data-edit-product='" + esc(p.id) + "'>edit</button><button class='icon-danger' data-delete-product='" + esc(p.id) + "'>del</button></div></div></article>";
    }).join("") || "<div class='empty-admin wide'>// no products matching your query.</div>";
  }
  function renderCategories() {
    $("categoryCount").textContent = db.categories.length;
    $("adminCategoriesList").innerHTML = db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      var label = ElectroDB.localize(c.name);
      return "<div class='admin-category'><span class='cat-swatch' style='background:" + esc(c.color) + "'>" + esc(c.icon) + "</span><div><b>" + esc(label) + "</b><small>" + count + " منتج</small></div><button data-delete-category='" + esc(c.id) + "'>×</button></div>";
    }).join("");
  }
  function renderHomepage() {
    var s = db.settings;
    $("homeBadge").value = (s.heroBadge && s.heroBadge.ar) || "";
    $("homeTitle").value = (s.heroTitle && s.heroTitle.ar) || "";
    $("homeText").value = (s.heroText && s.heroText.ar) || "";
    $("homeCta").value = (s.heroCta && s.heroCta.ar) || "";
    $("homeSecondary").value = (s.heroSecondary && s.heroSecondary.ar) || "";
    $("homeBadgeFr").value = (s.heroBadge && s.heroBadge.fr) || "";
    $("homeTitleFr").value = (s.heroTitle && s.heroTitle.fr) || "";
    $("homeTextFr").value = (s.heroText && s.heroText.fr) || "";
    $("homeCtaFr").value = (s.heroCta && s.heroCta.fr) || "";
    $("homeSecondaryFr").value = (s.heroSecondary && s.heroSecondary.fr) || "";
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
    $("settingSubFR").value = (s.brandSubtitle && s.brandSubtitle.fr) || "";
    $("settingSubEN").value = (s.brandSubtitle && s.brandSubtitle.en) || "";
    $("settingFooterAR").value = (s.footerText && s.footerText.ar) || "";
    $("settingFooterFR").value = (s.footerText && s.footerText.fr) || "";
    $("settingFooterEN").value = (s.footerText && s.footerText.en) || "";
    $("settingPhone").value = s.phone;
    $("settingWhatsapp").value = s.whatsapp;
    $("settingEmail").value = s.email;
    $("settingAddrAR").value = (s.address && s.address.ar) || "";
    $("settingAddrFR").value = (s.address && s.address.fr) || "";
    $("settingAddrEN").value = (s.address && s.address.en) || "";
    $("settingDiscord").value = s.discordLink || "";
    $("settingAnnouncementEnabled").checked = s.announcementEnabled;
    $("settingAnnouncementAR").value = (s.announcement && s.announcement.ar) || "";
    $("settingAnnouncementFR").value = (s.announcement && s.announcement.fr) || "";
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
      return "<div class='tri'><label>" + (i + 1) + " AR<input data-bullet='ar' data-i='" + i + "' dir='rtl' value='" + esc((b && b.ar) || "") + "' /></label><label>FR<input data-bullet='fr' data-i='" + i + "' value='" + esc((b && b.fr) || "") + "' /></label><label>EN<input data-bullet='en' data-i='" + i + "' value='" + esc((b && b.en) || "") + "' /></label></div>";
    }).join("");
    $("featuresFields").innerHTML = (s.features || []).map(function (f, i) {
      return "<div class='feature-edit'><div class='card-title'><h4>feature " + (i + 1) + "</h4></div><div class='two-fields'><label>icon<input data-feat='icon' data-i='" + i + "' maxlength='3' value='" + esc(f.icon) + "' /></label></div>" +
        "<div class='tri'><label>title AR<input data-feat='title-ar' data-i='" + i + "' dir='rtl' value='" + esc((f.title && f.title.ar) || "") + "' /></label><label>title FR<input data-feat='title-fr' data-i='" + i + "' value='" + esc((f.title && f.title.fr) || "") + "' /></label><label>title EN<input data-feat='title-en' data-i='" + i + "' value='" + esc((f.title && f.title.en) || "") + "' /></label></div>" +
        "<div class='tri tri-text'><label>text AR<textarea data-feat='text-ar' data-i='" + i + "' dir='rtl' rows='2'>" + esc((f.text && f.text.ar) || "") + "</textarea></label><label>text FR<textarea data-feat='text-fr' data-i='" + i + "' rows='2'>" + esc((f.text && f.text.fr) || "") + "</textarea></label><label>text EN<textarea data-feat='text-en' data-i='" + i + "' rows='2'>" + esc((f.text && f.text.en) || "") + "</textarea></label></div></div>";
    }).join("");
    $("aboutFields").innerHTML = "<div class='tri'><label>title AR<input data-about='title-ar' dir='rtl' value='" + esc((s.about && s.about.title && s.about.title.ar) || "") + "' /></label><label>title FR<input data-about='title-fr' value='" + esc((s.about && s.about.title && s.about.title.fr) || "") + "' /></label><label>title EN<input data-about='title-en' value='" + esc((s.about && s.about.title && s.about.title.en) || "") + "' /></label></div>" +
      "<div class='tri tri-text'><label>text AR<textarea data-about='text-ar' dir='rtl' rows='3'>" + esc((s.about && s.about.text && s.about.text.ar) || "") + "</textarea></label><label>text FR<textarea data-about='text-fr' rows='3'>" + esc((s.about && s.about.text && s.about.text.fr) || "") + "</textarea></label><label>text EN<textarea data-about='text-en' rows='3'>" + esc((s.about && s.about.text && s.about.text.en) || "") + "</textarea></label></div>";
    $("statsFields").innerHTML = (s.heroStats || []).map(function (x, i) {
      var v = localizeSafe(x);
      return "<div class='stats-row'><label>" + (i + 1) + " value<input data-stat='value' data-i='" + i + "' value='" + esc(v.value) + "' /></label><label>label AR<input data-stat='ar' data-i='" + i + "' dir='rtl' value='" + esc((x.ar && x.ar.label) || "") + "' /></label><label>label FR<input data-stat='fr' data-i='" + i + "' value='" + esc((x.fr && x.fr.label) || "") + "' /></label><label>label EN<input data-stat='en' data-i='" + i + "' value='" + esc((x.en && x.en.label) || "") + "' /></label></div>";
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
      var items = (o.items || []).map(function (x) { return esc(ElectroDB.localize(x.name)) + " ×" + x.qty; }).join("<br />");
      var status = o.status || "pending";
      var couponTag = o.coupon ? "<small style='color:var(--cyan)'>coupon: " + esc(o.coupon) + "</small>" : "";
      var payCell = esc(o.payment) + (((o.cryptoNetwork || o.crypto_network)) ? "<small style='color:var(--purple)'>" + esc(o.cryptoNetwork || o.crypto_network) + "</small>" : "");
      return "<tr><td><b>" + esc(o.id) + "</b><small>" + esc(o.date) + "</small></td><td><b>" + esc(o.name) + "</b><small>" + esc(o.phone) + "</small>" + (o.email ? "<small>" + esc(o.email) + "</small>" : "") + "</td><td>" + esc(o.address) + couponTag + (o.note ? "<small style='color:var(--ink-mid)'>note: " + esc(o.note) + "</small>" : "") + "</td><td><b>" + money(o.total) + "</b>" + (o.coupon ? "<small style='color:var(--cyan)'>from " + money(o.subtotal || 0) + "</small>" : "") + "<small>" + items + "</small></td><td>" + payCell + "</td><td><select class='status-select status-" + esc(status) + "' data-order-status='" + esc(o.id) + "'><option value='pending' " + (status === "pending" ? "selected" : "") + ">pending</option><option value='confirmed' " + (status === "confirmed" ? "selected" : "") + ">confirmed</option><option value='shipped' " + (status === "shipped" ? "selected" : "") + ">shipped</option><option value='done' " + (status === "done" ? "selected" : "") + ">delivered</option><option value='cancelled' " + (status === "cancelled" ? "selected" : "") + ">cancelled</option></select></td><td><button class='icon-danger' data-delete-order='" + esc(o.id) + "'>×</button></td></tr>";
    }).join("");
  }

  function renderAll() {
    db = ElectroDB.load();
    renderBrand(); renderOverview(); renderProducts(); renderCategories();
    renderHomepage(); renderSettings(); renderPayments(); renderOrders();
    renderCoupons(); renderSectionsForm(); renderCryptoConfig();
    syncCloudOrders(); syncMessages();
  }

  function openEditor(id) {
    editingId = id || null; var p = id ? db.products.find(function (x) { return x.id === id; }) : null;
    $("editorTitle").textContent = p ? "edit product" : "new product";
    $("productId").value = p ? p.id : "";
    $("productNameAR").value = p && p.name ? (p.name.ar || "") : "";
    $("productNameFR").value = p && p.name ? (p.name.fr || "") : "";
    $("productNameEN").value = p && p.name ? (p.name.en || "") : "";
    $("productSpecsAR").value = p && p.specs ? (p.specs.ar || "") : "";
    $("productSpecsFR").value = p && p.specs ? (p.specs.fr || "") : "";
    $("productSpecsEN").value = p && p.specs ? (p.specs.en || "") : "";
    $("productCategory").value = p ? p.category : (db.categories[0] ? db.categories[0].id : "");
    $("productPrice").value = p ? p.price : "";
    $("productOldPrice").value = p ? p.oldPrice || "" : "";
    $("productStock").value = p ? p.stock || 10 : 10;
    $("productIcon").value = p ? p.icon : "✦";
    $("productColor").value = p ? p.color : "#0d2235";
    $("productBadgeAR").value = p && p.badge ? (p.badge.ar || "") : "";
    $("productBadgeFR").value = p && p.badge ? (p.badge.fr || "") : "";
    $("productBadgeEN").value = p && p.badge ? (p.badge.en || "") : "";
    $("productDescriptionAR").value = p && p.description ? (p.description.ar || "") : "";
    $("productDescriptionFR").value = p && p.description ? (p.description.fr || "") : "";
    $("productDescriptionEN").value = p && p.description ? (p.description.en || "") : "";
    $("productImage").value = p ? p.image || "" : "";
    $("productEditor").classList.add("open");
  }
  function closeEditor() { $("productEditor").classList.remove("open"); }
  function setPanel(name) {
    all(".nav-item").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".tnav").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".admin-panel").forEach(function (x) { x.classList.toggle("active", x.id === "panel-" + name); });
    var nav = document.querySelector("[data-panel='" + name + "']");
    $("pageTitle").textContent = nav ? nav.textContent.replace(/\d+/g, "").trim() : "panel";
    if (window.innerWidth < 1000) $("dashboard").classList.remove("side-open");
  }
  function bind() {
    function enterDashboard() {
      logged = true;
      $("loginScreen").hidden = true; $("dashboard").hidden = false;
      var sync = document.querySelector(".last-sync");
      if (sync) sync.innerHTML = window.MajorCloud && MajorCloud.isAdmin() ? "cloud sync: online <i></i>" : "local mode <i></i>";
      renderAll();
    }
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
    all(".nav-item").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all(".tnav").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all("[data-go]").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-go")); }; });
    $("mobileSide").onclick = function () { $("dashboard").classList.toggle("side-open"); };
    $("newProductBtn").onclick = function () { openEditor(); };
    all("[data-close-editor]").forEach(function (x) { x.onclick = closeEditor; });
    $("adminProductSearch").oninput = renderProducts; $("adminProductSort").onchange = renderProducts;

    $("productForm").onsubmit = function (e) {
      e.preventDefault();
      var existing = editingId ? db.products.find(function (p) { return p.id === editingId; }) : null;
      var price = Number(($("productPrice").value || "0").replace(",", "."));
      var oldp = Number(($("productOldPrice").value || "0").replace(",", ".")) || 0;
      var stock = Number($("productStock").value) || 0;
      if (!price || price < 0) return toast("complete price (USD)", true);
      if (!$("productNameAR").value.trim() && !$("productNameEN").value.trim()) return toast("complete name", true);
      var arName = $("productNameAR").value.trim(), frName = $("productNameFR").value.trim(), enName = $("productNameEN").value.trim() || arName;
      var arDesc = $("productDescriptionAR").value.trim(), frDesc = $("productDescriptionFR").value.trim(), enDesc = $("productDescriptionEN").value.trim() || arDesc;
      var data = {
        id: editingId || ElectroDB.uid("p"),
        category: $("productCategory").value,
        name: { ar: arName, fr: frName || enName, en: enName },
        specs: { ar: $("productSpecsAR").value.trim(), fr: $("productSpecsFR").value.trim(), en: $("productSpecsEN").value.trim() },
        price: price,
        oldPrice: oldp,
        stock: stock,
        icon: $("productIcon").value || "✦",
        color: $("productColor").value,
        badge: { ar: $("productBadgeAR").value.trim(), fr: $("productBadgeFR").value.trim(), en: $("productBadgeEN").value.trim() },
        description: { ar: arDesc, fr: frDesc || enDesc, en: enDesc },
        image: $("productImage").value.trim(),
        rating: existing ? existing.rating || 4.8 : 4.8,
        reviews: existing ? existing.reviews || 0 : 0
      };
      var idx = db.products.findIndex(function (p) { return p.id === data.id; });
      if (idx >= 0) db.products[idx] = data; else db.products.unshift(data);
      save(); closeEditor(); renderAll();
      toast(idx >= 0 ? "✓ product updated ($" + price.toFixed(2) + ")" : "✓ product added");
    };

    document.addEventListener("click", function (e) {
      var ms = e.target.closest("[data-msg-send]");
      if (ms) { sendMessageReply(ms.getAttribute("data-msg-send")); return; }
      var md = e.target.closest("[data-msg-done]");
      if (md) { markMessageDone(md.getAttribute("data-msg-done")); return; }
      var mdel = e.target.closest("[data-msg-delete]");
      if (mdel && confirm("delete message?")) {
        if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.deleteMessage(mdel.getAttribute("data-msg-delete")).then(syncMessages).catch(function () { toast("delete failed", true); });
        return;
      }
      var dcoup = e.target.closest("[data-delete-coupon]");
      if (dcoup && confirm("delete coupon?")) {
        db.coupons.splice(Number(dcoup.getAttribute("data-delete-coupon")), 1); save(); renderAll(); toast("✓ coupon deleted");
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
      if (dp && confirm("delete product?")) { db.products = db.products.filter(function (x) { return x.id !== dp.getAttribute("data-delete-product"); }); save(); renderAll(); toast("✓ product deleted"); }
      var dc = e.target.closest("[data-delete-category]");
      if (dc && confirm("delete category?")) { db.categories = db.categories.filter(function (x) { return x.id !== dc.getAttribute("data-delete-category"); }); save(); renderAll(); toast("✓ category deleted"); }
      var dord = e.target.closest("[data-delete-order]");
      if (dord && confirm("delete order?")) {
        var oid = dord.getAttribute("data-delete-order");
        db.orders = db.orders.filter(function (x) { return x.id !== oid; }); save(); renderAll(); toast("✓ order deleted");
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
        save(); renderCryptoConfig(); toast("✓ QR attached to " + m);
      };
      reader.readAsDataURL(file);
    });

    $("categoryForm").onsubmit = function (e) {
      e.preventDefault();
      var ar = $("categoryNameAR").value.trim(), fr = $("categoryNameFR").value.trim(), en = $("categoryNameEN").value.trim();
      if (!ar && !fr && !en) return toast("complete category name (AR)", true);
      db.categories.push({
        id: ElectroDB.uid("cat"),
        name: { ar: ar || en, fr: fr || en, en: en || ar },
        icon: $("categoryIcon").value || "✦",
        color: $("categoryColor").value
      });
      save(); e.target.reset(); renderAll(); toast("✓ category added");
    };

    $("paymentForm").onsubmit = function (e) {
      e.preventDefault();
      var list = ($("paymentMethods").value || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (!list.length) return toast("add at least one payment method", true);
      db.settings.paymentMethods = list;
      save(); renderAll(); $("paymentsSaved").textContent = "saved"; toast("✓ " + list.length + " payment methods saved");
    };

    $("homepageForm").onsubmit = function (e) {
      e.preventDefault();
      db.settings.heroBadge = { ar: $("homeBadge").value, fr: $("homeBadgeFr").value, en: $("homeBadgeEn").value };
      db.settings.heroTitle = { ar: $("homeTitle").value, fr: $("homeTitleFr").value, en: $("homeTitleEn").value };
      db.settings.heroText = { ar: $("homeText").value, fr: $("homeTextFr").value, en: $("homeTextEn").value };
      db.settings.heroCta = { ar: $("homeCta").value, fr: $("homeCtaFr").value, en: $("homeCtaEn").value };
      db.settings.heroSecondary = { ar: $("homeSecondary").value, fr: $("homeSecondaryFr").value, en: $("homeSecondaryEn").value };
      save(); renderAll(); $("homeSaved").textContent = "saved"; toast("✓ homepage copy saved (AR + FR + EN)");
    };

    $("settingsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.brand = $("settingBrand").value;
      s.brandSubtitle = { ar: $("settingSubAR").value, fr: $("settingSubFR").value, en: $("settingSubEN").value };
      s.footerText = { ar: $("settingFooterAR").value, fr: $("settingFooterFR").value, en: $("settingFooterEN").value };
      s.phone = $("settingPhone").value;
      s.whatsapp = $("settingWhatsapp").value;
      s.email = $("settingEmail").value;
      s.address = { ar: $("settingAddrAR").value, fr: $("settingAddrFR").value, en: $("settingAddrEN").value };
      s.discordLink = $("settingDiscord").value;
      s.announcementEnabled = $("settingAnnouncementEnabled").checked;
      s.announcement = { ar: $("settingAnnouncementAR").value, fr: $("settingAnnouncementFR").value, en: $("settingAnnouncementEN").value };
      save(); renderAll(); $("settingsSaved").textContent = "saved"; toast("✓ settings saved");
    };

    $("couponForm").onsubmit = function (e) {
      e.preventDefault();
      var code = $("couponCode").value.trim().toUpperCase();
      var val = Number($("couponValue").value);
      if (!code || !val || val <= 0) return toast("complete code & value", true);
      if ((db.coupons || []).some(function (c) { return c.code === code; })) return toast("coupon already exists", true);
      db.coupons = db.coupons || [];
      db.coupons.push({ code: code, type: $("couponType").value, value: val, active: $("couponActive").checked });
      save(); e.target.reset(); renderAll(); toast("✓ coupon " + code + " added");
    };
    $("sectionsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.sections = s.sections || {};
      all("[data-sec-toggle]").forEach(function (cb) { s.sections[cb.getAttribute("data-sec-toggle")] = cb.checked; });
      s.heroBullets = (s.heroBullets || []).map(function (b, i) {
        return { ar: qval("bullet", "ar", i), fr: qval("bullet", "fr", i), en: qval("bullet", "en", i) };
      });
      s.features = (s.features || []).map(function (f, i) {
        return {
          icon: qval("feat", "icon", i) || f.icon,
          title: { ar: qval("feat", "title-ar", i), fr: qval("feat", "title-fr", i), en: qval("feat", "title-en", i) },
          text: { ar: qval("feat", "text-ar", i), fr: qval("feat", "text-fr", i), en: qval("feat", "text-en", i) }
        };
      });
      s.about = s.about || {};
      s.about.title = { ar: qval("about", "title-ar"), fr: qval("about", "title-fr"), en: qval("about", "title-en") };
      s.about.text = { ar: qval("about", "text-ar"), fr: qval("about", "text-fr"), en: qval("about", "text-en") };
      s.heroStats = (s.heroStats || []).map(function (x, i) {
        var val = qval("stat", "value", i) || ((x && x.ar && x.ar.value) || "");
        return {
          ar: { value: val, label: qval("stat", "ar", i) },
          fr: { value: val, label: qval("stat", "fr", i) },
          en: { value: val, label: qval("stat", "en", i) }
        };
      });
      save(); renderAll(); $("sectionsSaved").textContent = "saved"; toast("✓ sections saved");
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
      save(); $("cryptoSaved").textContent = "saved"; renderCryptoConfig(); toast("✓ crypto settings saved");
    };
    $("cryptoAddMethod").onclick = function () {
      db.settings.cryptoConfig = db.settings.cryptoConfig || {};
      var m = window.prompt("Payment method key (must match a method in the list above), e.g. USDT (BEP20)");
      if (!m || !m.trim()) return;
      m = m.trim();
      if (!db.settings.cryptoConfig[m]) db.settings.cryptoConfig[m] = { networks: [] };
      db.settings.cryptoConfig[m].networks.push({ id: ElectroDB.uid("nw"), label: "", address: "", qr: "" });
      renderCryptoConfig(); toast("✓ added config for " + m);
    };
    $("ordersTable").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-order-status"); if (!id) return;
      var o = db.orders.find(function (x) { return x.id === id; });
      if (o) {
        o.status = e.target.value; save(); renderAll(); toast("✓ status: " + e.target.value);
        if (window.MajorCloud && MajorCloud.isAdmin()) MajorCloud.updateOrder(id, { status: o.status }).catch(function () {});
      }
    });
    $("clearOrdersBtn").onclick = function () {
      if (!db.orders.length || !confirm("clear ALL orders?")) return;
      var ids = db.orders.map(function (o) { return o.id; });
      db.orders = []; save(); renderAll(); toast("all orders cleared");
      if (window.MajorCloud && MajorCloud.isAdmin()) {
        var chain = Promise.resolve();
        ids.forEach(function (id) { chain = chain.then(function () { return MajorCloud.deleteOrder(id).catch(function () {}); }); });
        chain.then(syncCloudOrders);
      }
    };
    $("langSwitch").onchange = function () { ElectroDB.setLang(this.value); };
  }
  bind();
  if (logged) {
    $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
  } else {
    $("loginScreen").hidden = false;
  }
  window.addEventListener("major-db-updated", renderAll);
  window.addEventListener("major-lang-changed", function () {
    renderBrand(); renderCategories(); renderHomepage(); renderSettings();
  });
  /* استقبال الطلبات والرسائل الجديدة من Supabase أثناء فتح اللوحة */
  window.setInterval(function () {
    if (logged && !document.hidden) { syncCloudOrders(); syncMessages(); }
  }, 20000);
})();