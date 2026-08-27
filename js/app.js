(function () {
  "use strict";
  var db = ElectroDB.load();
  var cart = ElectroDB.loadCart();
  var activeCategory = "all";
  var search = "";
  var sort = "featured";
  var money = function (n) { return ElectroDB.formatMoney(n, db.settings.currency); };

  function $(id) { return document.getElementById(id); }
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function toast(msg, bad) {
    var el = $("toast"); if (!el) return;
    el.textContent = msg; el.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }
  function categoryName(id) { var c = db.categories.find(function (x) { return x.id === id; }); return c ? c.name : "منتج"; }
  function cartQty() { return cart.reduce(function (s, x) { return s + x.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (s, x) { return s + x.price * x.qty; }, 0); }
  function updateCartCount() { $("cartCount").textContent = cartQty(); }
  function updateBrand() {
    document.title = (db.settings.brand || "MAJOR CYBER") + " — " + (db.settings.brandSubtitle || "");
    $("brandName").textContent = db.settings.brand || "MAJOR CYBER";
    $("brandSub").textContent = db.settings.brandSubtitle || "TOOLS · EXPLOITS · LABS";
    $("footerBrand").textContent = db.settings.brand || "MAJOR CYBER";
    $("footerSub").textContent = db.settings.brandSubtitle || "TOOLS · EXPLOITS · LABS";
    $("footerAddress").textContent = db.settings.address || "الجزائر";
    $("footerText").textContent = db.settings.footerText || "";
    $("announcementText").textContent = db.settings.announcement || "";
    if (db.settings.announcementEnabled && sessionStorage.getItem("major_announcement_v3") !== "1") {
      $("announcement").classList.remove("hidden");
    } else $("announcement").classList.add("hidden");
    var mark = ElectroDB.getLogo();
    $("brandMark").innerHTML = mark;
    $("footerMark").innerHTML = mark;
    $("discordCta").href = db.settings.discordLink || "#";
    $("discordLink").href = db.settings.discordLink || "#";
    $("instagramLink").href = "https://instagram.com/" + String(db.settings.instagram || "").replace(/^@/, "");
    $("whatsappLink").href = "https://wa.me/" + String(db.settings.whatsapp || "").replace(/\D/g, "");
    $("emailLink").href = "mailto:" + db.settings.email;
    if ($("paymentPreview")) {
      $("paymentPreview").textContent = "[ " + (db.settings.paymentMethods || []).join(" · ") + " ]";
    }
    $("supportFab").onclick = function () { window.open("https://wa.me/" + String(db.settings.whatsapp || "").replace(/\D/g, ""), "_blank"); };
    document.documentElement.style.setProperty("--bs-currency", db.settings.currency || "دج");
  }
  function updateHero() {
    var s = db.settings;
    $("heroBadge").textContent = s.heroBadge;
    $("heroTitle").innerHTML = s.heroTitle;
    $("glitchText").setAttribute("data-text", ($("glitchText").textContent || ""));
    $("heroText").textContent = s.heroText;
    $("heroCta").childNodes[0].nodeValue = (s.heroCta || "") + " ";
    var stats = s.heroStats || [];
    $("heroStats").innerHTML = stats.map(function (x) { return "<div><strong>" + esc(x.value) + "</strong><span>" + esc(x.label) + "</span></div>"; }).join("");
  }
  function renderCategories() {
    var allCard = "<button class='category-card " + (activeCategory === "all" ? "active" : "") + "' data-category='all'><span class='category-icon all-icon'>✦</span><b>all products</b><small>" + db.products.length + " منتج</small></button>";
    $("categoryRow").innerHTML = allCard + db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      return "<button class='category-card " + (activeCategory === c.id ? "active" : "") + "' data-category='" + esc(c.id) + "' style='--cat-color:" + esc(c.color) + "'><span class='category-icon'>" + esc(c.icon) + "</span><b>" + esc(c.name) + "</b><small>" + count + " منتج</small></button>";
    }).join("");
    $("filterPills").innerHTML = "<button class='pill " + (activeCategory === "all" ? "selected" : "") + "' data-category='all'>all</button>" + db.categories.map(function (c) { return "<button class='pill " + (activeCategory === c.id ? "selected" : "") + "' data-category='" + esc(c.id) + "'>" + esc(c.name) + "</button>"; }).join("");
  }
  function filteredProducts() {
    var list = db.products.filter(function (p) {
      var text = (p.name + " " + (p.nameEn || "") + " " + (p.description || "") + " " + categoryName(p.category)).toLowerCase();
      return (activeCategory === "all" || p.category === activeCategory) && (!search || text.indexOf(search.toLowerCase()) >= 0);
    });
    if (sort === "low") list.sort(function (a, b) { return a.price - b.price; });
    if (sort === "high") list.sort(function (a, b) { return b.price - a.price; });
    if (sort === "rating") list.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    return list;
  }
  function productVisual(p, large) {
    if (p.image) return "<img src='" + esc(p.image) + "' alt='" + esc(p.name) + "' />";
    return "<span class='visual-emoji " + (large ? "large" : "") + "'>" + esc(p.icon || "✦") + "</span>";
  }
  function renderProducts() {
    var list = filteredProducts(), grid = $("productsGrid"), empty = $("emptyView");
    $("resultCount").textContent = list.length + " منتج";
    grid.innerHTML = list.map(function (p) {
      var inCart = cart.some(function (x) { return x.id === p.id; });
      return "<article class='product-card' data-product='" + esc(p.id) + "'><div class='product-image' style='--product-color:" + esc(p.color || "#0d2235") + "'>" + (p.badge ? "<span class='product-badge'>" + esc(p.badge) + "</span>" : "") + "<button class='quick-view' data-view='" + esc(p.id) + "'>view</button>" + productVisual(p, false) + "</div><div class='product-info'><div class='product-category'>" + esc(categoryName(p.category)) + "</div><h3>" + esc(p.name) + "</h3><p>" + esc(p.description || "") + "</p><div class='rating'><span>[ " + Number(p.rating || 0).toFixed(1) + " ]</span> <small>(" + Number(p.reviews || 0) + " reviews)</small></div><div class='product-bottom'><div><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div><button class='add-btn " + (inCart ? "added" : "") + "' data-add='" + esc(p.id) + "'>" + (inCart ? "✓ in cart" : "＋ add") + "</button></div></div></article>";
    }).join("");
    empty.hidden = list.length !== 0;
  }
  function renderCart() {
    var box = $("cartItems"), total = cartTotal(); updateCartCount(); $("cartTotal").textContent = money(total);
    if (!cart.length) { box.innerHTML = "<div class='empty-cart'><span>🛒</span><h3 style='color:var(--ink);font-size:18px;font-family:Fira Code,monospace'>// cart empty</h3><p>your shopping cart is empty.</p><button class='btn btn-outline' id='emptyShop'>browse products</button></div>"; return; }
    box.innerHTML = cart.map(function (item, i) { return "<div class='cart-item'><div class='cart-item-visual' style='background:" + esc(item.color || "#0d2235") + "'>" + esc(item.icon || "✦") + "</div><div class='cart-item-info'><b>" + esc(item.name) + "</b><small>" + money(item.price) + "</small><div class='quantity'><button data-qty='" + i + "' data-change='-1'>-</button><span>" + item.qty + "</span><button data-qty='" + i + "' data-change='1'>+</button></div></div><button class='remove-item' data-remove='" + i + "'>×</button></div>"; }).join("");
  }
  function openCartDrawer() { $("overlay").classList.add("show"); $("cartDrawer").classList.add("show"); document.body.classList.add("locked"); renderCart(); }
  function closeOverlays() { all(".modal.show").forEach(function (m) { m.classList.remove("show"); }); $("overlay").classList.remove("show"); $("cartDrawer").classList.remove("show"); document.body.classList.remove("locked"); }
  function addToCart(id) {
    var p = db.products.find(function (x) { return x.id === id; }); if (!p) return;
    var item = cart.find(function (x) { return x.id === id; });
    if (item) item.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, icon: p.icon, color: p.color, qty: 1 });
    ElectroDB.saveCart(cart); renderCart(); renderProducts(); toast("✓ added " + p.name, false);
  }
  function openProduct(id) {
    var p = db.products.find(function (x) { return x.id === id; }); if (!p) return;
    var stock = p.stock || 0;
    var stockHtml = "<div class='stock-line' style='margin-top:14px;padding:10px 14px;background:var(--surface);border:1px solid var(--line);border-radius:10px;font-family:Fira Code,monospace;font-size:11px'><span style='color:var(--muted)'>stock</span> <b style='color:var(--green);margin-" + (document.documentElement.dir === "rtl" ? "right" : "left") + ":6px'>" + stock.toString().padStart(3, "0") + "</b> available</div>";
    $("productModalContent").innerHTML = "<div class='modal-product-visual' style='background:" + esc(p.color || "#0d2235") + "'>" + productVisual(p, true) + "</div><div class='modal-product-info'><span class='eyebrow small'>" + esc(categoryName(p.category)) + "</span><h2>" + esc(p.name) + "</h2><div class='rating'><span>★ " + Number(p.rating || 0).toFixed(1) + "</span> <small>(" + Number(p.reviews || 0) + " reviews)</small></div><p>" + esc(p.description || "") + "</p>" + (p.specs ? ("<div class='product-specs' style='background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px;font-family:Fira Code,monospace;font-size:11px;color:var(--ink-mid);margin-top:10px'><pre style='white-space:pre-wrap;margin:0'>" + esc(p.specs) + "</pre></div>") : "") + stockHtml + "<div class='modal-price'><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div><button class='btn btn-primary full' data-modal-add='" + esc(p.id) + "'>＋ add to cart <span>$</span></button></div>";
    $("productModal").classList.add("show");
  }
  function fillCheckout() {
    var total = cartTotal();
    $("checkoutTotal").textContent = money(total);
    $("orderPayment").innerHTML = (db.settings.paymentMethods || []).map(function (x) { return "<option value='" + esc(x) + "'>" + esc(x) + "</option>"; }).join("");
    $("couponHint") && ($("couponHint").textContent = "available: " + (db.coupons || []).map(function (c) { return c.code; }).join(", "));
  }
  function applyCoupon(code) {
    var c = (db.coupons || []).find(function (x) { return x.code.toLowerCase() === String(code || "").trim().toLowerCase(); });
    return c || null;
  }
  function submitOrder(ev) {
    ev.preventDefault();
    if (!cart.length) return toast("cart is empty", true);
    var coupon = applyCoupon($("orderCoupon") ? $("orderCoupon").value : "");
    var t = cartTotal();
    if (coupon) { if (coupon.type === "percent") t = t * (1 - coupon.value / 100); else t = Math.max(0, t - coupon.value); }
    var order = {
      id: "MJR-" + Date.now().toString().slice(-6),
      name: $("orderName").value.trim(),
      phone: $("orderPhone").value.trim(),
      email: $("orderEmail").value.trim(),
      address: $("orderAddress").value.trim(),
      payment: $("orderPayment").value,
      note: $("orderNote").value.trim(),
      items: cart.slice(),
      subtotal: cartTotal(),
      coupon: coupon ? coupon.code : null,
      total: t,
      status: "pending",
      date: new Date().toLocaleString("ar-DZ")
    };
    db.orders.unshift(order); ElectroDB.save(db);
    cart = []; ElectroDB.saveCart(cart);
    $("checkoutForm").reset(); closeOverlays(); renderCart(); renderProducts();
    if ($("orderCoupon")) $("orderCoupon").value = "";
    toast("✓ order " + order.id + " received", false);
  }

  function refresh() {
    db = ElectroDB.load();
    money = function (n) { return ElectroDB.formatMoney(n, db.settings.currency); };
    updateBrand(); updateHero(); renderCategories(); renderProducts(); renderCart(); fillCheckout();
  }

  function typeLine(el, line) {
    line = String(line || ""); var i = 0;
    function t() { if (i <= line.length) { el.textContent = line.slice(0, i); i++; setTimeout(t, 50); } }
    t();
  }

  updateBrand(); updateHero(); renderCategories(); renderProducts(); renderCart(); $("footerYear").textContent = new Date().getFullYear();
  if ($("typedLine")) typeLine($("typedLine"), "scan --target ethical-tools --depth all --max-results 200");

  $("announcementClose").onclick = function () { sessionStorage.setItem("major_announcement_v3", "1"); $("announcement").classList.add("hidden"); };
  $("cartTrigger").onclick = openCartDrawer; $("cartClose").onclick = closeOverlays; $("overlay").onclick = closeOverlays;
  $("searchToggle").onclick = function () { $("searchbar").classList.toggle("open"); if ($("searchbar").classList.contains("open")) $("searchInput").focus(); };
  $("searchClose").onclick = function () { $("searchbar").classList.remove("open"); $("searchInput").value = ""; search = ""; renderProducts(); };
  $("searchInput").oninput = function () { search = this.value.trim(); renderProducts(); };
  $("sortProducts").onchange = function () { sort = this.value; renderProducts(); };
  $("menuToggle").onclick = function () { $("mainNav").classList.toggle("open"); };
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
  $("checkoutOpen").onclick = function () { if (!cart.length) return toast("cart is empty", true); fillCheckout(); $("checkoutModal").classList.add("show"); };
  $("checkoutForm").onsubmit = submitOrder;
  $("clearSearch").onclick = function () { search = ""; activeCategory = "all"; $("searchInput").value = ""; renderCategories(); renderProducts(); };
  $("newsletterForm").onsubmit = function (e) { e.preventDefault(); $("newsletterMessage").textContent = "✓ subscribed — check your inbox"; e.target.reset(); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlays(); });
  fillCheckout();

  window.addEventListener("major-db-updated", refresh);
  window.addEventListener("storage", refresh);
})();