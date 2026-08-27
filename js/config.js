(function () {
  /* =====================================================================
     نقطة الاتصال بالسيرفر — MAJOR STORE
     ---------------------------------------------------------------------
     • في التطوير المحلي (المعاينة الحية) اتـرك API_URL فارغاً "" :
       المتجر واللوحة والسيرفر كلهم على نفس الأصل → يعمل تلقائياً.
     • بعد نشر السيرفر على Render أو Railway، ضع رابطه هنا بدون "/" نهائي:
         مثال:  "https://major-store-server.onrender.com"
     وارفع الملفات الثابتة على Vercel. كل شي يصير متصل.
     ===================================================================== */
  window.MAJOR_CONFIG = {
    API_URL: ""
  };

  /* نبني رابط الطلب: نسبي لو فارغ، وكامل لو مضبوط */
  window.MAJOR_API = function (path) {
    var base = (window.MAJOR_CONFIG && window.MAJOR_CONFIG.API_URL) || "";
    return base + path;
  };

  /* رابط Socket.IO: undefined = نفس الأصل (يشتغل محلياً)، وكامل لو مضبوط */
  window.MAJOR_SOCKET_URL = function () {
    var base = (window.MAJOR_CONFIG && window.MAJOR_CONFIG.API_URL) || "";
    return base || undefined;
  };
})();