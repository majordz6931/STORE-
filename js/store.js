(function () {
  "use strict";

  var DB_KEY = "major_store_db_v1";
  var CART_KEY = "major_store_cart_v1";

  var LOGO_SVG = "<div class=\"logo-frame\" aria-label=\"MAJOR STORE\"><svg class=\"major-logo-svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><g transform=\"translate(50 38)\"><path d=\"M-20 7 C-23 7 -23 -2 -16 -7 L-12 -9 Q-9 -10 -6 -10 L6 -10 Q9 -10 12 -9 L16 -7 C23 -2 23 7 20 7 L13 7 Q8 1 4 1 Q0 1 -4 1 Q-8 1 -13 7 Z\" fill=\"#ff1a3a\"/><rect x=\"-15.5\" y=\"-1\" width=\"9\" height=\"2.2\" fill=\"#fff\" rx=\"0.6\"/><rect x=\"-12\" y=\"-4.5\" width=\"2.2\" height=\"9\" fill=\"#fff\" rx=\"0.6\"/><circle cx=\"9\" cy=\"-2\" r=\"1.7\" fill=\"#fff\"/><circle cx=\"13\" cy=\"0.6\" r=\"1.7\" fill=\"#fff\"/><circle cx=\"9\" cy=\"3.2\" r=\"1.7\" fill=\"#fff\"/><circle cx=\"5\" cy=\"0.6\" r=\"1.7\" fill=\"#fff\"/></g><text x=\"50\" y=\"76\" text-anchor=\"middle\" font-family=\"'Arial Black','Helvetica',sans-serif\" font-size=\"14\" font-weight=\"900\" fill=\"#ff1a3a\" letter-spacing=\"1.6\">MAJOR</text><text x=\"50\" y=\"90\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"4.4\" font-weight=\"700\" fill=\"#cdd2e6\" letter-spacing=\"3\">AM&nbsp;&nbsp;360</text></svg></div>";

  var DEFAULT_DB = {
    settings: {
      brand: "MAJOR STORE",
      brandMark: LOGO_SVG,
      brandSubtitle: "AM 360 GAMES",
      brandDescription: "ألعاب، إكسسوارات gaming، وبطاقات رقمية مختارة لوكلاء اللعب في الجزائر.",
      announcement: "شحن سريع لكل ولايات الجزائر · الدفع عند الاستلام متاح",
      announcementEnabled: true,
      heroBadge: "منصة وكلاءلعاب",
      heroTitle: "ألعاب حقيقية، إكسسوارات أصلية، وأسعار عالية",
      heroText: "MAJOR STORE يختار لك الأدوات واللعب التي يستعملها اللاعبون الحقيقيون. تسليم سريع ودعم قبل وبعد الشراء.",
      heroCta: "تصفح المنتجات",
      heroSecondary: "تواصل معنا",
      heroStats: [
        { value: "24h", label: "تجهيز الطلب" },
        { value: "100%", label: "منتجات مختارة" },
        { value: "4.9/5", label: "رضا اللاعبين" }
      ],
      phone: "+213 770 12 34 56",
      whatsapp: "213770123456",
      email: "hello@majorstore.dz",
      address: "البليدة، الجزائر",
      instagram: "@majorstore.dz",
      footerText: "Gaming أقوى. اختيار أذكى.",
      currency: "دج",
      paymentMethods: ["الدفع عند الاستلام", "CCP / BaridiMob", "بطاقة EDH"]
    },
    categories: [
      { id: "gaming", name: "ألعاب", icon: "🎮", color: "#ffe1ea" },
      { id: "consoles", name: "أجهزةPlayStation", icon: "🕹️", color: "#e6e4ff" },
      { id: "cards", name: "بطاقات رقمية", icon: "🎁", color: "#dff8f2" },
      { id: "accessories", name: "إكسسوارات الألعاب", icon: "🎧", color: "#fff0d8" },
      { id: "accounts", name: "حسابات واشتراكات", icon: "👤", color: "#e1eaff" }
    ],
    products: [
      { id: "p1", category: "gaming", name: "FIFA 25 – PS5", nameEn: "FIFA 25 PS5", price: 7800, oldPrice: 8900, badge: "الأكثر مبيعاً", icon: "⚽", color: "#ffe1ea", rating: 4.9, reviews: 312, description: "نسخة الديجيتال الأصلية مع كود التفعيل المباشر على حسابك.", stock: 18 },
      { id: "p2", category: "consoles", name: "PlayStation 5 Slim", nameEn: "PS5 Slim Console", price: 89000, oldPrice: 0, badge: "الأحدث", icon: "🕹️", color: "#e6e4ff", rating: 4.9, reviews: 88, description: "النسخة Slim من PS5 مع يد إضافية ونسخة ألعاب GTA V مدمجة.", stock: 4 },
      { id: "p3", category: "gaming", name: "GTA V – PS5 Premium", nameEn: "GTA V Premium PS5", price: 6500, oldPrice: 7400, badge: "عرض اليوم", icon: "🚗", color: "#fff0d8", rating: 4.8, reviews: 219, description: "النسخة الكاملة كود رقمي جاهز على PlayStation Network.", stock: 22 },
      { id: "p4", category: "accessories", name: "يد DualSense أبيض", nameEn: "DualSense White Controller", price: 9800, oldPrice: 11000, badge: "طلب مرتفع", icon: "🎮", color: "#dff8f2", rating: 4.8, reviews: 154, description: "يد PlayStation 5 الأصلية بلون أبيض لمسي مع تقنية Haptic.", stock: 11 },
      { id: "p5", category: "accessories", name: "سماعة HyperX Cloud III", nameEn: "HyperX Cloud III Headset", price: 11500, oldPrice: 0, badge: "للاعب المحترف", icon: "🎧", color: "#e1eaff", rating: 4.9, reviews: 67, description: "صوت محيطي 7.1 ومايكروفون قابل للفصل مع راحة طويلة.", stock: 9 },
      { id: "p6", category: "cards", name: "بطاقةPSN 100$", nameEn: "PSN Card $100", price: 14500, oldPrice: 0, badge: "هدية", icon: "🎁", color: "#ffe1ea", rating: 4.7, reviews: 410, description: "بطاقة رصيد PlayStation Network جاهزة للاستعمال فوراً.", stock: 47 },
      { id: "p7", category: "accounts", name: "اشتراك PlayStation Plus سنوي", nameEn: "PS Plus 12 Months", price: 8900, oldPrice: 9800, badge: "أونلاين", icon: "👑", color: "#e6e4ff", rating: 4.8, reviews: 231, description: "اشتراك سنوي يفعّل اللعب الجماعي واللعاب المجانية الشهرية.", stock: 35 },
      { id: "p8", category: "gaming", name: "لعبة Call of Duty Black Ops 6", nameEn: "Black Ops 6 PS5", price: 8200, oldPrice: 9500, badge: "جديد", icon: "🎯", color: "#ffeaef", rating: 4.7, reviews: 58, description: "أحدث ألعاب الإطلاق بمناورات وطور جماعي مدفوع.", stock: 14 }
    ],
    coupons: [
      { code: "WELCOME10", type: "percent", value: 10, active: true },
      { code: "MAJOR500", type: "fixed", value: 500, active: true }
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
      var merged = merge(DEFAULT_DB, JSON.parse(raw));
      // Always restore the logo SVG (in case it was overwritten)
      merged.settings.brandMark = LOGO_SVG;
      return merged;
    } catch (e) {
      return clone(DEFAULT_DB);
    }
  }

  function save(db) {
    try {
      // Don't persist the heavy SVG markup in the DB
      var snapshot = clone(db);
      if (snapshot.settings) snapshot.settings.brandMark = "";
      localStorage.setItem(DB_KEY, JSON.stringify(snapshot));
      window.dispatchEvent(new CustomEvent("major-db-updated"));
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
  function getLogo() { return LOGO_SVG; }
  function getDefault() { return clone(DEFAULT_DB); }

  window.ElectroDB = {
    KEY: DB_KEY,
    load: load,
    save: save,
    loadCart: loadCart,
    saveCart: saveCart,
    uid: uid,
    formatMoney: formatMoney,
    getLogo: getLogo,
    getDefault: getDefault
  };
})();