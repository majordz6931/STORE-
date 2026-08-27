(function () {
  "use strict";
  var logged = sessionStorage.getItem("major_admin_logged") === "1";
  var db = ElectroDB.load();
  var editingId = null;
  var $ = function (id) { return document.getElementById(id); };
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function money(n) { return ElectroDB.formatMoney(n, db.settings.currency); }
  function save() { ElectroDB.save(db); }
  function toast(msg, bad) {
    var e = $("adminToast"); e.textContent = msg; e.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove("show"); }, 2400);
  }
  function renderBrand() { $("loginMark").innerHTML = ElectroDB.getLogo(); $("sideMark").innerHTML = ElectroDB.getLogo(); }
  function renderOverview() {
    var orders = db.orders || [], revenue = orders.reduce(function (s, o) { return s + Number(o.total || 0); }, 0);
    $("metricProducts").textContent = db.products.length;
    $("metricOrders").textContent = orders.length;
    $("metricPending").textContent = orders.filter(function (x) { return x.status === "pending"; }).length;
    $("metricRevenue").textContent = money(revenue);
    $("productBadge").textContent = db.products.length;
    $("orderBadge").textContent = orders.filter(function (x) { return x.status === "pending"; }).length;
    var mini = $("miniOrders");
    if (!orders.length) { mini.innerHTML = "<div class='empty-admin'>MAJOR STORE لم يستلم طلبات بعد.<br /><small>ستظهر هنا عند أول طلب من اللاعبين.</small></div>"; return; }
    mini.innerHTML = orders.slice(0, 5).map(function (o) { return "<div class='mini-order'><span class='order-avatar'>" + esc((o.name || "ز").charAt(0)) + "</span><div><b>" + esc(o.name) + "</b><small>" + esc(o.id) + " · " + esc(o.date) + "</small></div><strong>" + money(o.total) + "</strong></div>"; }).join("");
  }
  function renderProductCategories() {
    $("productCategory").innerHTML = db.categories.map(function (c) { return "<option value='" + esc(c.id) + "'>" + esc(c.icon) + " " + esc(c.name) + "</option>"; }).join("");
  }
  function renderProducts() {
    renderProductCategories();
    var q = $("adminProductSearch").value.toLowerCase().trim(), m = $("adminProductSort").value;
    var list = db.products.filter(function (p) { return !q || (p.name + " " + p.description).toLowerCase().indexOf(q) >= 0; });
    if (m === "low") list.sort(function (a, b) { return a.price - b.price; });
    if (m === "high") list.sort(function (a, b) { return b.price - a.price; });
    $("adminProductsGrid").innerHTML = list.map(function (p) { return "<article class='admin-product-card'><div class='admin-product-art' style='background:" + esc(p.color) + "'>" + (p.image ? "<img src='" + esc(p.image) + "' alt='' />" : "<span>" + esc(p.icon) + "</span>") + "<em>" + esc(p.badge || "") + "</em></div><div class='admin-product-body'><small>" + esc(db.categories.find(function (c) { return c.id === p.category; })?.name || "منتج") + "</small><h3>" + esc(p.name) + "</h3><p>" + esc(p.description) + "</p><div class='admin-product-meta'><strong>" + money(p.price) + "</strong><span>المخزون: " + p.stock + "</span></div><div class='card-actions'><button class='btn small outline' data-edit-product='" + esc(p.id) + "'>تعديل</button><button class='icon-danger' data-delete-product='" + esc(p.id) + "'>حذف</button></div></div></article>"; }).join("") || "<div class='empty-admin wide'>MAJOR STORE لا يحتوي منتجات مطابقة.</div>";
  }
  function renderCategories() {
    $("categoryCount").textContent = db.categories.length;
    $("adminCategoriesList").innerHTML = db.categories.map(function (c) { var count = db.products.filter(function (p) { return p.category === c.id; }).length; return "<div class='admin-category'><span class='cat-swatch' style='background:" + esc(c.color) + "'>" + esc(c.icon) + "</span><div><b>" + esc(c.name) + "</b><small>" + count + " منتجات</small></div><button data-delete-category='" + esc(c.id) + "'>×</button></div>"; }).join("");
  }
  function renderHomepage() {
    var s = db.settings, stats = s.heroStats || [];
    $("homeBadge").value = s.heroBadge; $("homeTitle").value = s.heroTitle; $("homeText").value = s.heroText;
    $("homeCta").value = s.heroCta; $("homeSecondary").value = s.heroSecondary;
    [1, 2, 3].forEach(function (i) { $("stat" + i + "Value").value = stats[i - 1]?.value || ""; $("stat" + i + "Label").value = stats[i - 1]?.label || ""; });
  }
  function renderSettings() {
    var s = db.settings;
    $("settingBrand").value = s.brand;
    $("settingDesc").value = s.brandDescription || "";
    $("settingFooter").value = s.footerText;
    $("settingPhone").value = s.phone; $("settingWhatsapp").value = s.whatsapp; $("settingEmail").value = s.email;
    $("settingAddress").value = s.address; $("settingInstagram").value = s.instagram;
    $("settingAnnouncementEnabled").checked = s.announcementEnabled;
    $("settingAnnouncement").value = s.announcement;
    $("settingPayments").value = (s.paymentMethods || []).join("\n");
  }
  function renderOrders() {
    var rows = $("ordersTable"), empty = $("ordersEmpty");
    if (!db.orders.length) { rows.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    rows.innerHTML = db.orders.map(function (o) { var items = (o.items || []).map(function (i) { return esc(i.name) + " ×" + i.qty; }).join("<br />"); return "<tr><td><b>" + esc(o.id) + "</b><small>" + esc(o.date) + "</small></td><td><b>" + esc(o.name) + "</b><small>" + esc(o.phone) + "</small></td><td>" + esc(o.address) + "</td><td><b>" + money(o.total) + "</b><small>" + items + "</small></td><td>" + esc(o.payment) + "</td><td><select class='status-select status-" + esc(o.status) + "' data-order-status='" + esc(o.id) + "'><option value='pending' " + (o.status === "pending" ? "selected" : "") + ">قيد المراجعة</option><option value='confirmed' " + (o.status === "confirmed" ? "selected" : "") + ">مؤكد</option><option value='shipped' " + (o.status === "shipped" ? "selected" : "") + ">تم التسليم</option><option value='done' " + (o.status === "done" ? "selected" : "") + ">مكتمل</option><option value='cancelled' " + (o.status === "cancelled" ? "selected" : "") + ">ملغى</option></select></td><td><button class='icon-danger' data-delete-order='" + esc(o.id) + "'>×</button></td></tr>"; }).join("");
  }
  function renderAll() { db = ElectroDB.load(); renderBrand(); renderOverview(); renderProducts(); renderCategories(); renderHomepage(); renderSettings(); renderOrders(); }
  function openEditor(id) {
    editingId = id || null; var p = id ? db.products.find(function (x) { return x.id === id; }) : null;
    $("editorTitle").textContent = p ? "تعديل المنتج" : "إضافة منتج";
    $("productId").value = p ? p.id : "";
    $("productName").value = p ? p.name : "";
    $("productNameEn").value = p ? p.nameEn || "" : "";
    $("productCategory").value = p ? p.category : (db.categories[0] ? db.categories[0].id : "");
    $("productPrice").value = p ? p.price : "";
    $("productOldPrice").value = p ? p.oldPrice || "" : "";
    $("productStock").value = p ? p.stock : 10;
    $("productIcon").value = p ? p.icon : "✦";
    $("productColor").value = p ? p.color : "#ffe1ea";
    $("productBadge").value = p ? p.badge || "" : "جديد";
    $("productDescription").value = p ? p.description : "";
    $("productImage").value = p ? p.image || "" : "";
    $("productEditor").classList.add("open");
  }
  function closeEditor() { $("productEditor").classList.remove("open"); }
  function setPanel(name) {
    all(".nav-item").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".admin-panel").forEach(function (x) { x.classList.toggle("active", x.id === "panel-" + name); });
    var nav = document.querySelector("[data-panel='" + name + "']");
    $("pageTitle").textContent = nav ? nav.textContent.replace(/\d+/g, "").trim() : "لوحة التحكم";
    if (window.innerWidth < 900) $("dashboard").classList.remove("side-open");
  }
  function bind() {
    $("loginForm").onsubmit = function (e) {
      e.preventDefault();
      if ($("loginUser").value.trim() === "admin" && $("loginPass").value === "major2026") {
        sessionStorage.setItem("major_admin_logged", "1"); logged = true;
        $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
      } else $("loginError").textContent = "بيانات الدخول غير صحيحة. جرّب admin / major2026";
    };
    $("logoutBtn").onclick = function () { sessionStorage.removeItem("major_admin_logged"); location.reload(); };
    all(".nav-item").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all("[data-go]").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-go")); }; });
    $("mobileSide").onclick = function () { $("dashboard").classList.toggle("side-open"); };
    $("newProductBtn").onclick = function () { openEditor(); };
    all("[data-close-editor]").forEach(function (x) { x.onclick = closeEditor; });
    $("adminProductSearch").oninput = renderProducts; $("adminProductSort").onchange = renderProducts;
    $("productForm").onsubmit = function (e) {
      e.preventDefault();
      var data = {
        id: editingId || ElectroDB.uid("p"),
        category: $("productCategory").value,
        name: $("productName").value.trim(),
        nameEn: $("productNameEn").value.trim(),
        price: Number($("productPrice").value),
        oldPrice: Number($("productOldPrice").value) || 0,
        stock: Number($("productStock").value) || 0,
        icon: $("productIcon").value || "✦",
        color: $("productColor").value,
        badge: $("productBadge").value.trim(),
        description: $("productDescription").value.trim(),
        image: $("productImage").value.trim(),
        rating: editingId ? (db.products.find(function (p) { return p.id === editingId; }) || {}).rating || 4.8 : 4.8,
        reviews: editingId ? (db.products.find(function (p) { return p.id === editingId; }) || {}).reviews || 0 : 0
      };
      if (!data.name || !data.price) return toast("أكمل اسم المنتج والسعر", true);
      var idx = db.products.findIndex(function (p) { return p.id === data.id; });
      if (idx >= 0) db.products[idx] = data; else db.products.unshift(data);
      save(); closeEditor(); renderAll();
      toast(idx >= 0 ? "تم تحديث المنتج" : "تمت إضافة المنتج");
    };
    document.addEventListener("click", function (e) {
      var ep = e.target.closest("[data-edit-product]"); if (ep) openEditor(ep.getAttribute("data-edit-product"));
      var dp = e.target.closest("[data-delete-product]");
      if (dp && confirm("حذف المنتج؟")) { db.products = db.products.filter(function (x) { return x.id !== dp.getAttribute("data-delete-product"); }); save(); renderAll(); toast("تم حذف المنتج"); }
      var dc = e.target.closest("[data-delete-category]");
      if (dc && confirm("حذف القسم؟")) { db.categories = db.categories.filter(function (x) { return x.id !== dc.getAttribute("data-delete-category"); }); save(); renderAll(); toast("تم حذف القسم"); }
      var dord = e.target.closest("[data-delete-order]");
      if (dord && confirm("حذف الطلب؟")) { db.orders = db.orders.filter(function (x) { return x.id !== dord.getAttribute("data-delete-order"); }); save(); renderAll(); toast("تم حذف الطلب"); }
    });
    $("categoryForm").onsubmit = function (e) {
      e.preventDefault();
      var n = $("categoryName").value.trim(); if (!n) return;
      db.categories.push({ id: ElectroDB.uid("cat"), name: n, icon: $("categoryIcon").value || "✦", color: $("categoryColor").value });
      save(); e.target.reset(); renderAll(); toast("تمت إضافة القسم");
    };
    $("homepageForm").onsubmit = function (e) {
      e.preventDefault();
      db.settings.heroBadge = $("homeBadge").value; db.settings.heroTitle = $("homeTitle").value; db.settings.heroText = $("homeText").value;
      db.settings.heroCta = $("homeCta").value; db.settings.heroSecondary = $("homeSecondary").value;
      db.settings.heroStats = [1, 2, 3].map(function (i) { return { value: $("stat" + i + "Value").value, label: $("stat" + i + "Label").value }; });
      save(); renderAll(); $("homeSaved").textContent = "تم الحفظ ✓"; toast("MAJOR STORE حدّث الواجهة");
    };
    $("settingsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.brand = $("settingBrand").value; s.brandDescription = $("settingDesc").value; s.footerText = $("settingFooter").value;
      s.phone = $("settingPhone").value; s.whatsapp = $("settingWhatsapp").value; s.email = $("settingEmail").value;
      s.address = $("settingAddress").value; s.instagram = $("settingInstagram").value;
      s.announcementEnabled = $("settingAnnouncementEnabled").checked; s.announcement = $("settingAnnouncement").value;
      s.paymentMethods = $("settingPayments").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      save(); renderAll(); $("settingsSaved").textContent = "تم الحفظ ✓"; toast("تم حفظ الإعدادات");
    };
    $("ordersTable").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-order-status"); if (!id) return;
      var o = db.orders.find(function (x) { return x.id === id; });
      if (o) { o.status = e.target.value; save(); renderAll(); toast("حالة الطلب: " + e.target.value); }
    });
    $("clearOrdersBtn").onclick = function () { if (db.orders.length && confirm("مسح كل الطلبات؟")) { db.orders = []; save(); renderAll(); toast("تم مسح الطلبات"); } };
  }
  bind();
  if (logged) { $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll(); }
  else $("loginScreen").hidden = false;
  window.addEventListener("major-db-updated", renderAll);
})();