(function () {
  var KEY = "major360_db_v6";
  var PRODUCTS_KEY = "major360_local_products_v1";

  /* بيانات خاصة بهذا المتصفح.
     المنتجات تُدار محلياً من لوحة التحكم بدون GH_TOKEN أو API. */
  var DEFAULT = {
    theme: "light",
    admins: [{ user: "MAJOR", pass: "yemavava91@@@@@#####" }],
    chats: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        localStorage.setItem(KEY, JSON.stringify(DEFAULT));
        return clone(DEFAULT);
      }
      var db = JSON.parse(raw);
      if (!db.admins || !db.admins.length) db.admins = DEFAULT.admins.slice();
      if (!db.theme) db.theme = DEFAULT.theme;
      if (!Array.isArray(db.chats)) db.chats = [];
      return db;
    } catch (e) {
      return clone(DEFAULT);
    }
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* يرجع null عندما لا توجد نسخة محلية بعد، ومصفوفة حتى لو كانت فارغة */
  function getProducts() {
    try {
      var raw = localStorage.getItem(PRODUCTS_KEY);
      if (raw === null) return null;
      var products = JSON.parse(raw);
      return Array.isArray(products) ? products : null;
    } catch (e) {
      return null;
    }
  }

  function saveProducts(products) {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products || []));
      return true;
    } catch (e) {
      return false;
    }
  }

  window.MajorDB = {
    load: load,
    save: save,
    getProducts: getProducts,
    saveProducts: saveProducts,
    KEY: KEY,
    PRODUCTS_KEY: PRODUCTS_KEY
  };
})();