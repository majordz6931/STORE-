(function () {
  var KEY = "major360_db_v5";

  /* Local-only DB. Products, payments, orders, coupons and site settings
     are now shared through the server (single source of truth).
     localStorage only keeps what is private to this browser:
       - admin login (admins are kept local for simple auth)
       - theme preference
       - chat threads for this browser (user side)
     The storefront cart lives in its own key: major360_cart. */
  var DEFAULT = {
    theme: "dark",
    admins: [{ user: "MAJOR", pass: "yemavava91@@@@@#####" }],
    chats: []
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        localStorage.setItem(KEY, JSON.stringify(DEFAULT));
        return JSON.parse(JSON.stringify(DEFAULT));
      }
      var db = JSON.parse(raw);
      if (!db.admins || !db.admins.length) db.admins = DEFAULT.admins.slice();
      if (!db.theme) db.theme = DEFAULT.theme;
      if (!Array.isArray(db.chats)) db.chats = [];
      // Drop legacy shared fields that are now server-owned; keep admins/chats only.
      ["products", "payMethods", "orders", "coupons", "discord", "whatsapp", "whatsappMsg",
       "announcement", "announcementEn", "wallet", "network"].forEach(function (k) {
        delete db[k];
      });
      return db;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT));
    }
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  window.MajorDB = { load: load, save: save, KEY: KEY };
})();