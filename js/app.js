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

  // Server-backed data (single source of truth, synced via Socket.IO)
  var productsList = [];
  var paymentsList = [];
  var couponsList = [];
  var configData = null;

  function t(k) { return MajorI18n.t(k); }
  function money(n) { return "$" + Number(n).toFixed(2); }
  function pname(p) { return (MajorI18n.getLang() === "en") ? (p.nameEn || p.name) : p.name; }
  function pdesc(p) { return (MajorI18n.getLang() === "en") ? (p.descEn || p.desc || "") : (p.desc || ""); }
  function catName(c) { return { cyber: "🛡️ Cyber Security Tools", streamer: "📺 Streamer Tools", gaming: "🎮 Gaming Tools" }[c] || c; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  function saveCart() {
    localStorage.setItem("major360_cart", JSON.stringify(cart));
    var n = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var el = document.getElementById("cartCount");
    if (el) el.textContent = n;
  }

  /* ===== SERVER SYNC — initial fetch + live socket updates ===== */
  try { liveSocket = io(); } catch (e) { liveSocket = null; }

  function refreshFromServer() {
    fetch("/api/products", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      productsList = Array.isArray(d) ? d : [];
      renderProducts();
    }).catch(function () {});
    fetch("/api/payments", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      paymentsList = Array.isArray(d) ? d : [];
    }).catch(function () {});
    fetch("/api/coupons", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
      couponsList = Array.isArray(d) ? d : [];
    }).catch(function () {});
    fetch("/api/config", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
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
      renderCart();
    });
    liveSocket.on("payments:updated", function (d) {
      paymentsList = Array.isArray(d) ? d : [];
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
  }

  /* ===== PRODUCTS ===== */
  function renderProducts() {
    var grid = document.getElementById("products");
    if (!grid) return;
    var q = searchQuery.toLowerCase().trim();
    var list = productsList.filter(function (p) {
      if (filter !== "all" && p.cat !== filter) return false;
      if (!q) return true;
      return (p.name + " " + p.nameEn + " " + p.desc + " " + (p.descEn || "")).toLowerCase().indexOf(q) !== -1;
    });
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state"><span>📦</span><p class="sub">' + t("noProducts") + "</p></div>";
      return;
    }
    grid.innerHTML = list.map(function (p) {
      var inCart = cart.find(function (x) { return x.id === p.id; });
      var btnText = inCart ? t("addedToCart") : t("addCart");
      var btnClass = inCart ? "btn added" : "btn";
      var thumb = p.image ? '<img src="' + p.image + '" alt="" />' : '<span class="emoji-thumb">' + (p.emoji || "🎮") + "</span>";
      return '<article class="card"><div class="thumb">' + thumb + '</div><div class="body"><div class="tag">' +
        catName(p.cat) + "</div><h4>" + esc(pname(p)) + '</h4><p class="sub">' + esc(pdesc(p)) +
        '</p><div class="price">' + money(p.price) + '</div><div class="card-actions"><button class="' + btnClass + '" data-add="' + p.id + '">' + btnText + '</button><button class="btn buy-now-btn" data-buy="' + p.id + '">' + t("buyNow") + "</button></div></article>";
    }).join("");
  }

  function renderCart() {
    var box = document.getElementById("cartItems");
    if (!box) return;
    if (!cart.length) {
      box.innerHTML = '<p class="sub">' + t("emptyCart") + "</p>";
      document.getElementById("cartTotal").textContent = money(0);
      return;
    }
    var total = 0;
    box.innerHTML = cart.map(function (i, idx) {
      total += i.price * i.qty;
      var label = MajorI18n.getLang() === "en" ? (i.nameEn || i.name) : i.name;
      return '<div class="cart-row"><div><b>' + esc(label) + "</b><br><span class='sub'>" + money(i.price) + '</span></div><div class="qty"><button data-dec="' + idx + '">−</button><span>' + i.qty + '</span><button data-inc="' + idx + '">+</button></div></div>';
    }).join("");
    document.getElementById("cartTotal").textContent = money(total);
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

  /* BUY NOW — direct purchase, skips cart */
  function buyNow(id) {
    var p = productsList.find(function (x) { return x.id === id; });
    if (!p) return;
    cart = [{ id: p.id, name: p.name, nameEn: p.nameEn, price: p.price, qty: 1 }];
    saveCart();
    renderCart();
    renderProducts();
    var overlay = document.getElementById("overlay");
    var drawer = document.getElementById("drawer");
    overlay.classList.remove("show");
    drawer.classList.remove("show");
    appliedCoupon = null;
    var cr = document.getElementById("couponRow");
    if (cr) cr.style.display = "block";
    document.getElementById("couponCode").value = "";
    document.getElementById("couponMsg").textContent = "";
    document.getElementById("payAmount").textContent = money(cartTotal());
    openCheckout();
  }

  /* ===== CONFIG-DRIVEN UI ===== */
  function refreshDiscord() {
    var dl = document.getElementById("discordLink");
    var fd = document.getElementById("footerDiscord");
    var href = configData && configData.discord ? configData.discord : "https://discord.gg/WrK7ttvq5g";
    if (dl) dl.href = href;
    if (fd) fd.href = href;
  }

  function refreshAnnouncement() {
    var bar = document.getElementById("announcementBar");
    var txt = document.getElementById("annText");
    if (!bar || !txt) return;
    if (!configData) { bar.style.display = "none"; return; }
    if (configData.announcementEnabled === false) { bar.style.display = "none"; return; }
    bar.style.display = "block";
    txt.textContent = MajorI18n.getLang() === "en" ? (configData.announcementEn || configData.announcement) : configData.announcement;
  }

  function refreshWhatsApp() {
    var fab = document.getElementById("whatsappFab");
    if (!fab) return;
    if (configData && configData.whatsapp) {
      fab.style.display = "flex";
      fab.href = "https://wa.me/" + configData.whatsapp.replace(/[^0-9]/g, "") + "?text=" + encodeURIComponent(configData.whatsappMsg || "مرحباً");
    } else {
      fab.style.display = "none";
    }
  }

  var prev = MajorI18n.onChange;
  MajorI18n.onChange = function () {
    if (typeof prev === "function") prev();
    renderProducts();
    renderCart();
    drawChat();
    renderOrders();
    refreshAnnouncement();
  };

  refreshFromServer();
  renderProducts();
  saveCart();
  renderCart();

  document.getElementById("swapLang").addEventListener("click", function () {
    MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
  });

  document.getElementById("products").addEventListener("click", function (e) {
    var addId = e.target.getAttribute("data-add");
    if (addId) addToCart(addId);
    var buyId = e.target.getAttribute("data-buy");
    if (buyId) buyNow(buyId);
  });

  document.querySelectorAll(".cat").forEach(function (el) {
    el.addEventListener("click", function () {
      document.querySelectorAll(".cat").forEach(function (c) { c.classList.remove("active"); });
      el.classList.add("active");
      filter = el.getAttribute("data-cat");
      renderProducts();
    });
  });

  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = this.value;
      renderProducts();
    });
  }

  var overlay = document.getElementById("overlay");
  var drawer = document.getElementById("drawer");
  function openCart() { overlay.classList.add("show"); drawer.classList.add("show"); renderCart(); }
  function closeCart() { overlay.classList.remove("show"); drawer.classList.remove("show"); }
  document.getElementById("openCart").addEventListener("click", openCart);
  overlay.addEventListener("click", closeCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);

  document.getElementById("cartItems").addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-inc")) cart[+e.target.getAttribute("data-inc")].qty++;
    if (e.target.hasAttribute("data-dec")) {
      var i = +e.target.getAttribute("data-dec");
      cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
    saveCart();
    renderCart();
  });

  /* ===== CHECKOUT — single payment block (server-defined) ===== */
  var orderModal = document.getElementById("orderModal");
  var proofData = "";
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

  function renderPayBlock() {
    var m = paymentsList.length ? paymentsList[0] : null;
    var box = document.getElementById("payMethods");
    if (!box) return;
    if (!m) {
      box.innerHTML = '<p class="sub" style="color:var(--muted);padding:8px">' + t("noPayments") + "</p>";
      var emptyWallet = document.getElementById("walletAddr");
      if (emptyWallet) emptyWallet.textContent = "";
      var emptyQr = document.getElementById("payQrWrap");
      if (emptyQr) emptyQr.style.display = "none";
      return;
    }
    box.innerHTML = '<div class="pay-block"><div class="pay-head"><span>' + (m.icon || "💳") + "</span> <b>" + esc(m.label || "") + "</b>" +
      (m.network ? ' <small class="pay-net">' + esc(m.network) + "</small>" : "") + '</div>' +
      '<div class="pay-wallet"><code id="payWalletCode">' + esc(m.wallet || "") + '</code><button type="button" id="payCopyWallet" class="btn small">' + t("copy") + "</button></div></div>";
    var wa = document.getElementById("walletAddr");
    if (wa) wa.textContent = m.wallet || "";
    var qw = document.getElementById("payQrWrap");
    var qi = document.getElementById("payQrImg");
    if (qw && qi) {
      if (m.qrImage) {
        qi.src = m.qrImage;
        qw.style.display = "block";
      } else {
        qw.style.display = "none";
      }
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "payCopyWallet") {
      var code = document.getElementById("payWalletCode");
      if (code && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code.textContent).then(function () { toast(t("copied")); });
      }
    }
  });

  function openCheckout() {
    appliedCoupon = null;
    var cr = document.getElementById("couponRow");
    if (cr) cr.style.display = "block";
    document.getElementById("couponCode").value = "";
    document.getElementById("couponMsg").textContent = "";
    document.getElementById("payAmount").textContent = money(cartTotal());
    renderPayBlock();
    orderModal.classList.add("show");
  }

  document.getElementById("checkout").addEventListener("click", function () {
    if (!cart.length) return toast(t("emptyCart"));
    closeCart();
    openCheckout();
  });
  document.getElementById("closeOrder").addEventListener("click", function () { orderModal.classList.remove("show"); });
  document.getElementById("copyAddr").addEventListener("click", function () {
    var addr = document.getElementById("walletAddr").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(function () { toast(t("copied")); });
    } else toast(addr);
  });

  /* COUPON */
  document.getElementById("couponApply").addEventListener("click", function () {
    var code = document.getElementById("couponCode").value.trim();
    if (!code) return;
    var coupon = validateCoupon(code);
    if (!coupon) {
      document.getElementById("couponMsg").textContent = t("couponInvalid");
      document.getElementById("couponMsg").style.color = "#ff6b6b";
      appliedCoupon = null;
      document.getElementById("payAmount").textContent = money(cartTotal());
      return;
    }
    appliedCoupon = coupon;
    document.getElementById("couponMsg").textContent = t("couponApplied") + " (-" + (coupon.type === "percent" ? coupon.value + "%" : "$" + coupon.value) + ")";
    document.getElementById("couponMsg").style.color = "#22c55e";
    document.getElementById("payAmount").textContent = money(cartTotalWithDiscount());
  });

  document.getElementById("cproof").addEventListener("change", function (e) {
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
      var prev = document.getElementById("proofPreview");
      prev.src = proofData;
      prev.classList.add("show");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

  /* ===== SUBMIT ORDER → SERVER ===== */
  document.getElementById("orderForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!proofData) return toast(t("proofNeed"));
    var total = cartTotalWithDiscount();
    var orderId = "o" + Date.now();
    var pay = paymentsList.length ? paymentsList[0] : null;
    var order = {
      id: orderId,
      name: document.getElementById("cname").value.trim(),
      contact: document.getElementById("ccontact").value.trim(),
      country: document.getElementById("ccountry").value.trim(),
      proof: proofData,
      network: pay ? pay.network : "",
      wallet: pay ? pay.wallet : "",
      payLabel: pay ? pay.label : null,
      items: cart.slice(),
      total: total,
      originalTotal: cartTotal(),
      coupon: appliedCoupon ? appliedCoupon.code : null,
      at: new Date().toLocaleString()
    };
    // Persist on the server so the admin dashboard receives it everywhere.
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    }).then(function () {
      // Record locally too, so this browser shows it in "My orders".
      var myOrders = JSON.parse(localStorage.getItem("major360_myorders") || "[]");
      myOrders.unshift(order);
      localStorage.setItem("major360_myorders", JSON.stringify(myOrders));
      renderOrders();
    }).catch(function () {});
    // Live storefront activity
    try {
      if (liveSocket) liveSocket.emit("order:new", {
        name: order.name, country: order.country,
        items: order.items.map(function (i) { return i.name; }).join(", ")
      });
    } catch (err) {}
    cart = [];
    proofData = "";
    appliedCoupon = null;
    saveCart();
    renderCart();
    var pp = document.getElementById("proofPreview");
    if (pp) pp.classList.remove("show");
    orderModal.classList.remove("show");
    toast(t("sent") + " (" + t("yourOrderId") + " " + orderId + ")");
    e.target.reset();
  });

  document.getElementById("menuBtn").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });

  /* ===== CHAT — realtime ===== */
  var fab = document.getElementById("chatFab");
  var win = document.getElementById("chatWin");
  fab.addEventListener("click", function () {
    win.classList.toggle("open");
    if (win.classList.contains("open")) {
      lastSeen = Date.now();
      updateBadge(0);
      drawChat();
    }
  });
  document.getElementById("chatClose").addEventListener("click", function () { win.classList.remove("open"); });

  function getChat() {
    var db = MajorDB.load();
    if (!db.chats) db.chats = [];
    return db.chats.find(function (c) { return c.id === chatId; });
  }

  function drawChat() {
    var log = document.getElementById("chatLog");
    var c = getChat();
    if (!c) {
      log.innerHTML = '<p class="sub">' + t("chatHello") + "</p>";
      document.getElementById("chatStartBox").style.display = "flex";
      document.getElementById("chatSendBox").style.display = "none";
      return;
    }
    document.getElementById("chatStartBox").style.display = "none";
    document.getElementById("chatSendBox").style.display = "flex";
    log.innerHTML = c.messages.map(function (m) {
      return '<div class="bubble ' + m.from + '">' + esc(m.text) + "<time>" + esc(m.at) + "</time></div>";
    }).join("");
    log.scrollTop = log.scrollHeight;
    var unread = c.messages.filter(function (m) { return m.from === "admin" && m.ts > lastSeen; }).length;
    if (!win.classList.contains("open")) updateBadge(unread);
    else { lastSeen = Date.now(); updateBadge(0); }
  }

  function updateBadge(n) {
    var b = document.getElementById("chatBadge");
    if (n > 0) { b.textContent = n; b.classList.add("show"); }
    else b.classList.remove("show");
  }

  document.getElementById("chatStart").addEventListener("click", startChat);
  document.getElementById("chatName").addEventListener("keydown", function (e) { if (e.key === "Enter") startChat(); });

  function startChat() {
    var name = document.getElementById("chatName").value.trim();
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
    var input = document.getElementById("chatInput");
    var text = input.value.trim();
    if (!text || !chatId || !chatName) {
      if (!chatName) {
        document.getElementById("chatStartBox").style.display = "flex";
        document.getElementById("chatName").focus();
      }
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
  document.getElementById("chatSend").addEventListener("click", sendUser);
  document.getElementById("chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendUser(); });

  if (liveSocket) {
    liveSocket.on("chat:message", function (data) {
      if (data.chatId === chatId) {
        var db = MajorDB.load();
        var c = db.chats.find(function (x) { return x.id === chatId; });
        if (c) {
          var exists = c.messages.some(function (m) { return m.ts === data.message.ts; });
          if (!exists) {
            c.messages.push(data.message);
            MajorDB.save(db);
          }
        }
        drawChat();
      }
    });
  }

  if (chatId) {
    document.getElementById("chatStartBox").style.display = "none";
    document.getElementById("chatSendBox").style.display = "flex";
    if (liveSocket) liveSocket.emit("chat:join", chatId);
    drawChat();
  } else {
    drawChat();
  }

  /* MY ORDERS (this browser's own history) */
  var ordersBox = document.getElementById("myOrders");
  function renderOrders() {
    if (!ordersBox) return;
    var list = JSON.parse(localStorage.getItem("major360_myorders") || "[]").slice(0, 10);
    if (!list.length) {
      ordersBox.innerHTML = '<h3>' + t("myOrders") + '</h3><p class="sub">' + t("noOrdersHistory") + "</p>";
      return;
    }
    ordersBox.innerHTML = '<h3>' + t("myOrders") + "</h3>" +
      list.map(function (o) {
        var s = o.status || "pending";
        var sk = "status" + s.charAt(0).toUpperCase() + s.slice(1);
        var it = o.items.map(function (i) { return i.name + " ×" + i.qty; }).join(" | ");
        return '<div class="order-card"><div class="order-head"><span>' + t("orderStatus") + ': <b class="status-' + s + '">' + t(sk) + '</b></span><small>' + (o.at || "") + '</small></div><div class="order-body"><p class="sub">' + it + '</p><p><span>' + t("total") + '</span> <b>' + money(o.total) + '</b></p><small>' + t("yourOrderId") + " " + o.id + "</small></div></div>";
      }).join("");
  }

  /* ===== SOCIAL PROOF ===== */
  var proofQueue = [];
  var proofTimer = null;

  function showSocialProof(name, country, item) {
    var box = document.getElementById("socialProof");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "social-notif";
    el.innerHTML = '<span class="sn-icon">🛒</span><span class="sn-text"><b>' + (name || "زبون") + '</b> ' + t("bought") + " " + item + "<small>" + (country ? "من " + country : "") + " · " + t("justNow") + "</small></span>";
    box.appendChild(el);
    el._t = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 5000);
    while (box.children.length > 3) {
      var first = box.firstChild;
      if (first) box.removeChild(first);
    }
  }

  function showVisit(name, country) {
    var box = document.getElementById("socialProof");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "social-notif visit";
    el.innerHTML = '<span class="sn-icon">👋</span><span class="sn-text"><b>' + (name || "زبون") + "</b> " + t("visiting") + "<small>" + (country ? "من " + country : "") + " · " + t("justNow") + "</small></span>";
    box.appendChild(el);
    el._t = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3000);
    while (box.children.length > 3) {
      var first = box.firstChild;
      if (first) box.removeChild(first);
    }
  }

  function updateVisitorCount(n) {
    var el = document.getElementById("visitorCount");
    if (el) el.textContent = n || 0;
  }

  var initial = ["1", "2", "3", "4", "5", "6", "7"][Math.floor(Math.random() * 7)];
  updateVisitorCount(initial);

  if (liveSocket) {
    liveSocket.on("live:activity", function (data) {
      showSocialProof(data.name, data.country, data.item);
    });
    liveSocket.on("live:visit", function (data) {
      showVisit(data.name, data.country);
    });
    liveSocket.on("live:stats", function (data) {
      if (data.visitors) updateVisitorCount(data.visitors);
    });
    liveSocket.on("live:visitor", function (data) {
      if (data.visitors) updateVisitorCount(data.visitors);
    });
  }

  setInterval(drawChat, 1500);
  window.addEventListener("storage", function () { drawChat(); });

  renderOrders();
})();