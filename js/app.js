(function () {
  var cart = JSON.parse(localStorage.getItem("major360_cart") || "[]");
  var filter = "all";
  var searchQuery = "";
  var appliedCoupon = null;
  var chatReady = sessionStorage.getItem("major360_chat_v2") === "1";
  var chatName = chatReady ? (sessionStorage.getItem("major360_chat_name") || "") : "";
  var chatId = chatReady && chatName ? (sessionStorage.getItem("major360_chat") || "") : "";
  var lastSeen = 0;
  var liveSocket = null;

  // Server-backed data (single source of truth)
  var productsList = [];
  var paymentsList = [];
  var couponsList = [];
  var ordersList = [];
  var configData = null;

  var selectedPayId = null;
  var proofData = "";

  function t(k) { return MajorI18n.t(k); }
  function money(n) { return "$" + Number(n).toFixed(2); }
  function pname(p) { return (MajorI18n.getLang() === "en") ? (p.nameEn || p.name) : p.name; }
  function pdesc(p) { return (MajorI18n.getLang() === "en") ? (p.descEn || p.desc || "") : (p.desc || ""); }
  function catName(c) {
    return { cyber: t("catCyber"), streamer: t("catStream"), gaming: t("catGaming") }[c] || c;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }
  function $(id) { return document.getElementById(id); }
  function qs(s) { return document.querySelector(s); }
  function qsa(s) { return document.querySelectorAll(s); }

  function toast(msg) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  function saveCart() {
    localStorage.setItem("major360_cart", JSON.stringify(cart));
    var n = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var el = $("cartCount");
    if (el) el.textContent = n;
  }

  /* ===== SERVER SYNC ===== */
  try { liveSocket = io(MAJOR_SOCKET_URL()); } catch (e) { liveSocket = null; }

  function refreshFromServer() {
    fetch(MAJOR_API("/api/products"), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      productsList = Array.isArray(d) ? d : [];
      renderProducts();
    }).catch(function () {});
    fetch(MAJOR_API("/api/payments"), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      paymentsList = Array.isArray(d) ? d : [];
      renderPayMethods();
    }).catch(function () {});
    fetch(MAJOR_API("/api/coupons"), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      couponsList = Array.isArray(d) ? d : [];
    }).catch(function () {});
    fetch(MAJOR_API("/api/config"), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      configData = d;
      refreshDiscord();
      refreshAnnouncement();
      refreshWhatsApp();
    }).catch(function () {});
  }

  if (liveSocket) {
    liveSocket.on("products:set", function (d) {
      productsList = Array.isArray(d) ? d : [];
      renderProducts();
    });
    liveSocket.on("payments:updated", function (d) {
      paymentsList = Array.isArray(d) ? d : [];
      renderPayMethods();
    });
    liveSocket.on("coupons:set", function (d) {
      couponsList = Array.isArray(d) ? d : [];
    });
    liveSocket.on("config:set", function (d) {
      configData = d;
      refreshDiscord();
      refreshAnnouncement();
      refreshWhatsApp();
    });
    liveSocket.on("orders:updated", function (d) {
      ordersList = Array.isArray(d) ? d : [];
      syncMyOrderStatus();
    });
    liveSocket.on("reconnect", refreshFromServer);
  }

  /* ===== PRODUCTS ===== */
  function renderProducts() {
    var grid = $("products");
    if (!grid) return;
    var q = searchQuery.toLowerCase().trim();
    var list = productsList.filter(function (p) {
      if (filter !== "all" && p.cat !== filter) return false;
      if (!q) return true;
      return (p.name + " " + (p.nameEn || "") + " " + p.desc + " " + (p.descEn || "")).toLowerCase().indexOf(q) !== -1;
    });
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state"><span>📦</span><p class="sub">' + t("noProducts") + "</p></div>";
      return;
    }
    grid.innerHTML = list.map(function (p) {
      var inCart = cart.some(function (x) { return x.id === p.id; });
      var thumb = p.image ? '<img src="' + p.image + '" alt="" />' : (p.emoji || "🎮");
      return '<article class="card"><div class="thumb">' + thumb + '</div><div class="body"><div class="tag">' +
        esc(catName(p.cat)) + '</div><h4>' + esc(pname(p)) + '</h4><p class="sub">' + esc(pdesc(p)) +
        '</p><div class="price">' + Number(p.price).toFixed(2) + '</div><div class="card-actions">' +
        (inCart
          ? '<button class="btn outline" data-added="1">' + t("addedToCart") + '</button><button class="btn" data-buy="' + p.id + '">' + t("buyNow") + "</button>"
          : '<button class="btn" data-add="' + p.id + '">' + t("addCart") + '</button><button class="btn outline" data-buy="' + p.id + '">' + t("buyNow") + "</button>") +
        "</div></article>";
    }).join("");
  }

  function renderCart() {
    var box = $("cartItems");
    if (!box) return;
    if (!cart.length) {
      box.innerHTML = '<p class="sub">' + t("emptyCart") + "</p>";
      $("cartTotal").textContent = money(0);
      return;
    }
    var total = 0;
    box.innerHTML = cart.map(function (i, idx) {
      total += i.price * i.qty;
      var label = MajorI18n.getLang() === "en" ? (i.nameEn || i.name) : i.name;
      return '<div class="cart-row"><div><b>' + esc(label) + '</b><br><span class="sub">' + money(i.price) + '</span></div>' +
        '<div class="qty"><button data-dec="' + idx + '">−</button><span>' + i.qty + '</span><button data-inc="' + idx + '">+</button></div></div>';
    }).join("");
    $("cartTotal").textContent = money(total);
  }

  function addToCart(id) {
    var p = productsList.find(function (x) { return x.id === id; });
    if (!p) return;
    var f = cart.find(function (x) { return x.id === id; });
    if (f) f.qty += 1;
    else cart.push({ id: p.id, name: p.name, nameEn: p.nameEn, price: p.price, qty: 1 });
    saveCart();
    renderCart();
    renderProducts();
    toast(t("added"));
  }

  /* BUY NOW — skips the cart drawer, opens checkout directly */
  function buyNow(id) {
    var p = productsList.find(function (x) { return x.id === id; });
    if (!p) return;
    cart = [{ id: p.id, name: p.name, nameEn: p.nameEn, price: p.price, qty: 1 }];
    saveCart();
    renderCart();
    renderProducts();
    closeCart();
    openCheckout();
  }

  /* ===== CONFIG-DRIVEN UI ===== */
  function refreshDiscord() {
    var href = configData && configData.discord ? configData.discord : "https://discord.gg/WrK7ttvq5g";
    var dl = $("discordLink"), fd = $("footerDiscord");
    if (dl) dl.href = href;
    if (fd) fd.href = href;
  }
  function refreshAnnouncement() {
    var bar = $("announcementBar"), txt = $("annText");
    if (!bar || !txt) return;
    if (!configData || configData.announcementEnabled === false) { bar.style.display = "none"; return; }
    bar.style.display = "block";
    txt.textContent = MajorI18n.getLang() === "en" ? (configData.announcementEn || configData.announcement) : configData.announcement;
  }
  function refreshWhatsApp() {
    var fab = $("whatsappFab");
    if (!fab) return;
    if (configData && configData.whatsapp) {
      fab.style.display = "flex";
      fab.href = "https://wa.me/" + configData.whatsapp.replace(/[^0-9]/g, "") + "?text=" + encodeURIComponent(configData.whatsappMsg || "مرحباً");
    } else fab.style.display = "none";
  }

  /* ===== NAV / CART EVENTS ===== */
  var prev = MajorI18n.onChange;
  MajorI18n.onChange = function () {
    if (typeof prev === "function") prev();
    renderProducts();
    renderCart();
    renderPayMethods();
    drawChat();
    renderOrders();
    refreshAnnouncement();
  };

  refreshFromServer();
  setInterval(function () { if (!productsList.length) refreshFromServer(); }, 4000);
  renderProducts();
  saveCart();
  renderCart();

  $("swapLang").addEventListener("click", function () {
    MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
  });

  $("products").addEventListener("click", function (e) {
    var addId = e.target.getAttribute("data-add");
    if (addId) addToCart(addId);
    var buyId = e.target.getAttribute("data-buy");
    if (buyId) buyNow(buyId);
  });

  qsa(".cat").forEach(function (el) {
    el.addEventListener("click", function () {
      qsa(".cat").forEach(function (c) { c.classList.remove("active"); });
      el.classList.add("active");
      filter = el.getAttribute("data-cat");
      renderProducts();
    });
  });

  var searchInput = $("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () { searchQuery = this.value; renderProducts(); });
  }

  var overlay = $("overlay"), drawer = $("drawer");
  function openCart() { overlay.classList.add("show"); drawer.classList.add("show"); renderCart(); }
  function closeCart() { overlay.classList.remove("show"); drawer.classList.remove("show"); }
  $("openCart").addEventListener("click", openCart);
  overlay.addEventListener("click", closeCart);
  $("closeCart").addEventListener("click", closeCart);
  $("menuBtn").addEventListener("click", function () { $("navLinks").classList.toggle("open"); });

  $("cartItems").addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-inc")) cart[+e.target.getAttribute("data-inc")].qty++;
    if (e.target.hasAttribute("data-dec")) {
      var i = +e.target.getAttribute("data-dec");
      cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
    saveCart();
    renderCart();
  });

  /* ===== CHECKOUT ===== */
  function cartTotal() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function cartTotalWithDiscount() {
    var total = cartTotal();
    if (appliedCoupon) {
      if (appliedCoupon.type === "percent") total = total * (1 - appliedCoupon.value / 100);
      else total = Math.max(0, total - appliedCoupon.value);
    }
    return total;
  }

  function validateCoupon(code) {
    var c = (couponsList || []).find(function (x) { return x.code.toUpperCase() === code.trim().toUpperCase(); });
    if (!c) return null;
    if (c.max && c.used >= c.max) return null;
    if (c.expires && new Date(c.expires) < new Date()) return null;
    return c;
  }

  function activePay() {
    return paymentsList.find(function (m) { return m.id === selectedPayId; }) || paymentsList[0] || null;
  }

  function renderPayMethods() {
    var box = $("payMethods");
    if (!box) return;
    if (!paymentsList.length) {
      box.innerHTML = '<p class="sub">' + t("noPayments") + "</p>";
      $("payPanel").style.display = "none";
      selectedPayId = null;
      return;
    }
    box.innerHTML = paymentsList.map(function (m) {
      return '<button type="button" class="pay-method' + (m.id === selectedPayId || (!selectedPayId && m === paymentsList[0]) ? " sel" : "") + '" data-pay="' + m.id + '">' +
        (m.icon || "💳") + " " + esc(m.label || "") + (m.network ? "<small>" + esc(m.network) + "</small>" : "") + "</button>";
    }).join("");
    if (!selectedPayId) selectedPayId = paymentsList[0].id;
    renderPayPanel();
  }

  function renderPayPanel() {
    var panel = $("payPanel");
    if (!panel) return;
    var m = activePay();
    if (!m) { panel.style.display = "none"; return; }
    panel.style.display = "block";
    var code = $("payWalletCode");
    if (code) code.textContent = m.wallet || "";
    var qw = $("payQrWrap"), qi = $("payQrImg");
    if (qw && qi) {
      if (m.qrImage) { qi.src = m.qrImage; qw.style.display = "block"; }
      else qw.style.display = "none";
    }
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest("[data-pay]");
    if (card) {
      selectedPayId = card.getAttribute("data-pay");
      qsa(".pay-method").forEach(function (c) { c.classList.toggle("sel", c.getAttribute("data-pay") === selectedPayId); });
      renderPayPanel();
      return;
    }
    var cp = e.target.closest("#payCopyWallet");
    if (cp) {
      var code = $("payWalletCode");
      if (code && code.textContent && navigator.clipboard) {
        navigator.clipboard.writeText(code.textContent).then(function () { toast(t("copied")); });
      }
    }
  });

  function openCheckout() {
    appliedCoupon = null;
    $("couponCode").value = "";
    $("couponMsg").textContent = "";
    $("payAmount").textContent = money(cartTotal());
    renderPayMethods();
    renderPayPanel();
    $("orderModal").classList.add("show");
  }

  $("checkout").addEventListener("click", function () {
    if (!cart.length) return toast(t("emptyCart"));
    closeCart();
    openCheckout();
  });
  $("closeOrder").addEventListener("click", function () { $("orderModal").classList.remove("show"); });

  /* COUPON */
  $("couponApply").addEventListener("click", applyCoupon);
  function applyCoupon() {
    var code = $("couponCode").value.trim();
    if (!code) return;
    var coupon = validateCoupon(code);
    var msg = $("couponMsg");
    if (!coupon) {
      msg.textContent = t("couponInvalid");
      msg.style.color = "var(--bad)";
      appliedCoupon = null;
      $("payAmount").textContent = money(cartTotal());
      return;
    }
    appliedCoupon = coupon;
    msg.textContent = t("couponApplied") + " (-" + (coupon.type === "percent" ? coupon.value + "%" : "$" + coupon.value) + ")";
    msg.style.color = "var(--ok)";
    $("payAmount").textContent = money(cartTotalWithDiscount());
  }

  /* PROOF UPLOAD */
  $("cproof").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { proofData = ""; return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height, max = 900;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      var c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      proofData = c.toDataURL("image/jpeg", 0.62);
      var prev = $("proofPreview");
      prev.src = proofData;
      prev.classList.add("show");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

  /* SUBMIT ORDER → SERVER */
  $("orderForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!proofData) return toast(t("proofNeed"));
    var total = cartTotalWithDiscount();
    var orderId = "o" + Date.now();
    var pay = activePay();
    var order = {
      id: orderId,
      name: $("cname").value.trim(),
      contact: $("ccontact").value.trim(),
      country: $("ccountry").value.trim(),
      proof: proofData,
      network: pay ? pay.network : "",
      wallet: pay ? pay.wallet : "",
      payLabel: pay ? pay.label : null,
      items: cart.slice(),
      total: total,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      at: new Date().toLocaleString()
    };
    fetch(MAJOR_API("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    }).then(function (r) { return r.json(); })
      .then(function (saved) {
        if (saved && saved.id) {
          var myOrders = JSON.parse(localStorage.getItem("major360_myorders") || "[]");
          myOrders.unshift(saved);
          localStorage.setItem("major360_myorders", JSON.stringify(myOrders));
          renderOrders();
        }
      }).catch(function () {});
    try { if (liveSocket) liveSocket.emit("order:new", { name: order.name, country: order.country, items: order.items.map(function (i) { return i.name; }).join(", ") }); } catch (err) {}
    cart = [];
    proofData = "";
    appliedCoupon = null;
    saveCart();
    renderCart();
    var pp = $("proofPreview");
    if (pp) pp.classList.remove("show");
    $("orderModal").classList.remove("show");
    toast(t("sent") + " (" + t("yourOrderId") + " " + orderId + ")");
    e.target.reset();
  });

  /* ===== MY ORDERS (live status via orders:updated) ===== */
  function myOrdersLocal() {
    return JSON.parse(localStorage.getItem("major360_myorders") || "[]");
  }
  function syncMyOrderStatus() {
    var mine = myOrdersLocal();
    var changed = false;
    mine.forEach(function (o) {
      var s = ordersList.find(function (x) { return x.id === o.id; });
      if (s && s.status !== (o.status || "pending")) { o.status = s.status; changed = true; }
    });
    if (changed) {
      localStorage.setItem("major360_myorders", JSON.stringify(mine));
      renderOrders();
    }
  }

  function renderOrders() {
    var box = $("myOrders");
    if (!box) return;
    var list = myOrdersLocal().slice(0, 5);
    if (!list.length) {
      box.innerHTML = '<div class="section-head"><h2>' + t("myOrders") + '</h2><p class="sub">' + t("noOrdersHistory") + "</p></div>";
      return;
    }
    box.innerHTML = '<div class="section-head"><h2>' + t("myOrders") + "</h2></div>" +
      list.map(function (o) {
        var s = o.status || "pending";
        var sk = "status" + s.charAt(0).toUpperCase() + s.slice(1);
        var it = o.items.map(function (i) { return i.name + " ×" + i.qty; }).join(" | ");
        return '<div class="order-card"><div class="order-head"><span>' + t("orderStatus") + ': <b class="status-' + s + '">' + t(sk) + '</b></span><small>' + (o.at || "") + '</small></div>' +
          '<div class="order-body"><p class="sub">' + esc(it) + '</p><p><b>' + money(o.total) + '</b></p><small>' + t("yourOrderId") + " " + o.id + "</small></div></div>";
      }).join("");
  }

  /* ===== CHAT ===== */
  var fab = $("chatFab"), win = $("chatWin");
  fab.addEventListener("click", function () {
    win.classList.toggle("open");
    if (win.classList.contains("open")) { lastSeen = Date.now(); updateBadge(0); drawChat(); }
  });
  $("chatClose").addEventListener("click", function () { win.classList.remove("open"); });

  function getChat() {
    var db = MajorDB.load();
    if (!db.chats) db.chats = [];
    return db.chats.find(function (c) { return c.id === chatId; });
  }

  function drawChat() {
    var log = $("chatLog");
    var c = getChat();
    if (!c) {
      log.innerHTML = '<p class="sub">' + t("chatHello") + "</p>";
      $("chatStartBox").style.display = "flex";
      $("chatSendBox").style.display = "none";
      return;
    }
    $("chatStartBox").style.display = "none";
    $("chatSendBox").style.display = "flex";
    log.innerHTML = c.messages.map(function (m) {
      return '<div class="bubble ' + m.from + '">' + esc(m.text) + "<time>" + esc(m.at) + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
    var unread = c.messages.filter(function (m) { return m.from === "admin" && m.ts > lastSeen; }).length;
    if (!win.classList.contains("open")) updateBadge(unread);
    else { lastSeen = Date.now(); updateBadge(0); }
  }

  function updateBadge(n) {
    var b = $("chatBadge");
    if (n > 0) { b.textContent = n; b.classList.add("show"); }
    else b.classList.remove("show");
  }

  $("chatStart").addEventListener("click", startChat);
  $("chatName").addEventListener("keydown", function (e) { if (e.key === "Enter") startChat(); });

  function startChat() {
    var name = $("chatName").value.trim();
    if (!name) return;
    var db = MajorDB.load();
    if (!db.chats) db.chats = [];
    chatId = "c" + Date.now();
    chatName = name;
    sessionStorage.setItem("major360_chat", chatId);
    sessionStorage.setItem("major360_chat_name", chatName);
    sessionStorage.setItem("major360_chat_v2", "1");
    db.chats.unshift({
      id: chatId, name: name, updated: Date.now(),
      messages: [{ from: "admin", text: t("chatHello"), at: new Date().toLocaleString(), ts: Date.now() }]
    });
    MajorDB.save(db);
    if (liveSocket) {
      liveSocket.emit("chat:new", { chatId: chatId, name: name });
      liveSocket.emit("chat:message", { chatId: chatId, message: { from: "admin", text: t("chatHello"), at: new Date().toLocaleString(), ts: Date.now() } });
    }
    drawChat();
  }

  function sendUser() {
    var input = $("chatInput");
    var text = input.value.trim();
    if (!text || !chatId || !chatName) {
      if (!chatName) { $("chatStartBox").style.display = "flex"; $("chatName").focus(); }
      return;
    }
    var db = MajorDB.load();
    var c = db.chats.find(function (x) { return x.id === chatId; });
    if (!c) return;
    var msg = { from: "user", text: text, at: new Date().toLocaleString(), ts: Date.now() };
    c.messages.push(msg);
    c.updated = Date.now();
    MajorDB.save(db);
    input.value = "";
    if (liveSocket) liveSocket.emit("chat:message", { chatId: chatId, name: chatName, message: msg });
    drawChat();
  }
  $("chatSend").addEventListener("click", sendUser);
  $("chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendUser(); });

  if (liveSocket) {
    liveSocket.on("chat:message", function (data) {
      if (data.chatId === chatId) {
        var db = MajorDB.load();
        var c = db.chats.find(function (x) { return x.id === chatId; });
        if (c) {
          var exists = c.messages.some(function (m) { return m.ts === data.message.ts; });
          if (!exists) { c.messages.push(data.message); MajorDB.save(db); }
        }
        drawChat();
      }
    });
  }

  if (chatId) {
    $("chatStartBox").style.display = "none";
    $("chatSendBox").style.display = "flex";
    if (liveSocket) liveSocket.emit("chat:join", chatId);
    drawChat();
  } else drawChat();

  /* ===== SOCIAL PROOF ===== */
  function showSocialProof(name, country, item) {
    var box = $("socialProof");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "social-notif";
    el.innerHTML = '<span class="sn-icon">🛒</span><span class="sn-text"><b>' + esc(name || "زبون") + "</b> " + t("bought") + " " + esc(item) + "<small>" + (country ? "من " + esc(country) : "") + " · " + t("justNow") + "</small></span>";
    box.appendChild(el);
    el._t = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 5000);
    while (box.children.length > 3 && box.firstChild) box.removeChild(box.firstChild);
  }

  function showVisit(name, country) {
    var box = $("socialProof");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "social-notif";
    el.innerHTML = '<span class="sn-icon">👋</span><span class="sn-text"><b>' + esc(name || "زبون") + "</b> " + t("visiting") + "<small>" + (country ? "من " + esc(country) : "") + " · " + t("justNow") + "</small></span>";
    box.appendChild(el);
    el._t = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3200);
    while (box.children.length > 3 && box.firstChild) box.removeChild(box.firstChild);
  }

  function updateVisitorCount(n) {
    var el = $("visitorCount");
    if (el) el.textContent = n || 0;
  }
  updateVisitorCount(["1", "2", "3", "4", "5", "6", "7"][Math.floor(Math.random() * 7)]);

  if (liveSocket) {
    liveSocket.on("live:activity", function (d) { showSocialProof(d.name, d.country, d.item); });
    liveSocket.on("live:visit", function (d) { showVisit(d.name, d.country); });
    liveSocket.on("live:stats", function (d) { if (d.visitors) updateVisitorCount(d.visitors); });
    liveSocket.on("live:visitor", function (d) { if (d.visitors) updateVisitorCount(d.visitors); });
  }

  setInterval(drawChat, 1500);
  window.addEventListener("storage", function () { drawChat(); });
  renderOrders();
})();