(function () {
  var session = sessionStorage.getItem("major360_admin");
  var db = MajorDB.load();
  var productImage = "";
  var activeChat = "";

  function $(id) { return document.getElementById(id); }
  function t(k) { return MajorI18n.t(k); }

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

  function showApp() {
    $("loginBox").style.display = "none";
    $("dash").style.display = "grid";
    $("who").textContent = session;
    renderAll();
  }

  if (session) showApp();

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

  document.getElementById("swapLang").addEventListener("click", function () {
    MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
  });

  MajorI18n.onChange = function () { renderAll(); };

  document.querySelectorAll(".side button[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".side button[data-tab]").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
      $(b.getAttribute("data-tab")).classList.add("active");
    });
  });

  function renderAll() {
    db = MajorDB.load();
    $("discordUrl").value = db.discord;
    if ($("whatsappNum")) $("whatsappNum").value = db.whatsapp || "";
    if ($("whatsappMsg")) $("whatsappMsg").value = db.whatsappMsg || "";
    if ($("annTextInput")) $("annTextInput").value = db.announcement || "";
    if ($("annTextEnInput")) $("annTextEnInput").value = db.announcementEn || "";
    if ($("annEnabled")) $("annEnabled").checked = db.announcementEnabled !== false;
    renderProducts();
    renderAdmins();
    renderOrders();
    renderChats();
    renderMembers();
    renderStats();
    renderCoupons();
  }

  /* STATS */
  function renderStats() {
    var orders = db.orders || [];
    $("statOrders").textContent = orders.length;
    var revenue = orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    $("statRevenue").textContent = "$" + Number(revenue).toFixed(2);
    var pending = orders.filter(function (o) { return (o.status || "pending") === "pending"; }).length;
    var confirmed = orders.filter(function (o) { return o.status === "confirmed"; }).length;
    var delivered = orders.filter(function (o) { return o.status === "delivered"; }).length;
    $("statPending").textContent = pending;
    $("statConfirmed").textContent = confirmed;
    $("statDelivered").textContent = delivered;
    var map = {};
    orders.forEach(function (o) {
      (o.items || []).forEach(function (i) { map[i.name] = (map[i.name] || 0) + i.qty; });
    });
    var top = Object.keys(map).sort(function (a, b) { return map[b] - map[a]; }).slice(0, 5);
    $("topProducts").innerHTML = top.length
      ? top.map(function (name) { return "<div class='top-item'>• " + name + " <b>×" + map[name] + "</b></div>"; }).join("")
      : '<span class="sub">' + t("noOrders") + "</span>";
  }

  function renderMembers() {
    var box = $("memberTable");
    if (!box) return;
    var list = db.users || [];
    box.innerHTML = list.length
      ? list.map(function (u) {
          return "<tr><td>" + (u.at || "") + "</td><td>" + (u.name || "") + "</td><td>" +
            (u.provider || "") + "</td><td>" + (u.handle || "") + "</td></tr>";
        }).join("")
      : '<tr><td colspan="4">' + t("noMembers") + "</td></tr>";
  }

  function renderProducts() {
    $("pCount").textContent = db.products.length;
    $("productTable").innerHTML = db.products.map(function (p) {
      var n = (MajorI18n.getLang() === "en" ? (p.nameEn || p.name) : p.name);
      var pic = p.image ? '<img class="mini-thumb" src="' + p.image + '" alt="" />' : (p.emoji || "🎮");
      return "<tr><td>" + pic + "</td><td>" + n + "</td><td>" + p.cat + "</td><td>$" + Number(p.price).toFixed(2) +
        '</td><td><button class="danger" data-del="' + p.id + '">' + t("del") + "</button></td></tr>";
    }).join("");
  }

  $("pimage").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { productImage = ""; return; }
    compressImage(file, 800, 0.7, function (data) {
      productImage = data;
      var prev = $("pimagePreview");
      prev.src = data;
      prev.classList.add("show");
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
    $("pimagePreview").classList.remove("show");
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

  $("saveDiscord").addEventListener("click", function () {
    db = MajorDB.load();
    db.discord = $("discordUrl").value.trim();
    MajorDB.save(db);
    $("savedMsg").textContent = t("saved");
  });

  function renderAdmins() {
    $("adminTable").innerHTML = db.admins.map(function (a, i) {
      var del = a.user === "MAJOR" ? "" : '<button class="danger" data-adel="' + i + '">' + t("del") + "</button>";
      return "<tr><td>" + a.user + "</td><td>••••••••</td><td>" + del + "</td></tr>";
    }).join("");
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

  function renderOrders() {
    $("oCount").textContent = db.orders.length;
    $("orderTable").innerHTML = db.orders.map(function (o) {
      var items = o.items.map(function (i) { return i.name + " ×" + i.qty; }).join(" | ");
      var shot = o.proof ? '<img class="order-shot" src="' + o.proof + '" alt="proof" />' : "-";
      var status = o.status || "pending";
      var statusKey = "status" + status.charAt(0).toUpperCase() + status.slice(1);
      var couponInfo = o.coupon ? "<br>🎫 " + o.coupon : "";
      var btns = '<div class="status-btns">';
      if (status === "pending") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="confirmed">' + t("markConfirmed") + '</button> <button class="danger" data-ostat="' + o.id + '" data-next="cancelled">' + t("markCancelled") + '</button>';
      else if (status === "confirmed") btns += '<button class="okbtn" data-ostat="' + o.id + '" data-next="delivered">' + t("markDelivered") + '</button> <button class="danger" data-ostat="' + o.id + '" data-next="cancelled">' + t("markCancelled") + '</button>';
      else if (status === "delivered") btns += '<span class="sub">✅</span>';
      else if (status === "cancelled") btns += '<span class="sub">❌</span>';
      btns += '</div>';
      return "<tr><td>" + (o.at || "") + "</td><td>" + (o.name || "") +
        "</td><td>" + (o.contact || o.phone || "") + "<br>" + (o.country || "") +
        "</td><td>" + items + couponInfo + "</td><td>$" + Number(o.total).toFixed(2) +
        "</td><td>" + shot + "</td><td><span class='status-" + status + "'>" + t(statusKey) + "</span><br>" + btns + "</td></tr>";
    }).join("") || '<tr><td colspan="7">' + t("noOrders") + "</td></tr>";
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

  /* WHATSAPP SETTINGS */
  if ($("saveWhatsapp")) {
    $("saveWhatsapp").addEventListener("click", function () {
      db = MajorDB.load();
      db.whatsapp = $("whatsappNum").value.trim();
      db.whatsappMsg = $("whatsappMsg").value.trim() || "مرحباً! أريد الاستفسار عن منتج";
      MajorDB.save(db);
      $("whatsappSaved").textContent = t("whatsappSaved");
    });
  }

  /* ANNOUNCEMENT SETTINGS */
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

  /* COUPONS */
  function renderCoupons() {
    var list = db.coupons || [];
    $("couponTable").innerHTML = list.length
      ? list.map(function (c, i) {
          var label = c.type === "percent" ? c.value + "%" : "$" + c.value;
          return "<tr><td>" + c.code + "</td><td>" + label + "</td><td>" + (c.used || 0) + "/" + (c.max || "∞") +
            "</td><td>" + (c.expires || "-") + '</td><td><button class="danger" data-cdel="' + i + '">' + t("couponDelete") + "</button></td></tr>";
        }).join("")
      : '<tr><td colspan="5">' + t("noCoupons") + "</td></tr>";
  }

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

  $("couponTable").addEventListener("click", function (e) {
    var i = e.target.getAttribute("data-cdel");
    if (i == null) return;
    db = MajorDB.load();
    db.coupons.splice(+i, 1);
    MajorDB.save(db);
    renderAll();
  });

  /* Export CSV */
  document.getElementById("exportCSV").addEventListener("click", function () {
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

  $("orderTable").addEventListener("click", function (e) {
    if (e.target.tagName === "IMG" && e.target.src) window.open(e.target.src, "_blank");
  });

  function renderChats() {
    if (!db.chats) db.chats = [];
    var list = $("chatList");
    if (!list) return;
    if (!db.chats.length) {
      list.innerHTML = '<p class="sub" style="padding:12px">' + t("noChats") + "</p>";
      $("adminChatLog").innerHTML = "";
      return;
    }
    list.innerHTML = db.chats.map(function (c) {
      var last = c.messages[c.messages.length - 1];
      var unread = c.messages.filter(function (m) { return m.from === "user" && !m.seen; }).length;
      var badge = unread > 0 ? ' <span class="chat-unread">' + unread + "</span>" : "";
      return '<div class="live-item' + (c.id === activeChat ? " active" : "") + '" data-cid="' + c.id + '"><b>' +
        c.name + (c.handle ? " · " + c.handle : "") + badge + "</b><br><small class='sub'>" + (last ? last.text.slice(0, 40) : "") + "</small></div>";
    }).join("");
    drawAdminThread();
  }

  function drawAdminThread() {
    var log = $("adminChatLog");
    var c = (db.chats || []).find(function (x) { return x.id === activeChat; });
    if (!c) {
      log.innerHTML = '<p class="sub">' + t("noChats") + "</p>";
      return;
    }
    // Mark messages as seen
    c.messages.forEach(function (m) { if (m.from === "user") m.seen = true; });
    log.innerHTML = c.messages.map(function (m) {
      return '<div class="bubble ' + m.from + '">' + String(m.text).replace(/</g, "&lt;") + "<time>" + m.at + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
  }

  $("chatList").addEventListener("click", function (e) {
    var item = e.target.closest("[data-cid]");
    if (!item) return;
    activeChat = item.getAttribute("data-cid");
    db = MajorDB.load();
    renderChats();
  });

  function sendAdmin() {
    var input = $("adminChatInput");
    var text = input.value.trim();
    if (!text || !activeChat) return;
    db = MajorDB.load();
    var c = db.chats.find(function (x) { return x.id === activeChat; });
    if (!c) return;
    c.messages.push({ from: "admin", text: text, at: new Date().toLocaleString(), ts: Date.now() });
    c.updated = Date.now();
    MajorDB.save(db);
    input.value = "";
    renderChats();
  }
  $("adminChatSend").addEventListener("click", sendAdmin);
  $("adminChatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendAdmin(); });

  setInterval(function () {
    if ($("tabChat") && $("tabChat").classList.contains("active")) {
      db = MajorDB.load();
      renderChats();
    }
  }, 2000);
})();