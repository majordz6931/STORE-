(function () {
  /* =====================================================================
     MAJOR STORE (v3) — إعدادات الاتصال — كلها على Vercel بدون سيرفر
     ---------------------------------------------------------------------
     • API_URL: فارغ "" لأن دوال Vercel على نفس النطاق (/api/*)
     ===================================================================== */
  window.MAJOR_CONFIG = {
    API_URL: ""
  };

  window.MAJOR_API = function (path) {
    var b = (window.MAJOR_CONFIG && window.MAJOR_CONFIG.API_URL) || "";
    return b + path;
  };
})();