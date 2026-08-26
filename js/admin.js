(function () {
  var session = sessionStorage.getItem("major360_admin");
  var db = MajorDB.load();
  var productImage = "";
  var activeChat = "";
  var lastOrderCount = db.orders ? db.orders.length : 0;
  var newOrdersCount = 0;
  var newChatsCount = 0;
  var soundEnabled = true;

  function $(id) { return document.getElementById(id); }
  function qs(s) { return document.querySelector(s); }
  function qsa(s) { return document.querySelectorAll(s); }
  function t(k) { return MajorI18n.t(k); }

  /* ===== SMS-STYLE ORDER SOUND ===== */
  function playOrderSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      function beep(freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      }
      // SMS-style two-tone
      beep(660, 0);
      beep(880, 0.1);
    } catch(e) {}
  }

  /* ===== SMS-STYLE CHAT SOUND ===== */
  function playChatSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      function beep(freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.1);
      }
      // SMS triplet — ding ding ding!
      beep(880, 0);
      beep(1100, 0.09);
      beep(880, 0.18);
    } catch(e) {}
  }

  /* ===== CHAT NOTIFICATION ===== */
  function updateNewChatBadge() {
    var badge = document.getElementById("newChatBadge");
    if (!badge) return;
    if (newChatsCount > 0) {
      badge.textContent = newChatsCount;
      badge.classList.add("show");
    } else {
      badge.classList.remove("show");
    }
    updateTitle();
  }

  function showChatNotification(name, text) {
    var el = document.getElementById("chatNotify");
    if (!el) return;
    el.innerHTML = '<div class="notif-inner"><div class="notif-icon">💬</div><div class="notif-body"><b>' + (name || "زبون") + '</b><p class="sub">' + (text || "") + '</p></div></div>';
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.classList.remove("show"); }, 5000);
  }

  function updateTitle() {
    var parts = [];
    if (newOrdersCount > 0) parts.push("🛒" + newOrdersCount);
    if (newChatsCount > 0) parts.push("💬" + newChatsCount);
    var prefix = parts.length ? "(" + parts.join(" ") + ") " : "";
    var title = document.title.replace(/^\(.*?\)\s*/, "");
    document.title = prefix + title;
  }

  /* ===== NEW ORDERS CHECK ===== */
  function checkNewOrders() {
    db = MajorDB.load();
    var currentCount = db.orders ? db.orders.length : 0;
    var diff = currentCount - lastOrderCount;
    if (diff > 0) {
      newOrdersCount += diff;
      updateNewOrdersBadge();
      if (soundEnabled) playOrderSound();
      var newest = db.orders.slice(0, diff);
      newest.forEach(function(o) { showOrderNotification(o); });
      lastOrderCount = currentCount;
    }
  }

  function updateNewOrdersBadge() {
    var badge = document.querySelector(".badge-new");
    if (!badge) return;
    if (newOrdersCount > 0) {
      badge.textContent = newOrdersCount;
      badge.classList.add("show");
    } else {
      badge.classList.remove("show");
    }
    updateTitle();
  }

  function showOrderNotification(o) {
    var el = document.getElementById("orderNotify");
    if (!el) return;
    var items = o.items.map(function(i) { return i.name + " x" + i.qty; }).join(" | ");
    el.innerHTML = '<div class="notif-inner"><div class="notif-icon">🔔</div><div class="notif-body"><b>' + (o.name || t("name")) + '</b><p class="sub">' + items + '</p><small>' + t("total") + ' $' + Number(o.total).toFixed(2) + '</small></div></div>';
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.classList.remove("show"); }, 5000);
  }

  /* ===== COMPRESS IMAGE ===== */
  function compressImage(file, max, quality, cb) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      cb(c.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  }

  /* ===== SHOW APP ===== */
  function showApp() {
    $("loginBox").style.display = "none";
    $("dash").style.display = "block";
    document.getElementById("who").textContent = session;
    renderAll();
  }

  if (session) showApp();

  /* ===== LOGIN ===== */
  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("user").value.trim();
    var p = $("pass").value;
    db = MajorDB.load();
    var ok = db.admins.some(function (a) { return a.user === u && a.pass === p; });
    if (!ok) {
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

  MajorI18n.onChange = function () { renderAll(); };

  /* ===== SIDEBAR NAV ===== */
  qsa(".side-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      qsa(".side-btn").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      qsa(".panel").forEach(function (p) { p.classList.remove("active"); });
      var tab = $(b.getAttribute("data-tab"));
      if (tab) tab.classList.add("active");
      if (b.getAttribute("data-tab") === "tabOrders") {
        newOrdersCount = 0;
        updateNewOrdersBadge();
      }
      if (b.getAttribute("data-tab") === "tabChat") {
        newChatsCount = 0;
        updateNewChatBadge();
      }
    });
  });

  /* ===== RENDER ALL ===== */
  function renderAll() {
    db = MajorDB.load();
    if ($("discordUrl")) $("discordUrl").value = db.discord;
    if ($("whatsappNum")) $("whatsappNum").value = db.whatsapp || "";
    if ($("whatsappMsg")) $("whatsappMsg").value = db.whatsappMsg || "";
    if ($("annTextInput")) $("annTextInput").value = db.announcement || "";
    if ($("annTextEnInput")) $("annTextEnInput").value = db.announcementEn || "";
    if ($("annEnabled")) $("annEnabled").checked = db.announcementEnabled !== false;
    renderProducts();
    renderAdmins();
    renderOrders();
    renderChats();
    renderStats();
    renderCoupons();
    renderPayments();
  }

  /* ===== PAYMENTS ===== */
  function renderPayments() {
    if (!$("payTable")) return;
    var list = db.payMethods || [];
    $("payTable").innerHTML = list.length
      ? list.map(function (p, i) {
          var short = String(p.wallet || "").slice(0, 14) + "…" + String(p.wallet || "").slice(-6);
          return "<tr><td>" + (p.icon || "💳") + " " + (p.label || "") + "</td><td>" + (p.network || "-") +
            "</td><td><code class='wallet-code'>" + short + "</code></td>" +
            "<td><button class='danger' data-pdel='" + i + "'>&times;</button></td></tr>";
        }).join("")
      : '<tr><td colspan="4" style="text-align:center;color:var(--muted)">' + t("noPayments") + "</td></tr>";
  }

  function addPaymentMethod() {
    db = MajorDB.load();
    var label = ($("payLabel") ? $("payLabel").value : "").trim();
    if (!label) return;
    var wallet = ($("payWallet") ? $("payWallet").value : "").trim();
    if (!wallet) return;
    if (!db.payMethods) db.payMethods = [];
    db.payMethods.push({
      id: "pm" + Date.now(),
      label: label,
      labelEn: ($("payLabelEn") ? $("payLabelEn").value : "").trim() || label,
      network: ($("payNetwork") ? $("payNetwork").value : "").trim(),
      wallet: wallet,
      icon: ($("payIcon") ? $("payIcon").value : "").trim() || "💳",
      qr: !$("payQr") || $("payQr").checked
    });
    MajorDB.save(db);
    if ($("payLabel")) $("payLabel").value = "";
    if ($("payLabelEn")) $("payLabelEn").value = "";
    if ($("payNetwork")) $("payNetwork").value = "";
    if ($("payWallet")) $("payWallet").value = "";
    if ($("paySaved")) $("paySaved").textContent = t("saved");
    setTimeout(function () { if ($("paySaved")) $("paySaved").textContent = ""; }, 2500);
    renderPayments();
  }

  /* ===== STATS ===== */
  function renderStats() {
    var orders = db.orders || [];
    if ($("statOrders")) $("statOrders").textContent = orders.length;
    var revenue = orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    if ($("statRevenue")) $("statRevenue").textContent = "$" + Number(revenue).toFixed(2);
    var pending = orders.filter(function (o) { return (o.status || "pending") === "pending"; }).length;
    var confirmed = orders.filter(function (o) { return o.status === "confirmed"; }).length;
    var delivered = orders.filter(function (o) { return o.status === "delivered"; }).length;
    if ($("statPending")) $("statPending").textContent = pending;
    if ($("statConfirmed")) $("statConfirmed").textContent = confirmed;
    if ($("statDelivered")) $("statDelivered").textContent = delivered;
    var map = {};
    orders.forEach(function (o) {
      (o.items || []).forEach(function (i) { map[i.name] = (map[i.name] || 0) + i.qty; });
    });
    var top = Object.keys(map).sort(function (a, b) { return map[b] - map[a]; }).slice(0, 5);
    if ($("topProducts")) {
      $("topProducts").innerHTML = top.length
        ? top.map(function (name) { return '<div class="top-item">• ' + name + ' <b>x' + map[name] + "</b></div>"; }).join("")
        : '<span style="color:var(--muted)">' + t("noOrders") + "</span>";
    }
  }

  /* ===== PRODUCTS ===== */
  function renderProducts() {
    if ($("pCount")) $("pCount").textContent = db.products.length;
    if ($("productTable")) {
      $("productTable").innerHTML = db.products.map(function (p) {
        var n = (MajorI18n.getLang() === "en" ? (p.nameEn || p.name) : p.name);
        var pic = p.image ? '<img class="mini-thumb" src="' + p.image + '" alt="" />' : (p.emoji || "🎮");
        return "<tr><td>" + pic + "</td><td>" + n + "</td><td>" + p.cat + "</td><td>$" + Number(p.price).toFixed(2) +
          '</td><td><button class="danger" data-del="' + p.id + '">x</button></td></tr>';
      }).join("");
    }
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
    db = MajorDB.load();
    db.products.unshift({
      id: "p" + Date.now(),
      name: $("pname").value.trim(),
      nameEn: $("pnameEn").value.trim(),
      cat: $("pcat").value,
      price: Number($("pprice").value),
      emoji: $("pemoji").value.trim() || "🎮",
      image: productImage,
      desc: $("pdesc").value.trim(),
      descEn: $("pdescEn").value.trim()
    });
    MajorDB.save(db);
    productImage = "";
    var prev = $("pimagePreview");
    if (prev) prev.classList.remove("show");
    e.target.reset();
    renderAll();
  });

  $("productTable").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-del");
    if (!id) return;
    db = MajorDB.load();
    db.products = db.products.filter(function (p) { return p.id !== id; });
    MajorDB.save(db);
    renderAll();
  });

  /* ===== DISCORD ===== */
  if ($("saveDiscord")) {
    $("saveDiscord").addEventListener("click", function () {
      db = MajorDB.load();
      db.discord = $("discordUrl").value.trim();
      MajorDB.save(db);
      $("savedMsg").textContent = t("saved");
    });
  }

  /* ===== ADMINS ===== */
  function renderAdmins() {
    if ($("adminTable")) {
      $("adminTable").innerHTML = db.admins.map(function (a, i) {
        var del = a.user === "MAJOR" ? "" : '<button class="danger" data-adel="' + i + '">x</button>';
        return "<tr><td>" + a.user + "</td><td>••••••••</td><td>" + del + "</td></tr>";
      }).join("");
    }
  }

  $("addAdmin").addEventListener("submit", function (e) {
    e.preventDefault();
    db = MajorDB.load();
    var u = $("auser").value.trim();
    var p = $("apass").value;
    if (db.admins.some(function (a) { return a.user === u; })) {
      $("adminMsg").textContent = t("used");
      return;
    }
    db.admins.push({ user: u, pass: p });
    MajorDB.save(db);
    e.target.reset();
    $("adminMsg").textContent = t("adminAdded");
    renderAll();
  });

  $("adminTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-adel");
    if (i == null) return;
    db = MajorDB.load();
    db.admins.splice(+i, 1);
    MajorDB.save(db);
    renderAll();
  });

  /* ===== ORDERS ===== */
  function renderOrders() {
    if ($("oCount")) $("oCount").textContent = db.orders.length;
    if (!$("orderTable")) return;
    $("orderTable").innerHTML = db.orders.map(function (o) {
      var items = o.items.map(function (i) { return i.name + " x" + i.qty; }).join(" | ");
      var shot = o.proof ? '<img class="order-shot" src="' + o.proof + '" alt="proof" />' : "-";
      var status = o.status || "pending";
      var statusKey = "status" + status.charAt(0).toUpperCase() + status.slice(1);
      var couponInfo = o.coupon ? "<br>🎫 " + o.coupon : "";
      var btns = '<div class="status-btns">';
      if (status === "pending") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="confirmed">✓</button> <button class="danger" data-ostat="' + o.id + '" data-next="cancelled">✗</button>';
      else if (status === "confirmed") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="delivered">✓✓</button> <button class="danger" data-ostat="' + o.id + '" data-next="cancelled">✗</button>';
      else if (status === "delivered") btns += '<span style="color:var(--green)">✓✓✓</span>';
      else if (status === "cancelled") btns += '<span style="color:var(--red)">✗✗</span>';
      btns += "</div>";
      var pmLabel = o.payLabel ? "<br>💳 " + o.payLabel : "";
      return "<tr><td>" + (o.at || "") + "</td><td>" + (o.name || "") +
        "</td><td>" + (o.contact || "") + "<br>" + (o.country || "") + pmLabel +
        "</td><td>" + items + couponInfo + "</td><td>$" + Number(o.total).toFixed(2) +
        "</td><td>" + shot + "</td><td><span class='status-" + status + "'>" + t(statusKey) + "</span><br>" + btns + "</td></tr>";
    }).join("") || '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px">' + t("noOrders") + "</td></tr>";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-ostat]");
    if (!btn) return;
    var id = btn.getAttribute("data-ostat");
    var next = btn.getAttribute("data-next");
    db = MajorDB.load();
    var o = db.orders.find(function (x) { return x.id === id; });
    if (o) { o.status = next; MajorDB.save(db); renderAll(); }
  });

  if ($("exportCSV")) {
    $("exportCSV").addEventListener("click", function () {
      db = MajorDB.load();
      var rows = [["Time", "Name", "Contact", "Country", "Items", "Total", "Status", "Coupon"]];
      db.orders.forEach(function (o) {
        var items = o.items.map(function (i) { return i.name + " x" + i.qty; }).join("; ");
        rows.push([o.at, o.name, o.contact, o.country, items, o.total, o.status || "pending", o.coupon || ""]);
      });
      var csv = rows.map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
      var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "orders_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
    });
  }

  if ($("orderTable")) {
    $("orderTable").addEventListener("click", function (e) {
      if (e.target.tagName === "IMG" && e.target.src) window.open(e.target.src, "_blank");
    });
  }

  /* ===== WHATSAPP ===== */
  if ($("saveWhatsapp")) {
    $("saveWhatsapp").addEventListener("click", function () {
      db = MajorDB.load();
      db.whatsapp = $("whatsappNum").value.trim();
      db.whatsappMsg = $("whatsappMsg").value.trim() || "مرحاً";
      MajorDB.save(db);
      $("whatsappSaved").textContent = t("whatsappSaved");
    });
  }

  /* ===== ANNOUNCEMENT ===== */
  if ($("saveAnnouncement")) {
    $("saveAnnouncement").addEventListener("click", function () {
      db = MajorDB.load();
      db.announcement = $("annTextInput").value.trim();
      db.announcementEn = $("annTextEnInput").value.trim();
      db.announcementEnabled = $("annEnabled").checked;
      MajorDB.save(db);
      $("annSaved").textContent = t("annSaved");
    });
  }

  /* ===== COUPONS ===== */
  function renderCoupons() {
    if (!$("couponTable")) return;
    var list = db.coupons || [];
    $("couponTable").innerHTML = list.length
      ? list.map(function (c, i) {
          var label = c.type === "percent" ? c.value + "%" : "$" + c.value;
          return "<tr><td>" + c.code + "</td><td>" + label + "</td><td>" + (c.used || 0) + "/" + (c.max || "∞") +
            "</td><td>" + (c.expires || "-") + '</td><td><button class="danger" data-cdel="' + i + '">x</button></td></tr>';
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">' + t("noCoupons") + "</td></tr>";
  }

  if ($("addCouponForm")) {
    $("addCouponForm").addEventListener("submit", function (e) {
      e.preventDefault();
      db = MajorDB.load();
      if (!db.coupons) db.coupons = [];
      db.coupons.push({
        code: $("ccode").value.trim().toUpperCase(),
        type: $("ctype").value,
        value: Number($("cvalue").value),
        max: Number($("cmax").value) || 0,
        used: 0,
        expires: $("cexpires").value || ""
      });
      MajorDB.save(db);
      e.target.reset();
      renderAll();
    });
  }

  if ($("couponTable")) {
    $("couponTable").addEventListener("click", function (e) {
      var i = e.target.getAttribute("data-cdel");
      if (i == null) return;
      db = MajorDB.load();
      db.coupons.splice(+i, 1);
      MajorDB.save(db);
      renderAll();
    });
  }

  /* ===== PAYMENTS (add / delete) ===== */
  if ($("addPayment")) {
    $("addPayment").addEventListener("click", addPaymentMethod);
  }

  if ($("payTable")) {
    $("payTable").addEventListener("click", function (e) {
      var i = e.target.getAttribute("data-pdel");
      if (i == null) return;
      db = MajorDB.load();
      db.payMethods.splice(+i, 1);
      MajorDB.save(db);
      if ($("paySaved")) $("paySaved").textContent = t("removed");
      setTimeout(function () { if ($("paySaved")) $("paySaved").textContent = ""; }, 2500);
      renderPayments();
    });
  }

  /* ===== CHAT — Socket.IO Real-time ===== */
  var chatSocket = null;
  try { chatSocket = io(); } catch(e) { chatSocket = null; }

  function renderChats() {
    if (!db.chats) db.chats = [];
    var list = document.getElementById("chatList");
    if (!list) return;
    if (!db.chats.length) {
      list.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      var chatLog = document.getElementById("adminChatLog");
      if (chatLog) chatLog.innerHTML = '<p class="empty-chat" style="min-height:unset">' + t("noChats") + "</p>";
      return;
    }
    list.innerHTML = db.chats.map(function (c) {
      var last = c.messages[c.messages.length - 1];
      var unread = c.messages.filter(function (m) { return m.from === "user" && !m.seen; }).length;
      var badge = unread > 0 ? ' <span class="chat-unread">' + unread + "</span>" : "";
      return '<div class="live-item' + (c.id === activeChat ? " active" : "") + '" data-cid="' + c.id + '"><b>' +
        c.name + badge + "</b><br><small class='sub'>" + (last ? last.text.slice(0, 30) : "") + "</small>" +
        '<button class="chat-del danger" data-cdel="' + c.id + '" title="حذف">&times;</button></div>';
    }).join("");
    drawAdminThread();
  }

  function drawAdminThread() {
    var log = document.getElementById("adminChatLog");
    if (!log) return;
    var c = (db.chats || []).find(function (x) { return x.id === activeChat; });
    if (!c) {
      log.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      return;
    }
    c.messages.forEach(function (m) { if (m.from === "user") m.seen = true; });
    log.innerHTML = c.messages.map(function (m) {
      return '<div class="bubble ' + m.from + '">' + String(m.text).replace(/</g, "&lt;") + "<time>" + m.at + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  // Socket events
  if (chatSocket) {
    // New chat created by a customer
    chatSocket.on("chat:new", function (data) {
      db = MajorDB.load();
      // Check if we already have this chat
      var exists = db.chats.some(function (c) { return c.id === data.chatId; });
      if (!exists) {
        db.chats.unshift({
          id: data.chatId,
          name: data.name || "زبون",
          updated: Date.now(),
          messages: []
        });
        MajorDB.save(db);
      }
      renderChats();
      newChatsCount++;
      updateNewChatBadge();
      showChatNotification(data.name || "زبون", "بدأ محادثة جديدة");
      if (soundEnabled) playChatSound();
    });

    // New message in a chat
    chatSocket.on("chat:message", function (data) {
      db = MajorDB.load();
      if (data.message.from !== "user") return; // only user msgs trigger notification
      var c = db.chats.find(function (x) { return x.id === data.chatId; });
      if (c) {
        var exists = c.messages.some(function (m) { return m.ts === data.message.ts; });
        if (!exists) {
          c.messages.push(data.message);
          c.updated = Date.now();
          MajorDB.save(db);
          renderChats();
          // Increment unread badge + notify
          newChatsCount++;
          updateNewChatBadge();
          showChatNotification(c.name || "زبون", data.message.text);
          if (soundEnabled) playChatSound();
        }
      }
    });

    // Chat deleted by admin from another tab
    chatSocket.on("chat:deleted", function (chatId) {
      db = MajorDB.load();
      db.chats = (db.chats || []).filter(function (c) { return c.id !== chatId; });
      if (activeChat === chatId) activeChat = "";
      MajorDB.save(db);
      renderChats();
    });

    // Join all existing chats on connect
    chatSocket.on("connect", function () {
      db = MajorDB.load();
      (db.chats || []).forEach(function (c) {
        chatSocket.emit("chat:join", c.id);
      });
    });
  }

  document.getElementById("chatList").addEventListener("click", function (e) {
    // Delete chat
    var delBtn = e.target.closest("[data-cdel]");
    if (delBtn) {
      var cid = delBtn.getAttribute("data-cdel");
      if (!confirm(t("confirmDelete") || "Confirm delete?")) return;
      db = MajorDB.load();
      db.chats = (db.chats || []).filter(function (c) { return c.id !== cid; });
      if (activeChat === cid) activeChat = "";
      MajorDB.save(db);
      if (chatSocket) chatSocket.emit("chat:delete", cid);
      renderChats();
      return;
    }
    // Select chat
    var item = e.target.closest("[data-cid]");
    if (!item) return;
    activeChat = item.getAttribute("data-cid");
    db = MajorDB.load();
    renderChats();
  });

  document.getElementById("adminChatSend").addEventListener("click", function() {
    var input = document.getElementById("adminChatInput");
    var text = input.value.trim();
    if (!text || !activeChat) return;
    db = MajorDB.load();
    var c = db.chats.find(function (x) { return x.id === activeChat; });
    if (!c) return;
    var msg = { from: "admin", text: text, at: new Date().toLocaleString(), ts: Date.now() };
    c.messages.push(msg);
    c.updated = Date.now();
    MajorDB.save(db);
    input.value = "";
    // Emit via socket
    if (chatSocket) chatSocket.emit("chat:message", { chatId: activeChat, message: msg });
    renderChats();
  });

  document.getElementById("adminChatInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      document.getElementById("adminChatSend").click();
    }
  });

  /* ===== INTERVALS ===== */
  setInterval(function() {
    checkNewOrders();
  }, 3000);

  /* ===== SOUND TOGGLE ===== */
  document.addEventListener("click", function(e) {
    var btn = e.target.closest("#soundToggle");
    if (btn) {
      soundEnabled = !soundEnabled;
      btn.classList.toggle("muted");
    }
  });
})();