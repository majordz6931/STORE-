(function () {
  var session = sessionStorage.getItem("major360_admin");
  var productImage = "";
  var activeChat = "";
  var soundEnabled = true;
  var newOrdersCount = 0;
  var newChatsCount = 0;
  var baseOrderCount = -1; // -1 until first orders snapshot arrives

  // Server-backed collections (single source of truth)
  var serverSource = {
    products: [],
    payments: [],
    orders: [],
    coupons: [],
    config: null
  };

  function $(id) { return document.getElementById(id); }
  function qs(s) { return document.querySelector(s); }
  function qsa(s) { return document.querySelectorAll(s); }
  function t(k) { return MajorI18n.t(k); }

  /* ===== REALTIME COLLECTION SYNC ===== */
  function fetchAll() {
    fetch("/api/products", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      serverSource.products = Array.isArray(d) ? d : [];
      renderProducts();
    }).catch(function () {});
    fetch("/api/payments", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      serverSource.payments = Array.isArray(d) ? d : [];
      renderPayments();
    }).catch(function () {});
    fetch("/api/orders", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      serverSource.orders = Array.isArray(d) ? d : [];
      renderOrders();
      renderStats();
    }).catch(function () {});
    fetch("/api/coupons", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      serverSource.coupons = Array.isArray(d) ? d : [];
      renderCoupons();
    }).catch(function () {});
    fetch("/api/config", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      serverSource.config = d;
      renderConfig();
    }).catch(function () {});
  }

  var adminSocket = null;
  try { adminSocket = io(); } catch (e) {}

  function bindSocket() {
    if (!adminSocket) return;
    adminSocket.on("connect", function () {
      // Join this admin's existing chat rooms so messages are received.
      var chats = loadLocalChats();
      chats.forEach(function (c) { adminSocket.emit("chat:join", c.id); });
    });

    adminSocket.on("products:set", function (d) {
      serverSource.products = Array.isArray(d) ? d : [];
      renderProducts();
    });
    adminSocket.on("payments:updated", function (d) {
      serverSource.payments = Array.isArray(d) ? d : [];
      renderPayments();
    });
    adminSocket.on("orders:updated", function (d) {
      var list = Array.isArray(d) ? d : [];
      // First snapshot = baseline (no "new order" alert for existing orders).
      if (baseOrderCount === -1) {
        baseOrderCount = list.length;
        serverSource.orders = list;
        renderOrders();
        renderStats();
        return;
      }
      serverSource.orders = list;
      renderOrders();
      renderStats();
      // New orders arrived since the last snapshot.
      if (list.length > baseOrderCount) {
        var fresh = list.slice(0, list.length - baseOrderCount);
        newOrdersCount += fresh.length;
        updateNewOrdersBadge();
        if (soundEnabled) playOrderSound();
        fresh.forEach(function (o) { showOrderNotification(o); });
      }
      baseOrderCount = list.length;
    });
    adminSocket.on("coupons:set", function (d) {
      serverSource.coupons = Array.isArray(d) ? d : [];
      renderCoupons();
    });
    adminSocket.on("config:set", function (d) {
      serverSource.config = d;
      renderConfig();
    });

    // ---- Chat (kept server-side, listed here) ----
    adminSocket.on("chat:new", function (data) {
      var chats = loadLocalChats();
      var exists = chats.some(function (c) { return c.id === data.chatId; });
      if (!exists) {
        chats.unshift({ id: data.chatId, name: data.name || "زبون", updated: Date.now(), messages: [] });
        saveLocalChats(chats);
        adminSocket.emit("chat:join", data.chatId);
      }
      renderChats();
      newChatsCount++;
      updateNewChatBadge();
      showChatNotification(data.name || "زبون", t("newChat"));
      if (soundEnabled) playChatSound();
    });

    adminSocket.on("chat:message", function (data) {
      if (data.message.from !== "user") return;
      var chats = loadLocalChats();
      var c = chats.find(function (x) { return x.id === data.chatId; });
      if (!c) {
        c = { id: data.chatId, name: data.name || "زبون", updated: Date.now(), messages: [] };
        chats.unshift(c);
      }
      var exists = c.messages.some(function (m) { return m.ts === data.message.ts; });
      if (!exists) {
        c.messages.push(data.message);
        c.updated = Date.now();
        saveLocalChats(chats);
        renderChats();
        newChatsCount++;
        updateNewChatBadge();
        showChatNotification(c.name || "زبون", data.message.text);
        if (soundEnabled) playChatSound();
      }
    });

    adminSocket.on("chat:deleted", function (chatId) {
      var chats = loadLocalChats().filter(function (c) { return c.id !== chatId; });
      if (activeChat === chatId) activeChat = "";
      saveLocalChats(chats);
      renderChats();
    });

    adminSocket.on("live:stats", function (data) {
      var v = $("adminVisitorCount");
      if (v) v.textContent = data.visitors || 0;
      var o = $("adminTodayOrders");
      if (o) o.textContent = data.todayOrders || 0;
    });
  }

  /* ===== LOCAL CHAT STORAGE (admin thread only) ===== */
  function loadLocalChats() {
    var db = MajorDB.load();
    return Array.isArray(db.chats) ? db.chats : [];
  }
  function saveLocalChats(chats) {
    var db = MajorDB.load();
    db.chats = chats;
    MajorDB.save(db);
  }

  /* ===== SOUNDS ===== */
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
      beep(660, 0);
      beep(880, 0.1);
    } catch (e) {}
  }

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
      beep(880, 0);
      beep(1100, 0.09);
      beep(880, 0.18);
    } catch (e) {}
  }

  function updateNewChatBadge() {
    var badge = $("newChatBadge");
    if (!badge) return;
    if (newChatsCount > 0) {
      badge.textContent = newChatsCount;
      badge.classList.add("show");
    } else {
      badge.classList.remove("show");
    }
    updateTitle();
  }

  function updateNewOrdersBadge() {
    var badge = qs(".badge-new");
    if (!badge) return;
    if (newOrdersCount > 0) {
      badge.textContent = newOrdersCount;
      badge.classList.add("show");
    } else {
      badge.classList.remove("show");
    }
    updateTitle();
  }

  function updateTitle() {
    var parts = [];
    if (newOrdersCount > 0) parts.push("🛒" + newOrdersCount);
    if (newChatsCount > 0) parts.push("💬" + newChatsCount);
    var prefix = parts.length ? "(" + parts.join(" ") + ") " : "";
    var title = document.title.replace(/^\(.*?\)\s*/, "");
    document.title = prefix + title;
  }

  function showChatNotification(name, text) {
    var el = $("chatNotify");
    if (!el) return;
    el.innerHTML = '<div class="notif-inner"><div class="notif-icon">💬</div><div class="notif-body"><b>' + (name || "زبون") + '</b><p class="sub">' + (text || "") + "</p></div></div>";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 5000);
  }

  function showOrderNotification(o) {
    var el = $("orderNotify");
    if (!el) return;
    var items = o.items.map(function (i) { return i.name + " x" + i.qty; }).join(" | ");
    el.innerHTML = '<div class="notif-inner"><div class="notif-icon">🔔</div><div class="notif-body"><b>' + (o.name || t("name")) + '</b><p class="sub">' + items + '</p><small>' + t("total") + " $" + Number(o.total).toFixed(2) + "</small></div></div>";
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 5000);
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

  /* ===== LOGIN ===== */
  var db = MajorDB.load();
  function authenticate() {
    var u = $("user").value.trim();
    var p = $("pass").value;
    db = MajorDB.load();
    var ok = (db.admins || []).some(function (a) { return a.user === u && a.pass === p; });
    return ok;
  }

  function showApp() {
    $("loginBox").style.display = "none";
    $("dash").style.display = "block";
    $("who").textContent = session;
    fetchAll();
    bindSocket();
  }

  if (session) showApp();

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!authenticate()) {
      $("loginErr").textContent = t("badLogin");
      return;
    }
    session = $("user").value.trim();
    sessionStorage.setItem("major360_admin", session);
    showApp();
  });

  $("logout").addEventListener("click", function () {
    sessionStorage.removeItem("major360_admin");
    location.reload();
  });

  if (qs("#swapLang")) {
    qs("#swapLang").addEventListener("click", function () {
      MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
    });
  }

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
    renderProducts();
    renderAdmins();
    renderOrders();
    renderChats();
    renderStats();
    renderCoupons();
    renderPayments();
    renderConfig();
  }

  /* ===== CONFIG ===== */
  function renderConfig() {
    if (!serverSource.config) return;
    var c = serverSource.config;
    if ($("discordUrl")) $("discordUrl").value = c.discord || "";
    if ($("whatsappNum")) $("whatsappNum").value = c.whatsapp || "";
    if ($("whatsappMsg")) $("whatsappMsg").value = c.whatsappMsg || "";
    if ($("annTextInput")) $("annTextInput").value = c.announcement || "";
    if ($("annTextEnInput")) $("annTextEnInput").value = c.announcementEn || "";
    if ($("annEnabled")) $("annEnabled").checked = c.announcementEnabled !== false;
  }

  if ($("saveDiscord")) {
    $("saveDiscord").addEventListener("click", function () {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discord: $("discordUrl").value.trim() })
      }).then(function () {
        $("savedMsg").textContent = t("saved");
        setTimeout(function () { $("savedMsg").textContent = ""; }, 2500);
      }).catch(function () {});
    });
  }

  if ($("saveWhatsapp")) {
    $("saveWhatsapp").addEventListener("click", function () {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: $("whatsappNum").value.trim(),
          whatsappMsg: $("whatsappMsg").value.trim()
        })
      }).then(function () {
        $("whatsappSaved").textContent = t("whatsappSaved");
        setTimeout(function () { $("whatsappSaved").textContent = ""; }, 2500);
      }).catch(function () {});
    });
  }

  if ($("saveAnnouncement")) {
    $("saveAnnouncement").addEventListener("click", function () {
      fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcement: $("annTextInput").value.trim(),
          announcementEn: $("annTextEnInput").value.trim(),
          announcementEnabled: $("annEnabled").checked
        })
      }).then(function () {
        $("annSaved").textContent = t("annSaved");
        setTimeout(function () { $("annSaved").textContent = ""; }, 2500);
      }).catch(function () {});
    });
  }

  /* ===== PAYMENTS ===== */
  var payQrData = "";

  function renderPayments() {
    if (!$("payTable")) return;
    var list = serverSource.payments;
    $("payTable").innerHTML = list.length
      ? list.map(function (p, i) {
          var short = String(p.wallet || "").slice(0, 14) + "…" + String(p.wallet || "").slice(-6);
          var qrThumb = p.qrImage ? '<img class="mini-thumb" src="' + p.qrImage + '" alt="QR" />' : "-";
          return "<tr><td>" + (p.icon || "💳") + " " + (p.label || "") + "</td><td>" + (p.network || "-") +
            "</td><td><code class='wallet-code'>" + short + "</code></td>" +
            "<td>" + qrThumb + "</td>" +
            "<td><button class='danger' data-pdel='" + i + "'>&times;</button></td></tr>";
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">' + t("noPayments") + "</td></tr>";
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

  function addPaymentMethod() {
    var label = $("payLabel") ? $("payLabel").value.trim() : "";
    if (!label) return;
    var wallet = $("payWallet") ? $("payWallet").value.trim() : "";
    if (!wallet) return;
    var payload = {
      id: "pm" + Date.now(),
      label: label,
      network: $("payNetwork") ? $("payNetwork").value.trim() : "",
      wallet: wallet,
      icon: "💳",
      qrImage: payQrData || ""
    };
    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); })
      .then(function (m) {
        if (m && m.error) {
          if ($("paySaved")) { $("paySaved").textContent = m.error; $("paySaved").style.color = "var(--red)"; }
        } else {
          payQrData = "";
          $("payLabel").value = "";
          $("payNetwork").value = "";
          $("payWallet").value = "";
          var pr = $("payQrPreview");
          if (pr) { pr.src = ""; pr.classList.remove("show"); }
          $("payQr").value = "";
          if ($("paySaved")) { $("paySaved").textContent = t("saved"); $("paySaved").style.color = ""; }
        }
        setTimeout(function () { if ($("paySaved")) $("paySaved").textContent = ""; }, 2500);
      })
      .catch(function () {});
  }

  $("addPayment").addEventListener("click", addPaymentMethod);

  $("payTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-pdel");
    if (i == null) return;
    var removed = serverSource.payments[+i];
    if (removed && removed.id) {
      fetch("/api/payments/" + encodeURIComponent(removed.id), { method: "DELETE" }).catch(function () {});
    }
    if ($("paySaved")) $("paySaved").textContent = t("removed");
    setTimeout(function () { if ($("paySaved")) $("paySaved").textContent = ""; }, 2500);
  });

  /* ===== STATS ===== */
  function renderStats() {
    var orders = serverSource.orders;
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
    if ($("pCount")) $("pCount").textContent = serverSource.products.length;
    if ($("productTable")) {
      $("productTable").innerHTML = serverSource.products.map(function (p) {
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
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function () {
      productImage = "";
      var prev = $("pimagePreview");
      if (prev) prev.classList.remove("show");
      e.target.reset();
      if ($("productSaved")) { $("productSaved").textContent = t("saved"); $("productSaved").style.color = "var(--green)"; }
      setTimeout(function () { if ($("productSaved")) $("productSaved").textContent = ""; }, 2000);
    }).catch(function () {});
  });

  $("productTable").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-del");
    if (!id) return;
    fetch("/api/products/" + encodeURIComponent(id), { method: "DELETE" }).catch(function () {});
  });

  /* ===== ADMINS (local-only) ===== */
  function renderAdmins() {
    if (!$("adminTable")) return;
    db = MajorDB.load();
    $("adminTable").innerHTML = (db.admins || []).map(function (a, i) {
      var del = a.user === "MAJOR" ? "" : '<button class="danger" data-adel="' + i + '">x</button>';
      return "<tr><td>" + a.user + "</td><td>••••••••</td><td>" + del + "</td></tr>";
    }).join("");
  }

  $("addAdmin").addEventListener("submit", function (e) {
    e.preventDefault();
    db = MajorDB.load();
    var u = $("auser").value.trim();
    var p = $("apass").value;
    if (!db.admins) db.admins = [];
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
    if ($("oCount")) $("oCount").textContent = serverSource.orders.length;
    if (!$("orderTable")) return;
    $("orderTable").innerHTML = serverSource.orders.map(function (o) {
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
    fetch("/api/orders/" + encodeURIComponent(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    }).catch(function () {});
  });

  if ($("exportCSV")) {
    $("exportCSV").addEventListener("click", function () {
      var rows = [["Time", "Name", "Contact", "Country", "Items", "Total", "Status", "Coupon"]];
      serverSource.orders.forEach(function (o) {
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

  $("orderTable").addEventListener("click", function (e) {
    if (e.target.tagName === "IMG" && e.target.src) window.open(e.target.src, "_blank");
  });

  /* ===== COUPONS ===== */
  function renderCoupons() {
    if (!$("couponTable")) return;
    var list = serverSource.coupons;
    $("couponTable").innerHTML = list.length
      ? list.map(function (c, i) {
          var label = c.type === "percent" ? c.value + "%" : "$" + c.value;
          return "<tr><td>" + c.code + "</td><td>" + label + "</td><td>" + (c.used || 0) + "/" + (c.max || "∞") +
            "</td><td>" + (c.expires || "-") + '</td><td><button class="danger" data-cdel="' + i + '">x</button></td></tr>';
        }).join("")
      : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">' + t("noCoupons") + "</td></tr>";
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
    fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function () {
      e.target.reset();
      if ($("couponSaved")) { $("couponSaved").textContent = t("saved"); $("couponSaved").style.color = "var(--green)"; }
      setTimeout(function () { if ($("couponSaved")) $("couponSaved").textContent = ""; }, 2000);
    }).catch(function () {});
  });

  $("couponTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-cdel");
    if (i == null) return;
    var c = serverSource.coupons[+i];
    if (c) fetch("/api/coupons/" + encodeURIComponent(c.code), { method: "DELETE" }).catch(function () {});
  });

  /* ===== CHAT ===== */
  function renderChats() {
    var list = $("chatList");
    if (!list) return;
    var chats = loadLocalChats();
    if (!chats.length) {
      list.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      var chatLog = $("adminChatLog");
      if (chatLog) chatLog.innerHTML = '<p class="empty-chat" style="min-height:unset">' + t("noChats") + "</p>";
      return;
    }
    list.innerHTML = chats.map(function (c) {
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
    var log = $("adminChatLog");
    if (!log) return;
    var chats = loadLocalChats();
    var c = chats.find(function (x) { return x.id === activeChat; });
    if (!c) {
      log.innerHTML = '<p class="empty-chat">' + t("noChats") + "</p>";
      return;
    }
    c.messages.forEach(function (m) { if (m.from === "user") m.seen = true; });
    saveLocalChats(chats);
    log.innerHTML = c.messages.map(function (m) {
      return '<div class="bubble ' + m.from + '">' + String(m.text).replace(/</g, "&lt;") + "<time>" + m.at + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  $("chatList").addEventListener("click", function (e) {
    var delBtn = e.target.closest("[data-cdel]");
    if (delBtn) {
      var cid = delBtn.getAttribute("data-cdel");
      if (!confirm(t("confirmDelete") || "Confirm delete?")) return;
      var chats = loadLocalChats().filter(function (c) { return c.id !== cid; });
      if (activeChat === cid) activeChat = "";
      saveLocalChats(chats);
      if (adminSocket) adminSocket.emit("chat:delete", cid);
      renderChats();
      return;
    }
    var item = e.target.closest("[data-cid]");
    if (!item) return;
    activeChat = item.getAttribute("data-cid");
    renderChats();
  });

  function sendAdminMessage() {
    var input = $("adminChatInput");
    var text = input.value.trim();
    if (!text || !activeChat) return;
    var chats = loadLocalChats();
    var c = chats.find(function (x) { return x.id === activeChat; });
    if (!c) return;
    var msg = { from: "admin", text: text, at: new Date().toLocaleString(), ts: Date.now() };
    c.messages.push(msg);
    c.updated = Date.now();
    saveLocalChats(chats);
    input.value = "";
    if (adminSocket) adminSocket.emit("chat:message", { chatId: activeChat, message: msg });
    renderChats();
  }

  $("adminChatSend").addEventListener("click", sendAdminMessage);
  $("adminChatInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendAdminMessage();
  });

  /* ===== SOUND TOGGLE ===== */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("#soundToggle");
    if (btn) {
      soundEnabled = !soundEnabled;
      btn.classList.toggle("muted");
    }
  });
})();