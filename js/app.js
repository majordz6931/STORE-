(function () {
  "use strict";
  var db = ElectroDB.load();
  var cart = ElectroDB.loadCart();
  var activeCategory = "all";
  var search = "";
  var sort = "featured";
  var money = function (n) { return ElectroDB.formatMoney(n, db.settings.currency); };

  function $(id) { return document.getElementById(id); }
  function all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m];
    });
  }
  function toast(message) {
    var el = $("toast"); if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(el._timer); el._timer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }
  function persist() { ElectroDB.save(db); }
  function productName(p) { return p.name; }
  function categoryName(id) {
    var c = db.categories.find(function (item) { return item.id === id; });
    return c ? c.name : "منتجات";
  }
  function cartQuantity() { return cart.reduce(function (sum, item) { return sum + item.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0); }
  function updateCartCount() { $("cartCount").textContent = cartQuantity(); }
  function updateSettings() {
    var s = db.settings;
    $("brandName").textContent = s.brand; $("footerBrand").textContent = s.brand;
    $("brandMark").textContent = s.brandMark || s.brand.charAt(0); $("footerMark").textContent = s.brandMark || s.brand.charAt(0);
    $("heroBadge").innerHTML = esc(s.heroBadge) + " <span>✦</span>";
    $("heroTitle").innerHTML = esc(s.heroTitle).replace(/،\s*/, "،<br />") + "";
    var title = $("heroTitle");
    if (!title.innerHTML.includes("<em>")) {
      var words = esc(s.heroTitle).split(" "); var pivot = Math.max(2, words.length - 3);
      title.innerHTML = esc(words.slice(0, pivot).join(" ")) + "<br /><em>" + esc(words.slice(pivot).join(" ")) + "</em>";
    }
    $("heroText").textContent = s.heroText; $("heroCta").childNodes[0].nodeValue = s.heroCta + " "; $("heroSecondary").childNodes[0].nodeValue = s.heroSecondary + " ";
    var stats = s.heroStats || [];
    $("heroStats").innerHTML = stats.map(function (x) { return "<div><strong>" + esc(x.value) + "</strong><span>" + esc(x.label) + "</span></div>"; }).join("");
    $("footerText").textContent = s.footerText; $("footerAddress").textContent = s.address;
    $("instagramLink").href = "https://instagram.com/" + String(s.instagram || "").replace(/^@/, "");
    $("whatsappLink").href = "https://wa.me/" + String(s.whatsapp || "").replace(/\D/g, "");
    $("emailLink").href = "mailto:" + s.email; $("supportFab").onclick = function () { window.open("https://wa.me/" + String(s.whatsapp || "").replace(/\D/g, ""), "_blank"); };
    if (s.announcementEnabled && sessionStorage.getItem("nova_announcement_closed") !== "1") { $("announcementText").textContent = s.announcement; $("announcement").classList.remove("hidden"); } else $("announcement").classList.add("hidden");
    document.title = s.brand + " — متجر الأدوات الإلكترونية";
  }
  function renderCategories() {
    var row = $("categoryRow"), pills = $("filterPills");
    var allCard = "<button class='category-card " + (activeCategory === "all" ? "active" : "") + "' data-category='all'><span class='category-icon all-icon'>✦</span><b>كل المنتجات</b><small>" + db.products.length + " منتج</small></button>";
    row.innerHTML = allCard + db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      return "<button class='category-card " + (activeCategory === c.id ? "active" : "") + "' data-category='" + esc(c.id) + "' style='--cat-color:" + esc(c.color) + "'><span class='category-icon'>" + esc(c.icon) + "</span><b>" + esc(c.name) + "</b><small>" + count + " منتجات</small></button>";
    }).join("");
    pills.innerHTML = "<button class='pill " + (activeCategory === "all" ? "selected" : "") + "' data-category='all'>الكل</button>" + db.categories.map(function (c) { return "<button class='pill " + (activeCategory === c.id ? "selected" : "") + "' data-category='" + esc(c.id) + "'>" + esc(c.name) + "</button>"; }).join("");
  }
  function filteredProducts() {
    var list = db.products.filter(function (p) {
      var text = (p.name + " " + (p.nameEn || "") + " " + (p.description || "") + " " + categoryName(p.category)).toLowerCase();
      return (activeCategory === "all" || p.category === activeCategory) && (!search || text.indexOf(search.toLowerCase()) !== -1);
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
      return "<article class='product-card' data-product='" + esc(p.id) + "'><div class='product-image' style='--product-color:" + esc(p.color || "#eee") + "'>" + (p.badge ? "<span class='product-badge'>" + esc(p.badge) + "</span>" : "") + "<button class='quick-view' data-view='" + esc(p.id) + "'>↗</button>" + productVisual(p, false) + "</div><div class='product-info'><div class='product-category'>" + esc(categoryName(p.category)) + "</div><h3>" + esc(productName(p)) + "</h3><p>" + esc(p.description || "") + "</p><div class='rating'><span>★</span> " + Number(p.rating || 0).toFixed(1) + " <small>(" + Number(p.reviews || 0) + ")</small></div><div class='product-bottom'><div><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div><button class='add-btn " + (inCart ? "added" : "") + "' data-add='" + esc(p.id) + "'>" + (inCart ? "✓ في السلة" : "＋ أضف للسلة") + "</button></div></div></article>";
    }).join("");
    empty.hidden = list.length !== 0;
  }
  function renderCart() {
    var box = $("cartItems"), total = cartTotal(); updateCartCount(); $("cartTotal").textContent = money(total);
    if (!cart.length) { box.innerHTML = "<div class='empty-cart'><span>🛍</span><h3>السلة فارغة</h3><p>أضف منتجاتك المفضلة وستظهر هنا.</p><button class='btn btn-outline' id='emptyShop'>تصفح المنتجات</button></div>"; return; }
    box.innerHTML = cart.map(function (item, index) { return "<div class='cart-item'><div class='cart-item-visual' style='background:" + esc(item.color || "#eee") + "'>" + esc(item.icon || "✦") + "</div><div class='cart-item-info'><b>" + esc(item.name) + "</b><small>" + money(item.price) + "</small><div class='quantity'><button data-qty='" + index + "' data-change='-1'>−</button><span>" + item.qty + "</span><button data-qty='" + index + "' data-change='1'>＋</button></div></div><button class='remove-item' data-remove='" + index + "'>×</button></div>"; }).join("");
  }
  function openDrawer() { $("overlay").classList.add("show"); $("cartDrawer").classList.add("show"); document.body.classList.add("locked"); renderCart(); }
  function closeOverlays() { all(".modal.show").forEach(function (x) { x.classList.remove("show"); }); $("overlay").classList.remove("show"); $("cartDrawer").classList.remove("show"); document.body.classList.remove("locked"); }
  function addToCart(id) { var p = db.products.find(function (x) { return x.id === id; }); if (!p) return; var item = cart.find(function (x) { return x.id === id; }); if (item) item.qty += 1; else cart.push({ id: p.id, name: p.name, price: p.price, icon: p.icon, color: p.color, qty: 1 }); ElectroDB.saveCart(cart); renderCart(); renderProducts(); toast("تمت إضافة المنتج إلى السلة"); }
  function openProduct(id) { var p = db.products.find(function (x) { return x.id === id; }); if (!p) return; $("productModalContent").innerHTML = "<div class='modal-product-visual' style='background:" + esc(p.color || "#eee") + "'>" + productVisual(p, true) + "</div><div class='modal-product-info'><span class='eyebrow small'>" + esc(categoryName(p.category)) + "</span><h2>" + esc(p.name) + "</h2><div class='rating'><span>★</span> " + Number(p.rating || 0).toFixed(1) + " <small>" + Number(p.reviews || 0) + " تقييم</small></div><p>" + esc(p.description || "") + "</p><div class='modal-price'><strong>" + money(p.price) + "</strong>" + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + "</div><button class='btn btn-primary full' data-modal-add='" + esc(p.id) + "'>إضافة إلى السلة <span>＋</span></button></div>"; $("productModal").classList.add("show"); }
  function fillCheckout() { $("checkoutTotal").textContent = money(cartTotal()); $("orderPayment").innerHTML = (db.settings.paymentMethods || []).map(function (x) { return "<option>" + esc(x) + "</option>"; }).join(""); }
  function submitOrder(event) { event.preventDefault(); if (!cart.length) return toast("أضف منتجاً أولاً"); var order = { id: "NOVA-" + Date.now().toString().slice(-6), name: $("orderName").value.trim(), phone: $("orderPhone").value.trim(), address: $("orderAddress").value.trim(), payment: $("orderPayment").value, note: $("orderNote").value.trim(), items: cart.slice(), total: cartTotal(), status: "pending", date: new Date().toLocaleString("ar-DZ") }; db.orders.unshift(order); persist(); cart = []; ElectroDB.saveCart(cart); $("checkoutForm").reset(); closeOverlays(); renderCart(); renderProducts(); toast("تم استلام طلبك " + order.id + " — سنتواصل معك قريباً"); }
  function refresh() { db = ElectroDB.load(); money = function (n) { return ElectroDB.formatMoney(n, db.settings.currency); }; updateSettings(); renderCategories(); renderProducts(); renderCart(); fillCheckout(); }

  updateSettings(); renderCategories(); renderProducts(); renderCart(); $("footerYear").textContent = new Date().getFullYear();
  $("announcementClose").onclick = function () { sessionStorage.setItem("nova_announcement_closed", "1"); $("announcement").classList.add("hidden"); };
  $("cartTrigger").onclick = openDrawer; $("cartClose").onclick = closeOverlays; $("overlay").onclick = closeOverlays;
  $("searchToggle").onclick = function () { $("searchbar").classList.toggle("open"); if ($("searchbar").classList.contains("open")) $("searchInput").focus(); };
  $("searchClose").onclick = function () { $("searchbar").classList.remove("open"); $("searchInput").value = ""; search = ""; renderProducts(); };
  $("searchInput").oninput = function () { search = this.value.trim(); renderProducts(); };
  $("sortProducts").onchange = function () { sort = this.value; renderProducts(); };
  $("menuToggle").onclick = function () { $("mainNav").classList.toggle("open"); };
  document.addEventListener("click", function (event) {
    var category = event.target.closest("[data-category]"); if (category) { activeCategory = category.getAttribute("data-category"); renderCategories(); renderProducts(); if (event.target.closest(".category-card")) $("shop").scrollIntoView({ behavior: "smooth" }); return; }
    var add = event.target.closest("[data-add]"); if (add) { addToCart(add.getAttribute("data-add")); return; }
    var view = event.target.closest("[data-view]"); if (view) { openProduct(view.getAttribute("data-view")); return; }
    var modalAdd = event.target.closest("[data-modal-add]"); if (modalAdd) { addToCart(modalAdd.getAttribute("data-modal-add")); closeOverlays(); return; }
    var qty = event.target.closest("[data-qty]"); if (qty) { var i = Number(qty.getAttribute("data-qty")); cart[i].qty += Number(qty.getAttribute("data-change")); if (cart[i].qty <= 0) cart.splice(i, 1); ElectroDB.saveCart(cart); renderCart(); renderProducts(); return; }
    var remove = event.target.closest("[data-remove]"); if (remove) { cart.splice(Number(remove.getAttribute("data-remove")), 1); ElectroDB.saveCart(cart); renderCart(); renderProducts(); return; }
    if (event.target.closest("#emptyShop")) { closeOverlays(); $("shop").scrollIntoView({ behavior: "smooth" }); }
    var close = event.target.closest("[data-close]"); if (close) { $(close.getAttribute("data-close")).classList.remove("show"); document.body.classList.remove("locked"); }
  });
  $("checkoutOpen").onclick = function () { if (!cart.length) return toast("السلة فارغة"); fillCheckout(); $("checkoutModal").classList.add("show"); };
  $("checkoutForm").onsubmit = submitOrder;
  $("clearSearch").onclick = function () { search = ""; activeCategory = "all"; $("searchInput").value = ""; renderCategories(); renderProducts(); };
  $("newsletterForm").onsubmit = function (e) { e.preventDefault(); $("newsletterMessage").textContent = "تم الاشتراك بنجاح — شكراً لك ✦"; e.target.reset(); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlays(); });
  window.addEventListener("nova-db-updated", function () { refresh(); });
  window.addEventListener("storage", function () { refresh(); });
})();