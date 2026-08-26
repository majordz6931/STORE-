(function () {
  var db = MajorDB.load();
  var cart = JSON.parse(localStorage.getItem("major360_cart") || "[]");
  var filter = "all";
  var chatId = sessionStorage.getItem("major360_chat") || "";
  var lastSeen = 0;

  function t(k) { return MajorI18n.t(k); }

  function money(n) { return "$" + Number(n).toFixed(2); }

  function pname(p) {
    return (MajorI18n.getLang() === "en") ? (p.nameEn || p.name) : p.name;
  }
  function pdesc(p) {
    return (MajorI18n.getLang() === "en") ? (p.descEn || p.desc || "") : (p.desc || "");
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  function saveCart() {
    localStorage.setItem("major360_cart", JSON.stringify(cart));
    var n = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    document.getElementById("cartCount").textContent = n;
  }

  function catName(c) {
    return { cyber: "🛡️ Cyber Security Tools", streamer: "📺 Streamer Tools", gaming: "🎮 Gaming Tools" }[c] || c;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }

  function renderProducts() {
    var grid = document.getElementById("products");
    var list = db.products.filter(function (p) { return filter === "all" || p.cat === filter; });
    if (!list.length) {
      grid.innerHTML = '<p class="sub">' + t("noProducts") + "</p>";
      return;
    }
    grid.innerHTML = list.map(function (p) {
      var thumb = p.image
        ? '<img src="' + p.image + '" alt="" />'
        : (p.emoji || "🎮");
      return '<article class="card"><div class="thumb">' + thumb + '</div><div class="body"><div class="tag">' +
        catName(p.cat) + "</div><h4>" + esc(pname(p)) + '</h4><p class="sub">' + esc(pdesc(p)) +
        '</p><div class="price">' + money(p.price) + '</div><button class="btn" data-add="' + p.id + '">' +
        t("addCart") + "</button></div></article>";
    }).join("");
  }

  function renderCart() {
    var box = document.getElementById("cartItems");
    if (!cart.length) {
      box.innerHTML = '<p class="sub">' + t("emptyCart") + "</p>";
      document.getElementById("cartTotal").textContent = money(0);
      return;
    }
    var total = 0;
    box.innerHTML = cart.map(function (i, idx) {
      total += i.price * i.qty;
      var label = MajorI18n.getLang() === "en" ? (i.nameEn || i.name) : i.name;
      return '<div class="cart-row"><div><b>' + esc(label) + "</b><br><span class='sub'>" + money(i.price) +
        '</span></div><div class="qty"><button data-dec="' + idx + '">-</button><span>' + i.qty +
        '</span><button data-inc="' + idx + '">+</button></div></div>';
    }).join("");
    document.getElementById("cartTotal").textContent = money(total);
  }

  function addToCart(id) {
    var p = db.products.find(function (x) { return x.id === id; });
    if (!p) return;
    var f = cart.find(function (x) { return x.id === id; });
    if (f) f.qty += 1;
    else cart.push({ id: p.id, name: p.name, nameEn: p.nameEn, price: p.price, qty: 1 });
    saveCart();
    renderCart();
    toast(t("added"));
  }

  function refreshDiscord() {
    document.getElementById("discordLink").href = db.discord;
    document.getElementById("footerDiscord").href = db.discord;
  }

  MajorI18n.onChange = function () { renderProducts(); renderCart(); drawChat(); };

  refreshDiscord();
  renderProducts();
  saveCart();
  renderCart();

  document.getElementById("swapLang").addEventListener("click", function () {
    MajorI18n.setLang((MajorI18n.getLang() || "ar") === "ar" ? "en" : "ar");
  });

  document.getElementById("products").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-add");
    if (id) addToCart(id);
  });

  document.querySelectorAll(".cat").forEach(function (el) {
    el.addEventListener("click", function () {
      document.querySelectorAll(".cat").forEach(function (c) { c.classList.remove("active"); });
      el.classList.add("active");
      filter = el.getAttribute("data-cat");
      renderProducts();
    });
  });

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

  var orderModal = document.getElementById("orderModal");
  var proofData = "";
  function cartTotal() {
    return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  document.getElementById("checkout").addEventListener("click", function () {
    if (!cart.length) return toast(t("emptyCart"));
    closeCart();
    document.getElementById("payAmount").textContent = money(cartTotal());
    document.getElementById("walletAddr").textContent = db.wallet || MajorDB.WALLET;
    orderModal.classList.add("show");
  });
  document.getElementById("closeOrder").addEventListener("click", function () {
    orderModal.classList.remove("show");
  });
  document.getElementById("copyAddr").addEventListener("click", function () {
    var addr = document.getElementById("walletAddr").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(function () { toast(t("copied")); });
    } else toast(addr);
  });
  document.getElementById("cproof").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) { proofData = ""; return; }
    var img = new Image();
    var url = URL.createObjectURL(file);
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
  document.getElementById("orderForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!proofData) return toast(t("proofNeed"));
    db = MajorDB.load();
    db.orders.unshift({
      id: "o" + Date.now(),
      name: document.getElementById("cname").value.trim(),
      contact: document.getElementById("ccontact").value.trim(),
      country: document.getElementById("ccountry").value.trim(),
      note: document.getElementById("cnote").value.trim(),
      proof: proofData,
      network: "BSC BEP20",
      wallet: db.wallet || MajorDB.WALLET,
      items: cart.slice(),
      total: cartTotal(),
      at: new Date().toLocaleString()
    });
    MajorDB.save(db);
    cart = [];
    proofData = "";
    saveCart();
    renderCart();
    document.getElementById("proofPreview").classList.remove("show");
    orderModal.classList.remove("show");
    toast(t("sent"));
    e.target.reset();
  });

  document.getElementById("menuBtn").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });

  /* CHAT */
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
  document.getElementById("chatClose").addEventListener("click", function () {
    win.classList.remove("open");
  });

  function getChat() {
    db = MajorDB.load();
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
  document.getElementById("chatName").addEventListener("keydown", function (e) {
    if (e.key === "Enter") startChat();
  });

  function startChat() {
    var name = document.getElementById("chatName").value.trim();
    if (!name) return;
    db = MajorDB.load();
    if (!db.chats) db.chats = [];
    chatId = "c" + Date.now();
    sessionStorage.setItem("major360_chat", chatId);
    db.chats.unshift({
      id: chatId,
      name: name,
      updated: Date.now(),
      messages: [{ from: "admin", text: t("chatHello"), at: new Date().toLocaleString(), ts: Date.now() }]
    });
    MajorDB.save(db);
    drawChat();
  }

  function sendUser() {
    var input = document.getElementById("chatInput");
    var text = input.value.trim();
    if (!text || !chatId) return;
    db = MajorDB.load();
    var c = db.chats.find(function (x) { return x.id === chatId; });
    if (!c) return;
    c.messages.push({ from: "user", text: text, at: new Date().toLocaleString(), ts: Date.now() });
    c.updated = Date.now();
    MajorDB.save(db);
    input.value = "";
    drawChat();
  }
  document.getElementById("chatSend").addEventListener("click", sendUser);
  document.getElementById("chatInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendUser();
  });

  if (chatId) {
    document.getElementById("chatStartBox").style.display = "none";
    document.getElementById("chatSendBox").style.display = "flex";
    drawChat();
  } else {
    drawChat();
  }

  setInterval(drawChat, 1500);
  window.addEventListener("storage", function () { drawChat(); });
})();
