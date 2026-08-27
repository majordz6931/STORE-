(function () {
  "use strict";

  var DB_KEY = "nova_electronics_store_v1";
  var CART_KEY = "nova_electronics_cart_v1";

  var DEFAULT_DB = {
    settings: {
      brand: "NOVA TECH",
      brandMark: "N",
      announcement: "شحن مجاني للطلبات فوق 25,000 دج — لفترة محدودة",
      announcementEnabled: true,
      heroBadge: "تقنية مختارة بعناية",
      heroTitle: "كل ما تحتاجه من التقنية، في مكان واحد",
      heroText: "أدوات إلكترونية أصلية، إكسسوارات ذكية، وتجربة شراء سهلة مع دعم حقيقي قبل وبعد الطلب.",
      heroCta: "اكتشف المنتجات",
      heroSecondary: "لماذا نوفا؟",
      heroStats: [
        { value: "24h", label: "تجهيز سريع" },
        { value: "100%", label: "منتجات مختارة" },
        { value: "4.9/5", label: "رضا العملاء" }
      ],
      phone: "+213 555 123 456",
      whatsapp: "213555123456",
      email: "hello@novatech.store",
      address: "الجزائر العاصمة، الجزائر",
      instagram: "@novatech.dz",
      footerText: "تقنية أفضل. اختيار أذكى.",
      currency: "دج",
      primary: "#635bff",
      accent: "#13b89f",
      paymentMethods: ["الدفع عند الاستلام", "تحويل بريدي CCP", "BaridiMob"]
    },
    categories: [
      { id: "audio", name: "الصوتيات", icon: "🎧", color: "#e8e7ff" },
      { id: "smart", name: "أجهزة ذكية", icon: "⌚", color: "#dff8f2" },
      { id: "desk", name: "المكتب والعمل", icon: "🖥️", color: "#fff0d8" },
      { id: "gaming", name: "الألعاب", icon: "🎮", color: "#ffe1ea" },
      { id: "accessories", name: "إكسسوارات", icon: "🔌", color: "#e1efff" }
    ],
    products: [
      { id: "p1", category: "audio", name: "سماعات Wave Pro", nameEn: "Wave Pro Headphones", price: 12900, oldPrice: 15900, badge: "الأكثر مبيعاً", icon: "🎧", color: "#e7e5ff", rating: 4.9, reviews: 124, description: "عزل ضوضاء نشط وصوت غامر ببطارية تدوم 35 ساعة.", stock: 18 },
      { id: "p2", category: "desk", name: "لوحة مفاتيح Nova 75", nameEn: "Nova 75 Keyboard", price: 9800, oldPrice: 0, badge: "جديد", icon: "⌨️", color: "#e2f1ff", rating: 4.8, reviews: 67, description: "لوحة ميكانيكية مريحة بإضاءة RGB واتصال لاسلكي.", stock: 12 },
      { id: "p3", category: "smart", name: "ساعة Pulse S2", nameEn: "Pulse S2 Smartwatch", price: 17500, oldPrice: 19900, badge: "عرض اليوم", icon: "⌚", color: "#dff8f1", rating: 4.7, reviews: 89, description: "تتبع الصحة والرياضة مع شاشة AMOLED مقاومة للماء.", stock: 9 },
      { id: "p4", category: "gaming", name: "وحدة تحكم Flux", nameEn: "Flux Gamepad", price: 7600, oldPrice: 0, badge: "اختيارنا", icon: "🎮", color: "#ffe4ed", rating: 4.9, reviews: 53, description: "تحكم دقيق واستجابة سريعة للألعاب على الكمبيوتر والهاتف.", stock: 25 },
      { id: "p5", category: "accessories", name: "شاحن GaN 65W", nameEn: "65W GaN Charger", price: 5400, oldPrice: 6200, badge: "سريع", icon: "⚡", color: "#fff0d8", rating: 4.8, reviews: 211, description: "شاحن صغير وقوي لشحن الهاتف واللابتوب في نفس الوقت.", stock: 40 },
      { id: "p6", category: "desk", name: "كاميرا Desk Cam 4K", nameEn: "Desk Cam 4K", price: 14900, oldPrice: 0, badge: "للعمل", icon: "📷", color: "#e9e4ff", rating: 4.6, reviews: 38, description: "صورة 4K واضحة للاجتماعات والبث وصناعة المحتوى.", stock: 7 },
      { id: "p7", category: "audio", name: "سماعة Mini Buds", nameEn: "Mini Buds", price: 6900, oldPrice: 7900, badge: "خفيفة", icon: "🎵", color: "#e1f7f3", rating: 4.7, reviews: 96, description: "سماعات لاسلكية صغيرة بصوت متوازن وعلبة شحن أنيقة.", stock: 31 },
      { id: "p8", category: "accessories", name: "Hub متعدد المنافذ", nameEn: "Multiport USB Hub", price: 6300, oldPrice: 0, badge: "عملي", icon: "🔗", color: "#e9efff", rating: 4.8, reviews: 74, description: "حوّل منفذ USB-C إلى HDMI وUSB وقراءة بطاقات.", stock: 16 }
    ],
    coupons: [
      { code: "WELCOME10", type: "percent", value: 10, active: true },
      { code: "NOVA500", type: "fixed", value: 500, active: true }
    ],
    orders: []
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function merge(base, saved) {
    var result = clone(base);
    if (!saved || typeof saved !== "object") return result;
    Object.keys(saved).forEach(function (key) {
      if (Array.isArray(saved[key])) result[key] = saved[key];
      else if (saved[key] && typeof saved[key] === "object" && result[key] && typeof result[key] === "object") {
        result[key] = Object.assign({}, result[key], saved[key]);
      } else if (saved[key] !== undefined) result[key] = saved[key];
    });
    return result;
  }

  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        var fresh = clone(DEFAULT_DB);
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return merge(DEFAULT_DB, JSON.parse(raw));
    } catch (e) {
      return clone(DEFAULT_DB);
    }
  }

  function save(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      window.dispatchEvent(new CustomEvent("nova-db-updated"));
      return true;
    } catch (e) { return false; }
  }

  function loadCart() {
    try {
      var value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (e) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); return true; } catch (e) { return false; }
  }

  function uid(prefix) { return (prefix || "id") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function formatMoney(amount, currency) { return Number(amount || 0).toLocaleString("ar-DZ") + " " + (currency || "دج"); }
  function getDefault() { return clone(DEFAULT_DB); }

  window.ElectroDB = {
    KEY: DB_KEY,
    load: load,
    save: save,
    loadCart: loadCart,
    saveCart: saveCart,
    uid: uid,
    formatMoney: formatMoney,
    getDefault: getDefault
  };
})();