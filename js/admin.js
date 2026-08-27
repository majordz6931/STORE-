(function () {
  var session = sessionStorage.getItem("major360_admin");
  var productImage = "";
  var activeChat = "";
  var soundEnabled = true;
  var newOrdersCount = 0;
  var newChatsCount = 0;
  var baseOrderCount = -1;

  var S = { products: [], payments: [], orders: [], coupons: [], config: null, chats: [] };

  function $(id) { return document.getElementById(id); }
  function qs(s) { return document.querySelector(s); }
  function qsa(s) { return document.querySelectorAll(s); }
  function t(k) { return MajorI18n.t(k); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }
  function api(path, opts) { return fetch(MAJOR_API(path), opts || {}).then(function (r) { return r.json(); }); }

  function fetchAll() {
    api("/api/sync?admin=1").then(function (d) {
      if (!d) return;
      if (Array.isArray(d.products)) S.products = d.products;
      var localProducts = MajorDB.getProducts();
      if (Array.isArray(localProducts)) S.products = localProducts;
      if (Array.isArray(d.payments)) S.payments = d.payments;
      if (Array.isArray(d.coupons)) S.coupons = d.coupons;
      if (d.config) S.config = d.config;
      if (Array.isArray(d.orders)) {
        if (baseOrderCount === -1) baseOrderCount = d.orders.length;
        else if (d.orders.length > baseOrderCount) {
          var fresh = d.orders.slice(0, d.orders.length - baseOrderCount);
          newOrdersCount += fresh.length;
          updateNewOrdersBadge();
          if (soundEnabled) playOrderSound();
          fresh.forEach(function (o) { showOrderNotification(o); });
        }
        S.orders = d.orders;
        baseOrderCount = d.orders.length;
      }
      if (Array.isArray(d.chats)) S.chats = d.chats;
      renderAll();
    }).catch(function () {});
  }

  function pollChats() {
    api("/api/chat").then(function (list) {
      if (!Array.isArray(list)) return;
      var changed = false;
      list.forEach(function (rc) {
        var local = S.chats.find(function (c) { return c.id === rc.id; });
        if (!local) { S.chats.unshift(rc); changed = true; return; }
        (rc.messages || []).forEach(function (m) {
          if (m && !local.messages.some(function (x) { return x.ts === m.ts; })) { local.messages.push(m); changed = true; }
        });
      });
      if (changed) renderChats();
    }).catch(function () {});
  }

  function sendChat(msg) {
    api("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: activeChat, message: msg })
    }).catch(function () {});
  }
  function createChat(chatId, name) {
    api("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chatId, name: name })
    }).catch(function () {});
  }
  function deleteChat(chatId) {
    api("/api/chat?id=" + encodeURIComponent(chatId), { method: "DELETE" }).catch(function () {});
  }

  /* ===== SOUNDS & NOTIFS ===== */
  function beep(ctx, f, d) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, ctx.currentTime + d);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + d);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + d);
    osc.stop(ctx.currentTime + d + 0.12);
  }
  function playOrderSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      beep(ctx, 660, 0); beep(ctx, 880, 0.1);
    } catch (e) {}
  }
  function playChatSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      beep(ctx, 880, 0); beep(ctx, 1100, 0.09); beep(ctx, 880, 0.18);
    } catch (e) {}
  }
  function showNotif(id, icon, title, text) {
    var el = $(id);
    if (!el) return;
    el.innerHTML = '<div class="notif-inner"><div class="notif-icon">' + icon + '</div><div class="notif-body"><b>' + esc(title) + '</b><p class="sub">' + esc(text) + "</p></div></div>";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 5000);
  }
  function showChatNotification(name, text) { showNotif("chatNotify", "💬", name || "زبون", text); }
  function showOrderNotification(o) {
    showNotif("orderNotify", "🔔", o.name || t("name"), (o.items || []).map(function (i) { return i.name + " x" + i.qty; }).join(" | ") + " — $" + Number(o.total || 0).toFixed(2));
  }
  function updateTitle() {
    var pts = [];
    if (newOrdersCount > 0) pts.push("🛒" + newOrdersCount);
    if (newChatsCount > 0) pts.push("💬" + newChatsCount);
    document.title = (pts.length ? "(" + pts.join(" ") + ") " : "") + document.title.replace(/^\(.*?\)\s*/, "");
  }
  function updateNewOrdersBadge() {
    var b = qs("#tabOrders .badge-new");
    if (b) {
      if (newOrdersCount > 0) { b.textContent = newOrdersCount; b.classList.add("show"); }
      else b.classList.remove("show");
    }
    updateTitle();
  }
  function updateNewChatBadge() {
    var b = $("newChatBadge");
    if (!b) return;
    if (newChatsCount > 0) { b.textContent = newChatsCount; b.classList.add("show"); }
    else b.classList.remove("show");
    updateTitle();
  }
  function flashMsg(el, text, color) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color || "var(--ok)";
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ""; }, 6000);
  }
  function storageMessage() {
    return "⚠️ تعذر حفظ التغيير، حاول مرة أخرى";
  }
  function compressImage(file, max, quality, cb) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      cb(c.toDataURL("image/jpeg", quality));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  /* ===== LOGIN ===== */
  function showApp() {
    $("loginBox").style.display = "none";
    $("dash").style.display = "flex";
    $("who").textContent = session;
    fetchAll();
    setInterval(fetchAll, 12000);
    setInterval(pollChats, 6000);
  }
  if (session) showApp();

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("user").value.trim();
    var p = $("pass").value;
    var db = MajorDB.load();
    if (!(db.admins || []).some(function (a) { return a.user === u && a.pass === p; })) {
      $("loginErr").textContent = t("badLogin");
      return;
    }
    session = u;
    sessionStorage.setItem("major360_admin", u);
    showApp();
  });

  $("logout").addEventListener("click", function () {
    sessionStorage.removeItem("major360_admin");
    location.reload();
  });

  qs("#swapLang").addEventListener("click", function () {
    MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
  });
  MajorI18n.onChange = renderAll;

  qsa(".side-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      qsa(".side-btn").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      qsa(".panel").forEach(function (p) { p.classList.remove("active"); });
      var tab = $(b.getAttribute("data-tab"));
      if (tab) tab.classList.add("active");
      if (b.getAttribute("data-tab") === "tabOrders") { newOrdersCount = 0; updateNewOrdersBadge(); }
      if (b.getAttribute("data-tab") === "tabChat") { newChatsCount = 0; updateNewChatBadge(); }
    });
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("#soundToggle");
    if (btn) { soundEnabled = !soundEnabled; btn.classList.toggle("muted"); }
  });

  function renderAll() {
    renderStats();
    renderProducts();
    renderOrders();
    renderPayments();
    renderCoupons();
    renderConfig();
    renderAdmins();
    renderChats();
  }

  /* ===== STATS ===== */
  function renderStats() {
    var orders = S.orders;
    if ($("statOrders")) $("statOrders").textContent = orders.length;
    var rev = orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    if ($("statRevenue")) $("statRevenue").textContent = "$" + Number(rev).toFixed(2);
    if ($("statPending")) $("statPending").textContent = orders.filter(function (o) { return (o.status || "pending") === "pending"; }).length;
    if ($("statConfirmed")) $("statConfirmed").textContent = orders.filter(function (o) { return o.status === "confirmed"; }).length;
    if ($("statDelivered")) $("statDelivered").textContent = orders.filter(function (o) { return o.status === "delivered"; }).length;
    var map = {};
    orders.forEach(function (o) { (o.items || []).forEach(function (i) { map[i.name] = (map[i.name] || 0) + i.qty; }); });
    var top = Object.keys(map).sort(function (a, b) { return map[b] - map[a]; }).slice(0, 5);
    var el = $("topProducts");
    if (el) {
      el.innerHTML = top.length
        ? top.map(function (n) { return '<div>• ' + esc(n) + ' <b>x' + map[n] + "</b></div>"; }).join("")
        : '<span style="color:var(--muted)">' + t("noOrders") + "</span>";
    }
  }

  /* ===== CONFIG ===== */
  function renderConfig() {
    if (!S.config) return;
    var c = S.config;
    if ($("discordUrl")) $("discordUrl").value = c.discord || "";
    if ($("whatsappNum")) $("whatsappNum").value = c.whatsapp || "";
    if ($("whatsappMsg")) $("whatsappMsg").value = c.whatsappMsg || "";
    if ($("annTextInput")) $("annTextInput").value = c.announcement || "";
    if ($("annTextEnInput")) $("annTextEnInput").value = c.announcementEn || "";
    if ($("annEnabled")) $("annEnabled").checked = c.announcementEnabled !== false;
  }
  function saveConfig(body, msgEl) {
    api("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (d) {
        if (d && d.error) flashMsg(msgEl, t("storageError"), "var(--bad)");
        else flashMsg(msgEl, t("saved"));
      })
      .catch(function () { flashMsg(msgEl, t("err"), "var(--bad)"); });
  }
  if ($("saveDiscord")) $("saveDiscord").addEventListener("click", function () {
    saveConfig({ discord: $("discordUrl").value.trim() }, $("savedMsg"));
  });
  if ($("saveWhatsapp")) $("saveWhatsapp").addEventListener("click", function () {
    saveConfig({ whatsapp: $("whatsappNum").value.trim(), whatsappMsg: $("whatsappMsg").value.trim() }, $("whatsappSaved"));
  });
  if ($("saveAnnouncement")) $("saveAnnouncement").addEventListener("click", function () {
    saveConfig({
      announcement: $("annTextInput").value.trim(),
      announcementEn: $("annTextEnInput").value.trim(),
      announcementEnabled: $("annEnabled").checked
    }, $("annSaved"));
  });

  /* ===== PAYMENTS ===== */
  var payQrData = "";
  function renderPayments() {
    if (!$("payTable")) return;
    var list = S.payments;
    $("payTable").innerHTML = list.length
      ? list.map(function (p, i) {
          var short = String(p.wallet || "").slice(0, 12) + "…" + String(p.wallet || "").slice(-5);
          var qr = p.qrImage ? '<img class="mini-thumb" src="' + p.qrImage + '" alt="QR" />' : "-";
          return "<tr><td>" + (p.icon || "💳") + " " + esc(p.label || "") + "</td><td>" + esc(p.network || "-") +
            '</td><td><code class="wallet-code">' + esc(short) + "</code></td><td>" + qr +
            '</td><td><button class="danger btn" data-pdel="' + i + '">🗑</button></td></tr>';
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px">' + t("noPayments") + "</td></tr>";
  }
  $("payQr").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { payQrData = ""; return; }
    compressImage(file, 400, 0.8, function (data) {
      payQrData = data;
      var prev = $("payQrPreview");
      if (prev) { prev.src = data; prev.classList.add("show"); }
    });
  });
  $("addPayment").addEventListener("click", function () {
    var label = $("payLabel").value.trim();
    var wallet = $("payWallet").value.trim();
    if (!label || !wallet) { flashMsg($("paySaved"), "⚠️ " + t("payLabel") + " + " + t("payWallet"), "var(--warn)"); return; }
    var payload = { id: "pm" + Date.now(), label: label, network: $("payNetwork").value.trim(), wallet: wallet, icon: "💳", qrImage: payQrData || "" };
    S.payments.push(payload);
    renderPayments();
    payQrData = "";
    $("payLabel").value = ""; $("payNetwork").value = ""; $("payWallet").value = ""; $("payQr").value = "";
    var pr = $("payQrPreview");
    if (pr) { pr.src = ""; pr.classList.remove("show"); }
    api("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (m) {
        if (m && m.error) {
          S.payments = S.payments.filter(function (x) { return x.id !== payload.id; });
          renderPayments();
          flashMsg($("paySaved"), t("storageError"), "var(--bad)");
        } else flashMsg($("paySaved"), t("saved"));
      })
      .catch(function () { flashMsg($("paySaved"), t("err"), "var(--bad)"); });
  });
  $("payTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-pdel");
    if (i == null) return;
    var m = S.payments[+i];
    if (m && m.id) api("/api/payments?id=" + encodeURIComponent(m.id), { method: "DELETE" });
    flashMsg($("paySaved"), t("removed"));
  });

  /* ===== PRODUCTS ===== */
  function renderProducts() {
    if ($("pCount")) $("pCount").textContent = S.products.length;
    if (!$("productTable")) return;
    $("productTable").innerHTML = S.products.map(function (p) {
      var n = MajorI18n.getLang() === "en" ? (p.nameEn || p.name) : p.name;
      var pic = p.image ? '<img class="mini-thumb" src="' + p.image + '" alt="" />' : (p.emoji || "🎮");
      return "<tr><td>" + pic + "</td><td>" + esc(n) + "</td><td>" + esc(p.cat) + "</td><td>$" + Number(p.price).toFixed(2) +
        '</td><td><button class="danger btn" data-del="' + p.id + '">🗑</button></td></tr>';
    }).join("");
  }
  $("pimage").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { productImage = ""; return; }
    compressImage(file, 800, 0.7, function (data) {
      productImage = data;
      var prev = $("pimagePreview");
      if (prev) { prev.src = data; prev.classList.add("show"); }
    });
  });
  $("addProduct").addEventListener("submit", function (e) {
    e.preventDefault();
    var payload = {
      id: "p" + Date.now(),
      name: $("pname").value.trim(),
      nameEn: $("pnameEn").value.trim(),
      cat: $("pcat").value,
      price: Number($("pprice").value),
      emoji: $("pemoji").value.trim() || "🎮",
      image: productImage,
      desc: $("pdesc").value.trim(),
      descEn: $("pdescEn").value.trim()
    };
    if (!payload.name || !payload.price) { flashMsg($("productSaved"), "⚠️ " + t("pName") + " + " + t("price"), "var(--warn)"); return; }
    S.products.unshift(payload);
    if (!MajorDB.saveProducts(S.products)) {
      S.products.shift();
      renderProducts();
      flashMsg($("productSaved"), "⚠️ تعذر الحفظ في هذا المتصفح", "var(--bad)");
      return;
    }
    renderProducts();
    productImage = "";
    var prev = $("pimagePreview");
    if (prev) prev.classList.remove("show");
    e.target.reset();
    flashMsg($("productSaved"), "✅ تم حفظ المنتج في هذا المتصفح");
  });
  $("productTable").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-del");
    if (!id) return;
    if (!confirm("حذف هذا المنتج؟")) return;
    var old = S.products.slice();
    S.products = S.products.filter(function (x) { return x.id !== id; });
    if (!MajorDB.saveProducts(S.products)) {
      S.products = old;
      flashMsg($("productSaved"), "⚠️ تعذر الحفظ في هذا المتصفح", "var(--bad)");
    } else {
      renderProducts();
      flashMsg($("productSaved"), "✅ تم حذف المنتج من هذا المتصفح");
    }
  });

  /* ===== ORDERS ===== */
  function renderOrders() {
    if ($("oCount")) $("oCount").textContent = S.orders.length;
    if (!$("orderTable")) return;
    $("orderTable").innerHTML = S.orders.map(function (o) {
      var items = (o.items || []).map(function (i) { return i.name + " x" + i.qty; }).join(" | ");
      var shot = o.proof ? '<img class="order-shot" src="' + o.proof + '" alt="proof" />' : "-";
      var status = o.status || "pending";
      var sk = "status" + status.charAt(0).toUpperCase() + status.slice(1);
      var coupon = o.coupon ? "<br>🎫 " + esc(o.coupon) : "";
      var pm = o.payLabel ? "<br>💳 " + esc(o.payLabel) : "";
      var btns = '<div class="status-btns">';
      if (status === "pending") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="confirmed">✓</button> <button class="danger btn" data-ostat="' + o.id + '" data-next="cancelled">✗</button>';
      else if (status === "confirmed") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="delivered">✓✓</button> <button class="danger btn" data-ostat="' + o.id + '" data-next="cancelled">✗</button>';
      else if (status === "delivered") btns += '<span style="color:var(--ok)">✓✓✓</span>';
      else btns += '<span style="color:var(--bad)">✗✗</span>';
      btns += "</div>";
      return "<tr><td>" + esc(o.at || "") + "</td><td>" + esc(o.name || "") + "</td><td>" + esc(o.contact || "") + "<br>" + esc(o.country || "") + pm +
        "</td><td>" + items + coupon + "</td><td>$" + Number(o.total).toFixed(2) +
        "</td><td>" + shot + '</td><td><span class="status-' + status + '">' + t(sk) + "</span>" + btns + "</td></tr>";
    }).join("") || '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:18px">' + t("noOrders") + "</td></tr>";
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-ostat]");
    if (!btn) return;
    var id = btn.getAttribute("data-ostat");
    var next = btn.getAttribute("data-next");
    api("/api/orders?id=" + encodeURIComponent(id), {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next })
    }).catch(function () {});
  });
  if ($("exportCSV")) {
    $("exportCSV").addEventListener("click", function () {
      var rows = [[t("colTime"), t("colName"), t("colContact"), t("country"), t("colItems"), t("colTotal"), t("colStatus"), "Coupon"]];
      S.orders.forEach(function (o) {
        rows.push([o.at, o.name, o.contact, o.country, (o.items || []).map(function (i) { return i.name + " x" + i.qty; }).join("; "), o.total, o.status || "pending", o.coupon || ""]);
      });
      var csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
      a.download = "orders_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
    });
  }
  if ($("orderTable")) {
    $("orderTable").addEventListener("click", function (e) {
      if (e.target.tagName === "IMG" && e.target.src) window.open(e.target.src, "_blank");
    });
  }

  /* ===== COUPONS ===== */
  function renderCoupons() {
    if (!$("couponTable")) return;
    var list = S.coupons;
    $("couponTable").innerHTML = list.length
      ? list.map(function (c, i) {
          var v = c.type === "percent" ? c.value + "%" : "$" + c.value;
          return "<tr><td><b>" + esc(c.code) + "</b></td><td>" + v + "</td><td>" + (c.used || 0) + "/" + (c.max || "∞") +
            "</td><td>" + esc(c.expires || "-") + '</td><td><button class="danger btn" data-cdel="' + i + '">🗑</button></td></tr>';
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px">' + t("noCoupons") + "</td></tr>";
  }
  $("addCouponForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var payload = {
      code: $("ccode").value.trim().toUpperCase(),
      type: $("ctype").value,
      value: Number($("cvalue").value),
      max: Number($("cmax").value) || 0,
      expires: $("cexpires").value || ""
    };
    if (!payload.code || !payload.value) { flashMsg($("couponSaved"), "⚠️ Code + Value", "var(--warn)"); return; }
    S.coupons.unshift(payload);
    renderCoupons();
    e.target.reset();
    api("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (d) {
        if (d && d.error) {
          S.coupons = S.coupons.filter(function (x) { return x.code !== payload.code; });
          renderCoupons();
          flashMsg($("couponSaved"), t("storageError"), "var(--bad)");
        } else flashMsg($("couponSaved"), t("saved"));
      })
      .catch(function () { flashMsg($("couponSaved"), t("err"), "var(--bad)"); });
  });
  $("couponTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-cdel");
    if (i == null) return;
    var c = S.coupons[+i];
    if (c) api("/api/coupons?code=" + encodeURIComponent(c.code), { method: "DELETE" });
  });

  /* ===== ADMINS (local) ===== */
  function renderAdmins() {
    if (!$("adminTable")) return;
    var db = MajorDB.load();
    $("adminTable").innerHTML = (db.admins || []).map(function (a, i) {
      var del = a.user === "MAJOR" ? "" : '<button class="danger btn" data-adel="' + i + '">🗑</button>';
      return "<tr><td><b>" + esc(a.user) + '</b></td><td>••••••••</td><td>' + del + "</td></tr>";
    }).join("");
  }
  $("addAdmin").addEventListener("submit", function (e) {
    e.preventDefault();
    var db = MajorDB.load();
    var u = $("auser").value.trim();
    var p = $("apass").value;
    if (!db.admins) db.admins = [];
    if (db.admins.some(function (a) { return a.user === u; })) {
      $("adminMsg").textContent = t("used");
      $("adminMsg").style.color = "var(--bad)";
      return;
    }
    db.admins.push({ user: u, pass: p });
    MajorDB.save(db);
    e.target.reset();
    flashMsg($("adminMsg"), t("adminAdded"));
    renderAdmins();
  });
  $("adminTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-adel");
    if (i == null) return;
    var db = MajorDB.load();
    db.admins.splice(+i, 1);
    MajorDB.save(db);
    renderAdmins();
  });

  /* ===== CHAT ===== */
  function renderChats() {
    if (!$("chatList")) return;
    var list = $("chatList");
    if (!S.chats.length) {
      list.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      var log = $("adminChatLog");
      if (log) log.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      return;
    }
    list.innerHTML = S.chats.map(function (c) {
      var last = c.messages && c.messages[c.messages.length - 1];
      return '<div class="live-item' + (c.id === activeChat ? " active" : "") + '" data-cid="' + c.id + '"><b>' + esc(c.name || "زبون") +
        '</b><br><small class="sub">' + (last ? esc(last.text).slice(0, 30) : "") + "</small>" +
        '<button class="chat-del danger btn" data-cdel="' + c.id + '">🗑</button></div>';
    }).join("");
    drawAdminThread();
  }
  function drawAdminThread() {
    var log = $("adminChatLog");
    if (!log) return;
    var c = S.chats.find(function (x) { return x.id === activeChat; });
    if (!c) { log.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>"; return; }
    log.innerHTML = (c.messages || []).map(function (m) {
      return '<div class="bubble ' + m.from + '">' + esc(m.text) + "<time>" + esc(m.at) + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }
  $("chatList").addEventListener("click", function (e) {
    var delBtn = e.target.closest("[data-cdel]");
    if (delBtn) {
      var cid = delBtn.getAttribute("data-cdel");
      if (!confirm(t("confirmDelete"))) return;
      S.chats = S.chats.filter(function (c) { return c.id !== cid; });
      if (activeChat === cid) activeChat = "";
      deleteChat(cid);
      renderChats();
      return;
    }
    var item = e.target.closest("[data-cid]");
    if (!item) return;
    activeChat = item.getAttribute("data-cid");
    renderChats();
  });
  function sendAdmin() {
    var input = $("adminChatInput");
    var text = input.value.trim();
    if (!text || !activeChat) return;
    var c = S.chats.find(function (x) { return x.id === activeChat; });
    if (!c) return;
    var msg = { from: "admin", text: text, at: new Date().toLocaleString(), ts: Date.now() };
    if (!c.messages) c.messages = [];
    c.messages.push(msg);
    c.updated = Date.now();
    input.value = "";
    sendChat(msg);
    renderChats();
  }
  $("adminChatSend").addEventListener("click", sendAdmin);
  $("adminChatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendAdmin(); });
})();