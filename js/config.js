(function () {
  /* =====================================================================
     MAJOR STORE — نقطة الاتصال بالسيرفر
     ---------------------------------------------------------------------
     • محلياً (المعاينة الحية): اترك API_URL = ""  → كل شي على نفس الأصل.
     • بعد نشر السيرفر (Render/Railway): ضع رابطه هنا بدون `/` نهائي:
         window.MAJOR_CONFIG = { API_URL: "https://major-store.onrender.com" }
     والواجهة (Vercel) تتصل به تلقائياً.
     ===================================================================== */
  window.MAJOR_CONFIG = {
    API_URL: ""
  };

  window.MAJOR_API = function (path) {
    var base = (window.MAJOR_CONFIG && window.MAJOR_CONFIG.API_URL) || "";
    return base + path;
  };

  window.MAJOR_SOCKET_URL = function () {
    var base = (window.MAJOR_CONFIG && window.MAJOR_CONFIG.API_URL) || "";
    return base || undefined;
  };
})();