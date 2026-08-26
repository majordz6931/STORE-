(function () {
  var session = sessionStorage.getItem("major360_admin");
  var db = MajorDB.load();

  function $(id) { return document.getElementById(id); }
  function t(k) { return MajorI18n.t(k); }

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
    renderAll();
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

  var activeChat = "";

  function renderAll() {
    db = MajorDB.load();
    $("discordUrl").value = db.discord;
    renderProducts();
    renderAdmins();
    renderOrders();
    renderChats();
  }

  function renderProducts() {
    $("pCount").textContent = db.products.length;
    $("productTable").innerHTML = db.products.map(function (p) {
      var n = (MajorI18n.getLang() === "en" ? (p.nameEn || p.name) : p.name);
      return "<tr><td>" + p.emoji + "</td><td>" + n + "</td><td>" + p.cat + "</td><td>" + p.price +
        '</td><td><button class="danger" data-del="' + p.id + '">' + t("del") + "</button></td></tr>";
    }).join("");
  }

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
      desc: $("pdesc").value.trim(),
      descEn: $("pdescEn").value.trim()
    });
    MajorDB.save(db);
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
      return "<tr><td>" + (o.at || "") + "</td><td>" + (o.name || "") +
        "</td><td>" + (o.contact || o.phone || "") + "<br>" + (o.country || "") +
        "</td><td>" + items + "</td><td>$" + Number(o.total).toFixed(2) + "</td><td>" + shot + "</td></tr>";
    }).join("") || '<tr><td colspan="6">' + t("noOrders") + "</td></tr>";
  }

  $("orderTable").addEventListener("click", function (e) {
    if (e.target.tagName === "IMG" && e.target.src) {
      window.open(e.target.src, "_blank");
    }
  });
})();
