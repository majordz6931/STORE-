(function () {
  "use strict";
  var logged = sessionStorage.getItem("major_admin_v3") === "1";
  var db = ElectroDB.load();
  var auth = ElectroDB.getAdminAuth();
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
  function renderBrand() {
    var mark = ElectroDB.getLogo();
    $("loginMark").innerHTML = mark;
    $("sideMark").innerHTML = mark;
  }
  function renderOverview() {
    var orders = db.orders || [], revenue = orders.reduce(function (s, o) { return s + Number(o.total || 0); }, 0);
    $("metricProducts").textContent = db.products.length;
    $("metricOrders").textContent = orders.length;
    $("metricPending").textContent = orders.filter(function (x) { return (x.status || "pending") === "pending"; }).length;
    $("metricRevenue").textContent = money(revenue);
    $("productBadge").textContent = db.products.length;
    $("orderBadge").textContent = orders.filter(function (x) { return (x.status || "pending") === "pending"; }).length;
    var mini = $("miniOrders");
    if (!orders.length) { mini.innerHTML = "<div class='empty-admin'>// no orders yet<br /><small>you'll see orders here as they come.</small></div>"; return; }
    mini.innerHTML = orders.slice(0, 5).map(function (o) {
      var initials = String(o.name || "?").trim().split(/\s+/).slice(0, 2).map(function (x) { return x.charAt(0); }).join("").toUpperCase() || "?";
      return "<div class='mini-order'><span class='order-avatar'>" + esc(initials) + "</span><div><b>" + esc(o.name) + "</b><small>" + esc(o.id) + " · " + esc(o.date) + "</small></div><strong>" + money(o.total) + "</strong></div>";
    }).join("");
    var profile = $("profileName"); if (profile) profile.textContent = sessionStorage.getItem("major_admin_user") || "admin";
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
    $("adminProductsGrid").innerHTML = list.map(function (p) {
      var cname = (db.categories.find(function (x) { return x.id === p.category; }) || {}).name || "منتج";
      return "<article class='admin-product-card'><div class='admin-product-art' style='background:" + esc(p.color) + "'>" + (p.image ? "<img src='" + esc(p.image) + "' alt='' />" : "<span>" + esc(p.icon) + "</span>") + (p.badge ? "<em>" + esc(p.badge) + "</em>" : "") + "</div><div class='admin-product-body'><small>" + esc(cname) + "</small><h3>" + esc(p.name) + "</h3><p>" + esc(p.description) + "</p><div class='admin-product-meta'><strong>" + money(p.price) + "</strong><span>stock: " + (p.stock || 0) + "</span></div><div class='card-actions'><button class='btn small outline' data-edit-product='" + esc(p.id) + "'>edit</button><button class='icon-danger' data-delete-product='" + esc(p.id) + "'>del</button></div></div></article>";
    }).join("") || "<div class='empty-admin wide'>// no products matching your query.</div>";
  }
  function renderCategories() {
    $("categoryCount").textContent = db.categories.length;
    $("adminCategoriesList").innerHTML = db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      return "<div class='admin-category'><span class='cat-swatch' style='background:" + esc(c.color) + "'>" + esc(c.icon) + "</span><div><b>" + esc(c.name) + "</b><small>" + count + " منتج</small></div><button data-delete-category='" + esc(c.id) + "'>×</button></div>";
    }).join("");
  }
  function renderHomepage() {
    var s = db.settings, stats = s.heroStats || [];
    $("homeBadge").value = s.heroBadge;
    $("homeTitle").value = s.heroTitle;
    $("homeText").value = s.heroText;
    $("homeCta").value = s.heroCta;
    $("homeSecondary").value = s.heroSecondary;
    [1, 2, 3].forEach(function (i) { $("stat" + i + "Value").value = stats[i - 1]?.value || ""; $("stat" + i + "Label").value = stats[i - 1]?.label || ""; });
  }
  function renderSettings() {
    var s = db.settings;
    $("settingBrand").value = s.brand;
    $("settingSubtitle").value = s.brandSubtitle;
    $("settingDesc").value = s.brandDescription || "";
    $("settingFooter").value = s.footerText;
    $("settingPhone").value = s.phone;
    $("settingWhatsapp").value = s.whatsapp;
    $("settingEmail").value = s.email;
    $("settingAddress").value = s.address;
    $("settingDiscord").value = s.discordLink || "";
    $("settingAnnouncementEnabled").checked = s.announcementEnabled;
    $("settingAnnouncement").value = s.announcement;
    $("settingPayments").value = (s.paymentMethods || []).join("\n");
  }
  function renderOrders() {
    var rows = $("ordersTable"), empty = $("ordersEmpty");
    if (!db.orders.length) { rows.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    rows.innerHTML = db.orders.map(function (o) {
      var items = (o.items || []).map(function (x) { return esc(x.name) + " ×" + x.qty; }).join("<br />");
      var status = o.status || "pending";
      var couponTag = o.coupon ? "<small style='color:var(--cyan)'>coupon: " + esc(o.coupon) + "</small>" : "";
      return "<tr><td><b>" + esc(o.id) + "</b><small>" + esc(o.date) + "</small></td><td><b>" + esc(o.name) + "</b><small>" + esc(o.phone) + "</small>" + (o.email ? "<small>" + esc(o.email) + "</small>" : "") + "</td><td>" + esc(o.address) + couponTag + (o.note ? "<small style='color:var(--ink-mid)'>note: " + esc(o.note) + "</small>" : "") + "</td><td><b>" + money(o.total) + "</b>" + (o.coupon ? "<small style='color:var(--cyan)'>from " + money(o.subtotal || 0) + "</small>" : "") + "<small>" + items + "</small></td><td>" + esc(o.payment) + "</td><td><select class='status-select status-" + esc(status) + "' data-order-status='" + esc(o.id) + "'><option value='pending' " + (status === "pending" ? "selected" : "") + ">pending</option><option value='confirmed' " + (status === "confirmed" ? "selected" : "") + ">confirmed</option><option value='shipped' " + (status === "shipped" ? "selected" : "") + ">shipped</option><option value='done' " + (status === "done" ? "selected" : "") + ">delivered</option><option value='cancelled' " + (status === "cancelled" ? "selected" : "") + ">cancelled</option></select></td><td><button class='icon-danger' data-delete-order='" + esc(o.id) + "'>×</button></td></tr>";
    }).join("");
  }
  function renderAll() { db = ElectroDB.load(); renderBrand(); renderOverview(); renderProducts(); renderCategories(); renderHomepage(); renderSettings(); renderOrders(); }
  function openEditor(id) {
    editingId = id || null; var p = id ? db.products.find(function (x) { return x.id === id; }) : null;
    $("editorTitle").textContent = p ? "edit product" : "new product";
    $("productId").value = p ? p.id : "";
    $("productName").value = p ? p.name : "";
    $("productNameEn").value = p ? p.nameEn || "" : "";
    $("productCategory").value = p ? p.category : (db.categories[0] ? db.categories[0].id : "");
    $("productPrice").value = p ? p.price : "";
    $("productOldPrice").value = p ? p.oldPrice || "" : "";
    $("productStock").value = p ? p.stock || 10 : 10;
    $("productIcon").value = p ? p.icon : "✦";
    $("productColor").value = p ? p.color : "#0d2235";
    $("productBadge").value = p ? p.badge || "" : "new";
    $("productDescription").value = p ? p.description : "";
    $("productImage").value = p ? p.image || "" : "";
    $("productSpecs").value = p ? p.specs || "" : "";
    $("productEditor").classList.add("open");
  }
  function closeEditor() { $("productEditor").classList.remove("open"); }
  function setPanel(name) {
    all(".nav-item").forEach(function (x) { x.classList.toggle("active", x.getAttribute("data-panel") === name); });
    all(".admin-panel").forEach(function (x) { x.classList.toggle("active", x.id === "panel-" + name); });
    var nav = document.querySelector("[data-panel='" + name + "']");
    $("pageTitle").textContent = nav ? nav.textContent.replace(/\d+/g, "").trim() : "panel";
    if (window.innerWidth < 1000) $("dashboard").classList.remove("side-open");
  }
  function bind() {
    $("loginForm").onsubmit = function (e) {
      e.preventDefault();
      var u = $("loginUser").value.trim(), pw = $("loginPass").value;
      var stored = ElectroDB.getAdminAuth();
      if (u === stored.user && pw === stored.pass) {
        sessionStorage.setItem("major_admin_v3", "1");
        sessionStorage.setItem("major_admin_user", u);
        logged = true;
        $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
      } else {
        $("loginError").textContent = "// ACCESS DENIED — invalid credentials";
      }
    };
    $("logoutBtn").onclick = function () { sessionStorage.removeItem("major_admin_v3"); sessionStorage.removeItem("major_admin_user"); location.reload(); };
    all(".nav-item").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all("[data-go]").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-go")); }; });
    $("mobileSide").onclick = function () { $("dashboard").classList.toggle("side-open"); };
    $("newProductBtn").onclick = function () { openEditor(); };
    all("[data-close-editor]").forEach(function (x) { x.onclick = closeEditor; });
    $("adminProductSearch").oninput = renderProducts; $("adminProductSort").onchange = renderProducts;
    $("productForm").onsubmit = function (e) {
      e.preventDefault();
      var existing = editingId ? db.products.find(function (p) { return p.id === editingId; }) : null;
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
        specs: $("productSpecs").value.trim() || "",
        rating: existing ? existing.rating || 4.8 : 4.8,
        reviews: existing ? existing.reviews || 0 : 0
      };
      if (!data.name || !(data.price >= 0)) return toast("complete name & price", true);
      var idx = db.products.findIndex(function (p) { return p.id === data.id; });
      if (idx >= 0) db.products[idx] = data; else db.products.unshift(data);
      save(); closeEditor(); renderAll();
      toast(idx >= 0 ? "✓ product updated" : "✓ product added");
    };
    document.addEventListener("click", function (e) {
      var ep = e.target.closest("[data-edit-product]"); if (ep) openEditor(ep.getAttribute("data-edit-product"));
      var dp = e.target.closest("[data-delete-product]");
      if (dp && confirm("delete product?")) { db.products = db.products.filter(function (x) { return x.id !== dp.getAttribute("data-delete-product"); }); save(); renderAll(); toast("✓ product deleted"); }
      var dc = e.target.closest("[data-delete-category]");
      if (dc && confirm("delete category? products inside will remain.")) { db.categories = db.categories.filter(function (x) { return x.id !== dc.getAttribute("data-delete-category"); }); save(); renderAll(); toast("✓ category deleted"); }
      var dord = e.target.closest("[data-delete-order]");
      if (dord && confirm("delete order?")) { db.orders = db.orders.filter(function (x) { return x.id !== dord.getAttribute("data-delete-order"); }); save(); renderAll(); toast("✓ order deleted"); }
    });
    $("categoryForm").onsubmit = function (e) {
      e.preventDefault();
      var n = $("categoryName").value.trim(); if (!n) return;
      db.categories.push({ id: ElectroDB.uid("cat"), name: n, icon: $("categoryIcon").value || "✦", color: $("categoryColor").value });
      save(); e.target.reset(); renderAll(); toast("✓ category added");
    };
    $("homepageForm").onsubmit = function (e) {
      e.preventDefault();
      db.settings.heroBadge = $("homeBadge").value;
      db.settings.heroTitle = $("homeTitle").value;
      db.settings.heroText = $("homeText").value;
      db.settings.heroCta = $("homeCta").value;
      db.settings.heroSecondary = $("homeSecondary").value;
      db.settings.heroStats = [1, 2, 3].map(function (i) { return { value: $("stat" + i + "Value").value, label: $("stat" + i + "Label").value }; });
      save(); renderAll(); $("homeSaved").textContent = "saved"; toast("✓ hero copy updated");
    };
    $("settingsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.brand = $("settingBrand").value;
      s.brandSubtitle = $("settingSubtitle").value;
      s.brandDescription = $("settingDesc").value;
      s.footerText = $("settingFooter").value;
      s.phone = $("settingPhone").value;
      s.whatsapp = $("settingWhatsapp").value;
      s.email = $("settingEmail").value;
      s.address = $("settingAddress").value;
      s.discordLink = $("settingDiscord").value;
      s.announcementEnabled = $("settingAnnouncementEnabled").checked;
      s.announcement = $("settingAnnouncement").value;
      s.paymentMethods = $("settingPayments").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      save(); renderAll(); $("settingsSaved").textContent = "saved"; toast("✓ settings saved");
    };
    $("ordersTable").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-order-status"); if (!id) return;
      var o = db.orders.find(function (x) { return x.id === id; });
      if (o) { o.status = e.target.value; save(); renderAll(); toast("✓ status: " + e.target.value); }
    });
    $("clearOrdersBtn").onclick = function () { if (db.orders.length && confirm("clear ALL orders?")) { db.orders = []; save(); renderAll(); toast("all orders cleared"); } };
  }
  bind();
  if (logged) {
    $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
  } else {
    $("loginScreen").hidden = false;
  }
  window.addEventListener("major-db-updated", renderAll);
})();