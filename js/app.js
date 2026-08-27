(function () {
  "use strict";
  var db = ElectroDB.load();
  var cart = ElectroDB.loadCart();
  var appliedCoupon = null;
  var activeCategory = "all";
  var search = "";
  var sort = "featured";
  var money = function (n) { return ElectroDB.formatMoney(n); };

  var T = ElectroDB.t;
  var $ = function (id) { return document.getElementById(id); }
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function escStatic(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function toast(msg, bad) {
    var el = $("toast"); if (!el) return;
    el.textContent = msg; el.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }
  function localizeField(v) { return ElectroDB.localize(v); }

  function categoryName(id) {
    var c = db.categories.find(function (x) { return x.id === id; });
    return c ? localizeField(c.name) : "منتج";
  }
  function cartQty() { return cart.reduce(function (s, x) { return s + x.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, x) { return s + x.price * x.qty; }, 0); }
  function updateCartCount() { var c = $("cartCount"); if (c) c.textContent = cartQty(); }

  function applyI18nToDOM() {
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); if (!k) return;
      var v = ElectroDB.t(k); if (v != null) el.textContent = v;
    });
    $$("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); if (!k) return;
      var v = ElectroDB.t(k); if (v != null) el.setAttribute("placeholder", v);
    });
    var search = $("searchInput"); if (search) search.setAttribute("placeholder", ElectroDB.t("searchPh"));
    var n = $("newsletterEmail"); if (n) n.setAttribute("placeholder", ElectroDB.t("newsletterPh"));
    var nb = $("newsletterBtn"); if (nb) nb.firstChild.textContent = ElectroDB.t("newsletterBtn") + " ";
    var cApply = $("couponApply"); if (cApply) cApply.textContent = ElectroDB.t("couponApply");
    if ($("orderCoupon")) $("orderCoupon").setAttribute("placeholder", ElectroDB.t("couponPlaceholder"));
    var ls = $("langSwitch"); if (ls && ls.value !== ElectroDB.getLang()) ls.value = ElectroDB.getLang();
    var dir = ElectroDB.getLang() === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = ElectroDB.getLang();
  }

  function updateBrand() {
    var s = db.settings;
    document.title = "MAJOR STORE — " + localizeField(s.brandSubtitle);
    $("brandName").textContent = s.brand || "MAJOR STORE";
    $("brandSub").textContent = localizeField(s.brandSubtitle) || "Hacking tools & electronic programs";
    $("footerBrand").textContent = s.brand || "MAJOR STORE";
    $("footerSub").textContent = localizeField(s.brandSubtitle);
    $("footerAddress").textContent = localizeField(s.address);
    $("footerText").textContent = localizeField(s.footerText);
    $("announcementText").textContent = localizeField(s.announcement);
    if (s.announcementEnabled && sessionStorage.getItem("major_announcement_v4") !== "1") $("announcement").classList.remove("hidden");
    else $("announcement").classList.add("hidden");
    var mark = ElectroDB.getLogo();
    $("brandMark").innerHTML = mark;
    $("footerMark").innerHTML = mark;
    $("discordLink").href = s.discordLink || "#";
    $("instagramLink").href = "https://instagram.com/" + String(s.instagram || "").replace(/^@/, "");
    $("whatsappLink").href = "https://wa.me/" + String(s.whatsapp || "").replace(/\D/g, "");
    $("emailLink").href = "mailto:" + s.email;
    if ($("paymentPreview")) $("paymentPreview").textContent = "[ " + (s.paymentMethods || []).join(" · ") + " ]";
    var fab = $("supportFab");
    if (fab) {
      fab.setAttribute("aria-label", T("supportButton"));
      fab.title = T("supportButton");
      fab.onclick = function () { openContactModal(); };
    }
  }

  function updateHero() {
    var s = db.settings;
    $("heroBadge").textContent = localizeField(s.heroBadge);
    var title = localizeField(s.heroTitle) || "";
    var parts = title.split("||");
    var h1 = $("heroTitle");
    if (parts.length >= 3) {
      h1.innerHTML = parts[0] + " <em>" + parts[1] + "</em><br />" + parts[2];
    } else {
      h1.textContent = title;
    }
    $("heroText").textContent = localizeField(s.heroText);
    $("heroCta").childNodes[0].nodeValue = (localizeField(s.heroCta) || T("heroCta")) + " ";
    var stats = s.heroStats || [];
    $("heroStats").innerHTML = stats.map(function (x) {
      var v = localizeField(x); return "<div><strong>" + esc(v.value) + "</strong><span>" + esc(v.label) + "</span></div>";
    }).join("");
    $("discordCta").childNodes[0].nodeValue = T("heroSecondary") + " ";
    var bulletIcons = ["⚡", "🛡", "💬", "💎"];
    var bl = $("heroBullets");
    if (bl) bl.innerHTML = (s.heroBullets || []).map(function (b, i) {
      return "<span>" + (bulletIcons[i] || "•") + " <b>" + esc(localizeField(b)) + "</b></span>";
    }).join("");
  }

  function updateSections() {
    var s = db.settings;
    var fe = $("featureGrid");
    if (fe) {
      var fh = $("featuresHeading");
      if (fh) fh.innerHTML = esc(T("featTitle1")) + "<br /><em class='green'>" + esc(T("featTitle2")) + "</em>";
      fe.innerHTML = (s.features || []).map(function (f) {
        return "<article><span class='feat-icon'>" + esc(f.icon) + "</span><h3>" + esc(localizeField(f.title)) + "</h3><p>" + esc(localizeField(f.text)) + "</p></article>";
      }).join("");
    }
    var at2 = $("aboutTitle2"), at = $("aboutText");
    if (at2) at2.textContent = localizeField((s.about && s.about.title) || {});
    if (at) at.textContent = localizeField((s.about && s.about.text) || {});
    var secMap = { hero: "secHero", categories: "categories", shop: "shop", features: "features", about: "about", payments: "payments", contact: "contact" };
    var sec = s.sections || {};
    Object.keys(secMap).forEach(function (k) {
      var el = $(secMap[k]);
      if (el) el.style.display = (sec[k] === false) ? "none" : "";
    });
  }

  function renderCategories() {
    var allLabel = T("sectionAll");
    var allCount = T("sectionAllCount");
    var allCard = "<button class='category-card " + (activeCategory === "all" ? "active" : "") + "' data-category='all'><span class='category-icon all-icon'>✦</span><b>" + esc(allLabel) + "</b><small>" + db.products.length + " " + esc(allCount) + "</small></button>";
    $("categoryRow").innerHTML = allCard + db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      var lbl = localizeField(c.name);
      return "<button class='category-card " + (activeCategory === c.id ? "active" : "") + "' data-category='" + esc(c.id) + "' style='--cat-color:" + esc(c.color) + "'><span class='category-icon'>" + esc(c.icon) + "</span><b>" + esc(lbl) + "</b><small>" + count + " " + esc(allCount) + "</small></button>";
    }).join("");
    var pillAll = T("pillAll");
    $("filterPills").innerHTML = "<button class='pill " + (activeCategory === "all" ? "selected" : "") + "' data-category='all'>" + esc(pillAll) + "</button>" + db.categories.map(function (c) {
      return "<button class='pill " + (activeCategory === c.id ? "selected" : "") + "' data-category='" + esc(c.id) + "'>" + esc(localizeField(c.name)) + "</button>";
    }).join("");
  }

  function filteredProducts() {
    var list = db.products.filter(function (p) {
      var text = ((localizeField(p.name) || "") + " " + (localizeField(p.description) || "") + " " + categoryName(p.category)).toLowerCase();
      return (activeCategory === "all" || p.category === activeCategory) && (!search || text.indexOf(search.toLowerCase()) >= 0);
    });
    if (sort === "low") list.sort(function (a, b) { return a.price - b.price; });
    if (sort === "high") list.sort(function (a, b) { return b.price - a.price; });
    if (sort === "rating") list.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    return list;
  }

  function productVisual(p, large) {
    if (p.image) return "<img src='" + esc(p.image) + "' alt='" + esc(localizeField(p.name)) + "' />";
    return "<span class='visual-emoji " + (large ? "large" : "") + "'>" + esc(p.icon || "✦") + "</span>";
  }

  function renderProducts() {
    var list = filteredProducts(), grid = $("productsGrid"), empty = $("emptyView");
    $("resultCount").innerHTML = list.length + " <span>" + esc(T("resultCount")) + "</span>";
    grid.innerHTML = list.map(function (p) {
      var inCart = cart.some(function (x) { return x.id === p.id; });
      var badgeHtml = p.badge ? "<span class='product-badge'>" + esc(localizeField(p.badge)) + "</span>" : "";
      var specs = p.specs ? "<div class='specs'><span>" + esc(localizeField(p.specs)) + "</span></div>" : "";
      return "<article class='product-card' data-product='" + esc(p.id) + "'><div class='product-image' style='--product-color:" + esc(p.color || "#0d2235") + "'>" + badgeHtml + "<button class='quick-view' data-view='" + esc(p.id) + "'>" + esc(T("cartView")) + "</button>" + productVisual(p, false) + "</div><div class='product-info'><div class='product-category'>" + esc(categoryName(p.category)) + "</div><h3>" + esc(localizeField(p.name)) + "</h3>" + specs + "<p>" + esc((localizeField(p.description) || "").slice(0, 90)) + "</p><div class='rating'><span>[ " + Number(p.rating || 0).toFixed(1) + " ]</span> <small>(" + Number(p.reviews || 0) + ")</small></div><div class='product-bottom'><div><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div><button class='add-btn " + (inCart ? "added" : "") + "' data-add='" + esc(p.id) + "'>" + (inCart ? esc(T("cartIn")) : esc(T("cartAdd"))) + "</button></div></div></article>";
    }).join("");
    empty.hidden = list.length !== 0;
  }

  function renderPayments() {
    var grid = $("payGrid"); if (!grid) return;
    var list = db.settings.paymentMethods || [];
    var icons = {
      "Bitcoin (BTC)": "₿", "Ethereum (ETH)": "Ξ", "USDT (TRC20)": "₮",
      "USDT (ERC20)": "₮", "Litecoin (LTC)": "Ł", "Monero (XMR)": "✕",
      "PayPal": "P", "Visa / Mastercard": "▭", "Western Union": "w",
      "Wise (TransferWise)": "w", "BaridiMob / CCP": "B", "الدفع عند الاستلام": "@"
    };
    grid.innerHTML = list.map(function (m) {
      var ico = icons[m] || "$";
      return "<div class='pay-card'><span class='pay-coin'>" + ico + "</span><b>" + esc(m) + "</b></div>";
    }).join("");
  }

  function renderCart() {
    var box = $("cartItems"), total = cartTotal(); updateCartCount(); $("cartTotal").textContent = money(total);
    var lang = ElectroDB.getLang();
    if (!cart.length) {
      box.innerHTML = "<div class='empty-cart'><span>🛒</span><h3>" + esc(T("cartEmpty")) + "</h3><p>" + esc(T("cartEmptyText")) + "</p><button class='btn btn-outline' id='emptyShop'>" + esc(T("cartBrowse")) + "</button></div>";
      return;
    }
    box.innerHTML = cart.map(function (item, i) {
      var lbl = localizeField(item.name);
      return "<div class='cart-item'><div class='cart-item-visual' style='background:" + esc(item.color || "#0d2235") + "'>" + esc(item.icon || "✦") + "</div><div class='cart-item-info'><b>" + esc(lbl) + "</b><small>" + money(item.price) + "</small><div class='quantity'><button data-qty='" + i + "' data-change='-1'>-</button><span>" + item.qty + "</span><button data-qty='" + i + "' data-change='1'>+</button></div></div><button class='remove-item' data-remove='" + i + "'>×</button></div>";
    }).join("");
  }

  function openCartDrawer() { $("overlay").classList.add("show"); $("cartDrawer").classList.add("show"); document.body.classList.add("locked"); renderCart(); }
  function closeOverlays() { $$(".modal.show").forEach(function (m) { m.classList.remove("show"); }); $("overlay").classList.remove("show"); $("cartDrawer").classList.remove("show"); document.body.classList.remove("locked"); }
  function addToCart(id) {
    var p = db.products.find(function (x) { return x.id === id; }); if (!p) return;
    var item = cart.find(function (x) { return x.id === id; });
    if (item) item.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, icon: p.icon, color: p.color, qty: 1 });
    ElectroDB.saveCart(cart); renderCart(); renderProducts(); toast("✓ " + localizeField(p.name) + " " + T("toastAdded"));
  }

  function openProduct(id) {
    var p = db.products.find(function (x) { return x.id === id; }); if (!p) return;
    var stock = p.stock || 0;
    var lbl = localizeField(p.name);
    var desc = localizeField(p.description);
    var specs = localizeField(p.specs);
    $("productModalContent").innerHTML =
      "<div class='modal-product-visual' style='background:" + esc(p.color || "#0d2235") + "'>" + productVisual(p, true) + "</div>" +
      "<div class='modal-product-info'>" +
        "<span class='eyebrow small'>" + esc(categoryName(p.category)) + "</span>" +
        "<h2>" + esc(lbl) + "</h2>" +
        (specs ? "<div class='specs large' style='margin-top:8px'><span>" + esc(specs) + "</span></div>" : "") +
        "<div class='rating' style='margin-top:8px'><span>★ " + Number(p.rating || 0).toFixed(1) + "</span> <small>(" + Number(p.reviews || 0) + " reviews)</small></div>" +
        "<p style='margin-top:12px'>" + esc(desc) + "</p>" +
        "<div class='stock-line'><span>" + esc(T("cartStock")) + "</span> <b>" + stock.toString().padStart(3, "0") + "</b></div>" +
        "<div class='modal-price'><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div>" +
        "<button class='btn btn-primary full' data-modal-add='" + esc(p.id) + "'>" + esc(T("cartAddFull")) + " <span>＋</span></button>" +
      "</div>";
    $("productModal").classList.add("show");
  }

  function fillCheckout() {
    var total = cartTotal();
    $("checkoutTotal").textContent = money(total);
    var prev = window._orderPayment || "";
    var opts = (db.settings.paymentMethods || []).map(function (x) {
      return "<option value='" + esc(x) + "'>" + esc(x) + "</option>";
    }).join("");
    $("orderPayment").innerHTML = opts;
    var hasPrev = false;
    if (prev) {
      var ops = $("orderPayment").options;
      for (var i = 0; i < ops.length; i++) { if (ops[i].value === prev) { hasPrev = true; break; } }
    }
    if (hasPrev) $("orderPayment").value = prev;
    else if (db.settings.paymentMethods && db.settings.paymentMethods.length) $("orderPayment").value = db.settings.paymentMethods[0];
    updateCryptoPay();
  }

  function updateCryptoPay() {
    var box = $("cryptoPayBox"), sel = $("cryptoNetwork");
    if (!box || !sel) return;
    var method = $("orderPayment") ? $("orderPayment").value : "";
    window._orderPayment = method;
    var cfg = (db.settings.cryptoConfig || {})[method];
    var nets = (cfg && cfg.networks) || [];
    if (!nets.length) { box.hidden = true; window._cryptoNet = null; return; }
    var cur = (sel.getAttribute("data-cur") || nets[0].id);
    sel.innerHTML = nets.map(function (n) {
      return "<option value='" + esc(n.id) + "' " + (n.id === cur ? "selected" : "") + ">" + esc(n.label) + "</option>";
    }).join("");
    box.hidden = false;
    applyCryptoNet(cur);
  }

  function applyCryptoNet(id) {
    var method = $("orderPayment").value;
    var nets = ((db.settings.cryptoConfig || {})[method] || {}).networks || [];
    var net = nets.find(function (n) { return n.id === id; }) || nets[0];
    if (!net) return;
    var sel = $("cryptoNetwork"); if (sel) sel.setAttribute("data-cur", net.id);
    var addr = $("cryptoAddress"); if (addr) addr.textContent = net.address || "";
    var qw = $("cryptoQrWrap"), qi = $("cryptoQr");
    if (net.qr && qw && qi) { qi.src = net.qr; qw.hidden = false; }
    else if (qw) { qw.hidden = true; if (qi) qi.src = ""; }
    window._cryptoNet = net;
  }

  function applyCoupon(code) {
    var c = (db.coupons || []).find(function (x) { return (x.code || "").toLowerCase() === String(code || "").trim().toLowerCase(); });
    return c || null;
  }

  function recomputeTotal() {
    var t = cartTotal();
    if (appliedCoupon) {
      if (appliedCoupon.type === "percent") t = t * (1 - appliedCoupon.value / 100);
      else t = Math.max(0, t - appliedCoupon.value);
    }
    $("checkoutTotal").textContent = money(t);
  }

  function submitOrder(ev) {
    ev.preventDefault();
    if (!cart.length) return toast(T("toastOrderEmpty"), true);
    var nm = $("orderName").value.trim(), ph = $("orderPhone").value.trim(), em = $("orderEmail").value.trim(), ad = $("orderAddress").value.trim();
    if (!nm || !ph || !ad) return toast(T("toastRequired"), true);
    var t = cartTotal();
    if (appliedCoupon) {
      if (appliedCoupon.type === "percent") t = t * (1 - appliedCoupon.value / 100);
      else t = Math.max(0, t - appliedCoupon.value);
    }
    var order = {
      id: "MJR-" + Date.now().toString().slice(-6),
      name: nm, phone: ph, email: em, address: ad,
      payment: $("orderPayment").value,
      cryptoNetwork: window._cryptoNet ? window._cryptoNet.label : null,
      note: $("orderNote").value.trim(),
      items: cart.slice(),
      subtotal: cartTotal(),
      coupon: appliedCoupon ? appliedCoupon.code : null,
      total: t,
      status: "pending",
      date: new Date().toLocaleString("ar-DZ")
    };
    db.orders.unshift(order); ElectroDB.save(db);
    cart = []; ElectroDB.saveCart(cart); appliedCoupon = null;
    $("checkoutForm").reset(); closeOverlays(); renderCart(); renderProducts();
    $("couponMsg").textContent = "";
    toast(T("toastOrderOk").replace("{id}", order.id));
    if (window.MajorCloud && typeof MajorCloud.createOrder === "function") {
      var cloudOrder = {
        id: order.id, name: order.name, phone: order.phone, email: order.email,
        address: order.address, payment: order.payment, crypto_network: order.cryptoNetwork || null,
        note: order.note, items: order.items, subtotal: order.subtotal, coupon: order.coupon,
        total: order.total, status: "pending"
      };
      MajorCloud.createOrder(cloudOrder).catch(function (e) { toast(T("toastCloudFail"), true); });
    }
  }

  function openContactModal() {
    var m = $("contactModal"); if (!m) return;
    m.classList.add("show"); document.body.classList.add("locked");
  }

  function closeContactModal() {
    var m = $("contactModal"); if (!m) return;
    m.classList.remove("show"); document.body.classList.remove("locked");
  }

  function cloudSignature() {
    return JSON.stringify([db.products, db.categories, db.coupons, db.settings]);
  }

  function mergeCloudStore(cloud) {
    if (!cloud || typeof cloud !== "object") return false;
    var changed = false;
    if (Array.isArray(cloud.products)) { db.products = cloud.products; changed = true; }
    if (Array.isArray(cloud.categories)) { db.categories = cloud.categories; changed = true; }
    if (Array.isArray(cloud.coupons)) { db.coupons = cloud.coupons; changed = true; }
    if (cloud.settings && typeof cloud.settings === "object") { db.settings = Object.assign({}, db.settings, cloud.settings); changed = true; }
    return changed;
  }

  /* جلب بيانات المتجر من قاعدة Supabase المشتركة (دون الكتابة الزائدة عند التساوي) */
  function refreshCloudStore() {
    if (!window.MajorCloud || typeof MajorCloud.getStore !== "function") return;
    MajorCloud.getStore().then(function (cloud) {
      if (!cloud) return;
      var before = cloudSignature();
      mergeCloudStore(cloud);
      if (cloudSignature() !== before) { ElectroDB.save(db); refresh(); }
    }).catch(function () { /* keep local data offline */ });
  }

  function refresh() {
    db = ElectroDB.load();
    applyI18nToDOM(); updateBrand(); updateHero(); updateSections(); renderCategories();
    renderProducts(); renderPayments(); renderCart(); fillCheckout();
  }

  function typeLine(el, line) {
    line = String(line || ""); var i = 0;
    function t() { if (i <= line.length) { el.textContent = line.slice(0, i); i++; setTimeout(t, 35); } }
    t();
  }

  refresh();
  $("footerYear").textContent = new Date().getFullYear();
  if ($("typedLine")) {
    ElectroDB.setLang(ElectroDB.getLang());
    var txt = ElectroDB.getLang() === "ar" ? "scan --target ethical-tools --depth all" : "scan --target ethical-tools --depth all";
    typeLine($("typedLine"), txt);
  }

  $("announcementClose").onclick = function () { sessionStorage.setItem("major_announcement_v4", "1"); $("announcement").classList.add("hidden"); };
  $("cartTrigger").onclick = openCartDrawer; $("cartClose").onclick = closeOverlays; $("overlay").onclick = closeOverlays;
  $("searchToggle").onclick = function () { $("searchbar").classList.toggle("open"); if ($("searchbar").classList.contains("open")) $("searchInput").focus(); };
  $("searchClose").onclick = function () { $("searchbar").classList.remove("open"); $("searchInput").value = ""; search = ""; renderProducts(); };
  $("searchInput").oninput = function () { search = this.value.trim(); renderProducts(); };
  $("sortProducts").onchange = function () { sort = this.value; renderProducts(); };
  $("menuToggle").onclick = function () { $("mainNav").classList.toggle("open"); };
  $("langSwitch").onchange = function () { ElectroDB.setLang(this.value); };
  if ($("orderPayment")) $("orderPayment").onchange = function () { updateCryptoPay(); };
  if ($("cryptoNetwork")) $("cryptoNetwork").onchange = function () { applyCryptoNet(this.value); };
  if ($("cryptoCopy")) $("cryptoCopy").onclick = function () {
    var addr = $("cryptoAddress"); if (!addr || !addr.textContent) return;
    var done = function () {
      var b = $("cryptoCopy"); if (b) { var old = b.innerHTML; b.innerHTML = T("payCopied"); setTimeout(function () { b.innerHTML = old; }, 1600); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr.textContent).then(done).catch(done);
    else { var t = document.createElement("textarea"); t.value = addr.textContent; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(); }
  };
  $("couponApply").onclick = function () {
    var code = $("orderCoupon").value;
    var c = applyCoupon(code);
    if (!c) { $("couponMsg").textContent = T("toastCouponInvalid"); $("couponMsg").style.color = "var(--red)"; appliedCoupon = null; recomputeTotal(); return; }
    appliedCoupon = c;
    $("couponMsg").textContent = T("couponApplied") + " (-" + (c.type === "percent" ? c.value + "%" : "$" + c.value) + ")";
    $("couponMsg").style.color = "var(--green)";
    recomputeTotal();
  };
  document.addEventListener("click", function (e) {
    var cat = e.target.closest("[data-category]"); if (cat) { activeCategory = cat.getAttribute("data-category"); renderCategories(); renderProducts(); return; }
    var add = e.target.closest("[data-add]"); if (add) { addToCart(add.getAttribute("data-add")); return; }
    var view = e.target.closest("[data-view]"); if (view) { openProduct(view.getAttribute("data-view")); return; }
    var ma = e.target.closest("[data-modal-add]"); if (ma) { addToCart(ma.getAttribute("data-modal-add")); closeOverlays(); return; }
    var qty = e.target.closest("[data-qty]"); if (qty) { var i = Number(qty.getAttribute("data-qty")); cart[i].qty += Number(qty.getAttribute("data-change")); if (cart[i].qty <= 0) cart.splice(i, 1); ElectroDB.saveCart(cart); renderCart(); renderProducts(); return; }
    var rm = e.target.closest("[data-remove]"); if (rm) { cart.splice(Number(rm.getAttribute("data-remove")), 1); ElectroDB.saveCart(cart); renderCart(); renderProducts(); return; }
    if (e.target.closest("#emptyShop")) { closeOverlays(); $("shop").scrollIntoView({ behavior: "smooth" }); }
    var close = e.target.closest("[data-close]"); if (close) { $(close.getAttribute("data-close")).classList.remove("show"); document.body.classList.remove("locked"); }
  });
  $("checkoutOpen").onclick = function () { if (!cart.length) return toast(T("toastOrderEmpty"), true); fillCheckout(); appliedCoupon = null; recomputeTotal(); $("couponMsg").textContent = ""; $("checkoutModal").classList.add("show"); };
  $("checkoutForm").onsubmit = submitOrder;
  $("clearSearch").onclick = function () { search = ""; activeCategory = "all"; $("searchInput").value = ""; renderCategories(); renderProducts(); };
  $("newsletterForm").onsubmit = function (e) { e.preventDefault(); $("newsletterMessage").textContent = T("newsletterMsg"); e.target.reset(); };
  if ($("contactForm")) $("contactForm").onsubmit = function (e) {
    e.preventDefault();
    var nm = $("cntName").value.trim(), em = $("cntEmail").value.trim(), msg = $("cntMsg").value.trim();
    var st = $("contactMsgStatus");
    if (!nm || !msg) { st.textContent = T("contactRequired"); st.style.color = "var(--red)"; return; }
    if (!window.MajorCloud || typeof MajorCloud.createMessage !== "function") {
      st.textContent = T("contactFail"); st.style.color = "var(--red)"; return;
    }
    st.textContent = T("contactSending"); st.style.color = "var(--green)";
    var payload = { visitor_name: nm, visitor_email: em, message: msg };
    MajorCloud.createMessage(payload).then(function () {
      st.textContent = T("contactSuccess");
      toast("✓ " + T("contactSuccess"));
      e.target.reset();
      setTimeout(closeContactModal, 1300);
    }).catch(function () { st.textContent = T("contactFail"); st.style.color = "var(--red)"; });
  };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlays(); });

  window.addEventListener("major-db-updated", refresh);
  window.addEventListener("major-lang-changed", refresh);
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key === ElectroDB.KEY) refresh();
  });

  /* مزامنة مع قاعدة Supabase المشتركة: عند الفتح، عند العودة للتبويب، وكل 10 ثوانٍ */
  /* BroadcastChannel: إذا حفظ المدير منتجاً في تبويب آخر، هذا التبويب يتحدث فوراً */
  var cloudChannel = null;
  try {
    if (window.BroadcastChannel) cloudChannel = new BroadcastChannel("major-store-sync");
    if (cloudChannel) cloudChannel.onmessage = function (ev) {
      if (ev.data && ev.data.type === "store-updated") { refreshCloudStore(); toast("✓ new products from cloud"); }
      if (ev.data && ev.data.type === "orders-updated") { /* refresh orders list if open */ }
    };
  } catch (e) { cloudChannel = null; }

  refreshCloudStore();
  window.addEventListener("focus", refreshCloudStore);
  window.addEventListener("storage", function (e) {
    if (e.key === "major_store_v4") refreshCloudStore();
  });
  window.setInterval(function () { if (!document.hidden) refreshCloudStore(); }, 10000);
})();