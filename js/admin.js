(function () {
  "use strict";
  var logged = sessionStorage.getItem("major_admin_v4") === "1";
  var db = ElectroDB.load();
  var editingId = null;
  var $ = function (id) { return document.getElementById(id); };
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m]; }); }
  function money(n) { return ElectroDB.formatMoney(n); }
  function save() { ElectroDB.save(db); }
  function toast(msg, bad) {
    var e = $("adminToast"); e.textContent = msg; e.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove("show"); }, 2400);
  }
  function renderBrand() {
    var mark = ElectroDB.getLogo();
    $("loginMark").innerHTML = mark;
    $("sideMark").innerHTML = mark;
    $("langSwitch").innerHTML = "<span>" + (ElectroDB.getLang() === "ar" ? "EN" : "AR") + "</span>";
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
    if (!orders.length) { mini.innerHTML = "<div class='empty-admin'>// no orders yet<br /><small>you'll see orders here as they arrive.</small></div>"; return; }
    mini.innerHTML = orders.slice(0, 5).map(function (o) {
      var initials = String(o.name || "?").trim().split(/\s+/).slice(0, 2).map(function (x) { return x.charAt(0); }).join("").toUpperCase() || "?";
      return "<div class='mini-order'><span class='order-avatar'>" + esc(initials) + "</span><div><b>" + esc(o.name) + "</b><small>" + esc(o.id) + " · " + esc(o.date) + "</small></div><strong>" + money(o.total) + "</strong></div>";
    }).join("");
    var profile = $("profileName"); if (profile) profile.textContent = sessionStorage.getItem("major_admin_user") || "admin";
  }
  function renderProductCategoriesAdmin() {
    $("productCategory").innerHTML = db.categories.map(function (c) {
      var label = (ElectroDB.localize(c.name) || "");
      return "<option value='" + esc(c.id) + "'>" + esc(c.icon) + " " + esc(label) + "</option>";
    }).join("");
  }
  function renderProducts() {
    renderProductCategoriesAdmin();
    var q = $("adminProductSearch").value.toLowerCase().trim(), m = $("adminProductSort").value;
    var list = db.products.filter(function (p) {
      var ar = (p.name && p.name.ar) || "", en = (p.name && p.name.en) || "", desc = "";
      if (p.description) desc = (p.description.ar || "") + " " + (p.description.en || "");
      return !q || (ar + " " + en + " " + desc).toLowerCase().indexOf(q) >= 0;
    });
    if (m === "low") list.sort(function (a, b) { return a.price - b.price; });
    if (m === "high") list.sort(function (a, b) { return b.price - a.price; });
    $("adminProductsGrid").innerHTML = list.map(function (p) {
      var name = ElectroDB.localize(p.name);
      var cname = ElectroDB.localize((db.categories.find(function (x) { return x.id === p.category; }) || {}).name);
      return "<article class='admin-product-card'><div class='admin-product-art' style='background:" + esc(p.color) + "'>" + (p.image ? "<img src='" + esc(p.image) + "' alt='' />" : "<span>" + esc(p.icon) + "</span>") + (p.badge ? "<em>" + esc(ElectroDB.localize(p.badge)) + "</em>" : "") + "</div><div class='admin-product-body'><small>" + esc(cname) + "</small><h3>" + esc(name) + "</h3><p>" + esc(ElectroDB.localize(p.description).slice(0, 100)) + "</p><div class='admin-product-meta'><strong>" + money(p.price) + "</strong><span>stock: " + (p.stock || 0) + "</span></div><div class='card-actions'><button class='btn small outline' data-edit-product='" + esc(p.id) + "'>edit</button><button class='icon-danger' data-delete-product='" + esc(p.id) + "'>del</button></div></div></article>";
    }).join("") || "<div class='empty-admin wide'>// no products matching your query.</div>";
  }
  function renderCategories() {
    $("categoryCount").textContent = db.categories.length;
    $("adminCategoriesList").innerHTML = db.categories.map(function (c) {
      var count = db.products.filter(function (p) { return p.category === c.id; }).length;
      var label = ElectroDB.localize(c.name);
      return "<div class='admin-category'><span class='cat-swatch' style='background:" + esc(c.color) + "'>" + esc(c.icon) + "</span><div><b>" + esc(label) + "</b><small>" + count + " منتج</small></div><button data-delete-category='" + esc(c.id) + "'>×</button></div>";
    }).join("");
  }
  function renderHomepage() {
    var s = db.settings;
    $("homeBadge").value = s.heroBadge.ar || "";
    $("homeTitle").value = s.heroTitle.ar || "";
    $("homeText").value = s.heroText.ar || "";
    $("homeCta").value = s.heroCta.ar || "";
    $("homeSecondary").value = s.heroSecondary.ar || "";
    $("homeBadgeEn").value = s.heroBadge.en || "";
    $("homeTitleEn").value = s.heroTitle.en || "";
    $("homeTextEn").value = s.heroText.en || "";
    $("homeCtaEn").value = s.heroCta.en || "";
    $("homeSecondaryEn").value = s.heroSecondary.en || "";
  }
  function renderSettings() {
    var s = db.settings;
    $("settingBrand").value = s.brand;
    $("settingSubAR").value = (s.brandSubtitle && s.brandSubtitle.ar) || "";
    $("settingSubEN").value = (s.brandSubtitle && s.brandSubtitle.en) || "";
    $("settingFooterAR").value = (s.footerText && s.footerText.ar) || "";
    $("settingFooterEN").value = (s.footerText && s.footerText.en) || "";
    $("settingPhone").value = s.phone;
    $("settingWhatsapp").value = s.whatsapp;
    $("settingEmail").value = s.email;
    $("settingAddrAR").value = (s.address && s.address.ar) || "";
    $("settingAddrEN").value = (s.address && s.address.en) || "";
    $("settingDiscord").value = s.discordLink || "";
    $("settingAnnouncementEnabled").checked = s.announcementEnabled;
    $("settingAnnouncementAR").value = (s.announcement && s.announcement.ar) || "";
    $("settingAnnouncementEN").value = (s.announcement && s.announcement.en) || "";
  }
  function renderPayments() {
    $("paymentMethods").value = (db.settings.paymentMethods || []).join("\n");
  }
  function renderOrders() {
    var rows = $("ordersTable"), empty = $("ordersEmpty");
    if (!db.orders.length) { rows.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    rows.innerHTML = db.orders.map(function (o) {
      var items = (o.items || []).map(function (x) { return esc(ElectroDB.localize(x.name)) + " ×" + x.qty; }).join("<br />");
      var status = o.status || "pending";
      var couponTag = o.coupon ? "<small style='color:var(--cyan)'>coupon: " + esc(o.coupon) + "</small>" : "";
      return "<tr><td><b>" + esc(o.id) + "</b><small>" + esc(o.date) + "</small></td><td><b>" + esc(o.name) + "</b><small>" + esc(o.phone) + "</small>" + (o.email ? "<small>" + esc(o.email) + "</small>" : "") + "</td><td>" + esc(o.address) + couponTag + (o.note ? "<small style='color:var(--ink-mid)'>note: " + esc(o.note) + "</small>" : "") + "</td><td><b>" + money(o.total) + "</b>" + (o.coupon ? "<small style='color:var(--cyan)'>from " + money(o.subtotal || 0) + "</small>" : "") + "<small>" + items + "</small></td><td>" + esc(o.payment) + "</td><td><select class='status-select status-" + esc(status) + "' data-order-status='" + esc(o.id) + "'><option value='pending' " + (status === "pending" ? "selected" : "") + ">pending</option><option value='confirmed' " + (status === "confirmed" ? "selected" : "") + ">confirmed</option><option value='shipped' " + (status === "shipped" ? "selected" : "") + ">shipped</option><option value='done' " + (status === "done" ? "selected" : "") + ">delivered</option><option value='cancelled' " + (status === "cancelled" ? "selected" : "") + ">cancelled</option></select></td><td><button class='icon-danger' data-delete-order='" + esc(o.id) + "'>×</button></td></tr>";
    }).join("");
  }

  function renderAll() {
    db = ElectroDB.load();
    renderBrand(); renderOverview(); renderProducts(); renderCategories();
    renderHomepage(); renderSettings(); renderPayments(); renderOrders();
  }

  function openEditor(id) {
    editingId = id || null; var p = id ? db.products.find(function (x) { return x.id === id; }) : null;
    $("editorTitle").textContent = p ? "edit product" : "new product";
    $("productId").value = p ? p.id : "";
    $("productNameAR").value = p && p.name ? (p.name.ar || "") : "";
    $("productNameEN").value = p && p.name ? (p.name.en || "") : "";
    $("productSpecsAR").value = p && p.specs ? (p.specs.ar || "") : "";
    $("productSpecsEN").value = p && p.specs ? (p.specs.en || "") : "";
    $("productCategory").value = p ? p.category : (db.categories[0] ? db.categories[0].id : "");
    $("productPrice").value = p ? p.price : "";
    $("productOldPrice").value = p ? p.oldPrice || "" : "";
    $("productStock").value = p ? p.stock || 10 : 10;
    $("productIcon").value = p ? p.icon : "✦";
    $("productColor").value = p ? p.color : "#0d2235";
    $("productBadgeAR").value = p && p.badge ? (p.badge.ar || "") : "";
    $("productBadgeEN").value = p && p.badge ? (p.badge.en || "") : "";
    $("productDescriptionAR").value = p && p.description ? (p.description.ar || "") : "";
    $("productDescriptionEN").value = p && p.description ? (p.description.en || "") : "";
    $("productImage").value = p ? p.image || "" : "";
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
        sessionStorage.setItem("major_admin_v4", "1");
        sessionStorage.setItem("major_admin_user", u);
        logged = true;
        $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
      } else $("loginError").textContent = "// ACCESS DENIED — invalid credentials";
    };
    $("logoutBtn").onclick = function () { sessionStorage.removeItem("major_admin_v4"); sessionStorage.removeItem("major_admin_user"); location.reload(); };
    all(".nav-item").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-panel")); }; });
    all("[data-go]").forEach(function (x) { x.onclick = function () { setPanel(x.getAttribute("data-go")); }; });
    $("mobileSide").onclick = function () { $("dashboard").classList.toggle("side-open"); };
    $("newProductBtn").onclick = function () { openEditor(); };
    all("[data-close-editor]").forEach(function (x) { x.onclick = closeEditor; });
    $("adminProductSearch").oninput = renderProducts; $("adminProductSort").onchange = renderProducts;

    $("productForm").onsubmit = function (e) {
      e.preventDefault();
      var existing = editingId ? db.products.find(function (p) { return p.id === editingId; }) : null;
      var price = Number(($("productPrice").value || "0").replace(",", "."));
      var oldp = Number(($("productOldPrice").value || "0").replace(",", ".")) || 0;
      var stock = Number($("productStock").value) || 0;
      if (!price || price < 0) return toast("complete price (USD)", true);
      if (!$("productNameAR").value.trim() && !$("productNameEN").value.trim()) return toast("complete name", true);
      var data = {
        id: editingId || ElectroDB.uid("p"),
        category: $("productCategory").value,
        name: { ar: $("productNameAR").value.trim(), en: $("productNameEN").value.trim() || $("productNameAR").value.trim() },
        specs: { ar: $("productSpecsAR").value.trim(), en: $("productSpecsEN").value.trim() },
        price: price,
        oldPrice: oldp,
        stock: stock,
        icon: $("productIcon").value || "✦",
        color: $("productColor").value,
        badge: { ar: $("productBadgeAR").value.trim(), en: $("productBadgeEN").value.trim() },
        description: {
          ar: $("productDescriptionAR").value.trim() || $("productDescriptionEN").value.trim(),
          en: $("productDescriptionEN").value.trim() || $("productDescriptionAR").value.trim()
        },
        image: $("productImage").value.trim(),
        rating: existing ? existing.rating || 4.8 : 4.8,
        reviews: existing ? existing.reviews || 0 : 0
      };
      var idx = db.products.findIndex(function (p) { return p.id === data.id; });
      if (idx >= 0) db.products[idx] = data; else db.products.unshift(data);
      save(); closeEditor(); renderAll();
      toast(idx >= 0 ? "✓ product updated ($" + price.toFixed(2) + ")" : "✓ product added");
    };

    document.addEventListener("click", function (e) {
      var ep = e.target.closest("[data-edit-product]"); if (ep) openEditor(ep.getAttribute("data-edit-product"));
      var dp = e.target.closest("[data-delete-product]");
      if (dp && confirm("delete product?")) { db.products = db.products.filter(function (x) { return x.id !== dp.getAttribute("data-delete-product"); }); save(); renderAll(); toast("✓ product deleted"); }
      var dc = e.target.closest("[data-delete-category]");
      if (dc && confirm("delete category?")) { db.categories = db.categories.filter(function (x) { return x.id !== dc.getAttribute("data-delete-category"); }); save(); renderAll(); toast("✓ category deleted"); }
      var dord = e.target.closest("[data-delete-order]");
      if (dord && confirm("delete order?")) { db.orders = db.orders.filter(function (x) { return x.id !== dord.getAttribute("data-delete-order"); }); save(); renderAll(); toast("✓ order deleted"); }
    });

    $("categoryForm").onsubmit = function (e) {
      e.preventDefault();
      var n = $("categoryName").value.trim(); if (!n) return;
      db.categories.push({
        id: ElectroDB.uid("cat"),
        name: { ar: n, en: n },
        icon: $("categoryIcon").value || "✦",
        color: $("categoryColor").value
      });
      save(); e.target.reset(); renderAll(); toast("✓ category added");
    };

    $("paymentForm").onsubmit = function (e) {
      e.preventDefault();
      var list = ($("paymentMethods").value || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (!list.length) return toast("add at least one payment method", true);
      db.settings.paymentMethods = list;
      save(); renderAll(); $("paymentsSaved").textContent = "saved"; toast("✓ " + list.length + " payment methods saved");
    };

    $("homepageForm").onsubmit = function (e) {
      e.preventDefault();
      db.settings.heroBadge = { ar: $("homeBadge").value, en: $("homeBadgeEn").value };
      db.settings.heroTitle = { ar: $("homeTitle").value, en: $("homeTitleEn").value };
      db.settings.heroText = { ar: $("homeText").value, en: $("homeTextEn").value };
      db.settings.heroCta = { ar: $("homeCta").value, en: $("homeCtaEn").value };
      db.settings.heroSecondary = { ar: $("homeSecondary").value, en: $("homeSecondaryEn").value };
      save(); renderAll(); $("homeSaved").textContent = "saved"; toast("✓ homepage copy saved (AR + EN)");
    };

    $("settingsForm").onsubmit = function (e) {
      e.preventDefault();
      var s = db.settings;
      s.brand = $("settingBrand").value;
      s.brandSubtitle = { ar: $("settingSubAR").value, en: $("settingSubEN").value };
      s.footerText = { ar: $("settingFooterAR").value, en: $("settingFooterEN").value };
      s.phone = $("settingPhone").value;
      s.whatsapp = $("settingWhatsapp").value;
      s.email = $("settingEmail").value;
      s.address = { ar: $("settingAddrAR").value, en: $("settingAddrEN").value };
      s.discordLink = $("settingDiscord").value;
      s.announcementEnabled = $("settingAnnouncementEnabled").checked;
      s.announcement = { ar: $("settingAnnouncementAR").value, en: $("settingAnnouncementEN").value };
      save(); renderAll(); $("settingsSaved").textContent = "saved"; toast("✓ settings saved");
    };

    $("ordersTable").addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-order-status"); if (!id) return;
      var o = db.orders.find(function (x) { return x.id === id; });
      if (o) { o.status = e.target.value; save(); renderAll(); toast("✓ status: " + e.target.value); }
    });
    $("clearOrdersBtn").onclick = function () { if (db.orders.length && confirm("clear ALL orders?")) { db.orders = []; save(); renderAll(); toast("all orders cleared"); } };
    $("langSwitch").onclick = function () { ElectroDB.setLang(ElectroDB.getLang() === "ar" ? "en" : "ar"); };
  }
  bind();
  if (logged) {
    $("loginScreen").hidden = true; $("dashboard").hidden = false; renderAll();
  } else {
    $("loginScreen").hidden = false;
  }
  window.addEventListener("major-db-updated", renderAll);
  window.addEventListener("major-lang-changed", function () {
    renderBrand(); renderCategories(); renderHomepage(); renderSettings();
  });
})();