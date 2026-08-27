(function () {
  var KEY = "major360_db_v6";

  /* كل البيانات المشتركة (منتجات/طلبات/كوبونات/دفع/إعدادات) على السيرفر.
     localStorage يحتفظ فقط بما هو خاص بهذا المتصفح: دخول الأدمن + المحادثات. */
  var DEFAULT = {
    theme: "light",
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