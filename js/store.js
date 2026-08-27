(function () {
  "use strict";

  var DB_KEY = "major_cyber_db_v3";
  var CART_KEY = "major_cyber_cart_v3";

  /* الشعار الدائري مع الحلقة اللونية المتغيرة باستمرار */
  var LOGO_SVG = "<div class='logo-frame'><svg class='major-logo-svg' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='majorGlow' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#22ffb5'/><stop offset='1' stop-color='#00d4ff'/></linearGradient></defs><circle cx='50' cy='50' r='34' fill='none' stroke='url(#majorGlow)' stroke-width='2'/><circle cx='50' cy='50' r='28' fill='#0b1322'/><g stroke='#22ffb5' stroke-width='2' fill='none' stroke-linecap='round'><path d='M50 26 L74 40 L74 60 Q74 70 50 78 Q26 70 26 60 L26 40 Z'/></g><circle cx='40' cy='46' r='2.6' fill='#22ffb5'/><circle cx='60' cy='46' r='2.6' fill='#22ffb5'/><path d='M42 56 Q50 62 58 56' stroke='#22ffb5' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M30 84 L26 96 M50 86 L50 98 M70 84 L74 96' stroke='#22ffb5' stroke-width='2'/><text x='50' y='108' text-anchor='middle' font-family='Consolas,monospace' font-size='6' font-weight='700' fill='#22ffb5' letter-spacing='3'>CYBER&#160;TOOLS</text></svg></div>";

  var DEFAULT_DB = {
    settings: {
      brand: "MAJOR CYBER",
      brandSubtitle: "TOOLS · EXPLOITS · LABS",
      brandDescription: "متجر متخصص في أدوات الأمن السيبراني، توزيعات لينكس للاختبار، برامج اختراق، وكتب تعليمية للمحترفين والطلاب.",
      announcement: "⚡ دورة كاملة للاختراق الأخلاقي متاحة الآن — خصم 30% لفترة محدودة",
      announcementEnabled: true,
      heroBadge: "Ethical Hacking · Penetration Testing",
      heroTitle: "أدوات الاختراق الأخلاقي وبرامج الأمن السيبراني",
      heroText: "توزيعات لينكس احترافية، أدوات اختبار الاختراق، بيئات تدريب افتراضية، وكتب منهجية للمحترفين والطلاب.",
      heroCta: "تصفح الأدوات",
      heroSecondary: "انضم للديسكورد",
      heroStats: [
        { value: "500+", label: "عميل محترف" },
        { value: "99.9%", label: "ضمان المنتجات" },
        { value: "24/7", label: "دعم تقني" }
      ],
      phone: "+213 770 12 34 56",
      whatsapp: "213770123456",
      email: "support@majorcyber.store",
      address: "الجزائر",
      instagram: "@majorcyber.dz",
      footerText: "Cybersecurity tools for professionals.",
      currency: "دج",
      paymentMethods: ["USDT (TRC20)", "Bitcoin (BTC)", "الدفع عند الاستلام", "BaridiMob"],
      discordLink: "https://discord.gg/WrK7ttvq5g"
    },
    adminAuth: { user: "admin", pass: "yemavava91@@@@@#####" },
    categories: [
      { id: "distros",  name: "توزيعات لينكس", icon: "🐧", color: "#0a2a1f" },
      { id: "wireless", name: "أدوات WiFi والشبكة", icon: "📡", color: "#0d2438" },
      { id: "web",     name: "اختبار تطبيقات الويب", icon: "🌐", color: "#1a0d35" },
      { id: "exploit", name: "إطارات عمل الاختراق", icon: "💀", color: "#2a0a1a" },
      { id: "courses", name: "دورات وكتب", icon: "📚", color: "#1d2611" },
      { id: "malware", name: "تحليل البرمجيات الخبيثة", icon: "🦠", color: "#231510" },
      { id: "osint",   name: "أدوات OSINT", icon: "🔍", color: "#0e1d2a" },
      { id: "tools",   name: "برامج مساعدة", icon: "🛠️", color: "#1a1a0d" }
    ],
    products: [
      { id: "p1", category: "distros", name: "Kali Linux Pro 2026 (Pre-configured)", price: 2500, oldPrice: 3500, badge: "الأكثر مبيعاً", icon: "🐉", color: "#0d2235", stock: 25, description: "توزيعة Kali Linux مع 600+ أداة اختبار اختراق مثبتة ومُحدّثة. تشمل: Burp Suite, Metasploit, Nmap, Wireshark, John the Ripper. مع دليل تثبيت افتراضي.", rating: 4.9, reviews: 412 },
      { id: "p2", category: "distros", name: "Parrot Security OS 6.0", price: 2300, oldPrice: 0, badge: "مستقر", icon: "🦜", color: "#0d3520", stock: 18, description: "توزيعة باروت للأمن السيبراني. مناسبة للاختبار الاحترافي والمحاكاة السحابية.", rating: 4.7, reviews: 156 },
      { id: "p3", category: "exploit", name: "Metasploit Pro - رخصة سنوية", price: 8900, oldPrice: 12000, badge: "احترافي", icon: "💀", color: "#2a0a1a", stock: 6, description: "إطار عمل Metasploit الكامل لاختبار الاختراق (نسخة تعليمية مرخصة). يشمل تحديثات لمدة 12 شهراً.", rating: 5, reviews: 89 },
      { id: "p4", category: "web", name: "Burp Suite Professional", price: 12500, oldPrice: 0, badge: "للويب", icon: "🌐", color: "#1a0d35", stock: 4, description: "أداة اختبار اختراق تطبيقات الويب الأشهر عالمياً. تشمل Scanner المتقدم والتحديثات السنوية.", rating: 4.9, reviews: 234 },
      { id: "p5", category: "wireless", name: "WiFi Pineapple Mark VII", price: 18900, oldPrice: 22000, badge: "للشبكات", icon: "📡", color: "#0d2438", stock: 3, description: "جهاز اختبار اختراق الشبكات اللاسلكية الاحترافي. جاهز للعمل مع بيئة Pineapple UI.", rating: 4.8, reviews: 67 },
      { id: "p6", category: "courses", name: "دورة OSCP الكاملة (PDF+LABS)", price: 4500, oldPrice: 0, badge: "تعليمي", icon: "🎓", color: "#1d2611", stock: 99, description: "دورة شاملة لإعداد شهادة OSCP. تشمل منهجية PDF كامل + بيئات تدريب افتراضية + تطبيقات CTF.", rating: 4.9, reviews: 512 },
      { id: "p7", category: "courses", name: "كتاب Hacking: The Art of Exploitation", price: 1800, oldPrice: 2200, badge: "كلاسيكي", icon: "📕", color: "#1d2611", stock: 42, description: "الكتاب الكلاسيكي لتعلم الاختراق الأخلاقي وفهم استغلال الثغرات بعمق. النسخة العربية الكاملة.", rating: 4.8, reviews: 178 },
      { id: "p8", category: "osint", name: "Maltego Community Edition", price: 0, oldPrice: 0, badge: "مجاني", icon: "🔍", color: "#0e1d2a", stock: 999, description: "أداة OSINT لتحليل العلاقات بين البيانات والمعلومات. النسخة المجانية مفتوحة المصدر.", rating: 4.7, reviews: 91 },
      { id: "p9", category: "malware", name: "ANY.RUN Sandbox (اشتراك 3 أشهر)", price: 7600, oldPrice: 0, badge: "تحليل", icon: "🦠", color: "#231510", stock: 12, description: "بيئة رملية سحابية لتحليل البرمجيات الخبيثة بأمان. اشتراك 3 أشهر + تقارير قابلة للتصدير.", rating: 4.9, reviews: 56 },
      { id: "p10", category: "tools", name: "Hashcat Pro (نسخة GPU)", price: 4900, oldPrice: 5800, badge: "لكسر التشفير", icon: "🔐", color: "#1a1a0d", stock: 20, description: "أداة كسر كلمات المرور الأسرع في العالم. مع جداول محدثة ودعم بطاقات GPU الحديثة.", rating: 4.8, reviews: 145 },
      { id: "p11", category: "wireless", name: "Aircrack-ng Suite (للويندوز/لينكس)", price: 1500, oldPrice: 0, badge: "متوفر", icon: "🛜", color: "#0d2438", stock: 33, description: "حزمة Aircrack-ng الكاملة لاختبار الشبكات اللاسلكية. تشمل: airmon-ng, airodump-ng, aireplay-ng.", rating: 4.6, reviews: 88 },
      { id: "p12", category: "courses", name: "دورة CEH v12 الكاملة (Arabic)", price: 6200, oldPrice: 7800, badge: "محدّث", icon: "📚", color: "#1d2611", stock: 50, description: "دورة Certified Ethical Hacker بنسخة عربية كاملة. تشمل محاضرات فيديو + تطبيقات LAB + امتحان تدريبي.", rating: 4.9, reviews: 367 }
    ],
    coupons: [
      { code: "CYBER10", type: "percent", value: 10, active: true },
      { code: "WELCOME", type: "fixed", value: 200, active: true }
    ],
    orders: []
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function merge(base, saved) {
    var r = clone(base);
    if (!saved || typeof saved !== "object") return r;
    Object.keys(saved).forEach(function (k) {
      if (Array.isArray(saved[k])) r[k] = saved[k];
      else if (saved[k] && typeof saved[k] === "object" && r[k] && typeof r[k] === "object") r[k] = Object.assign({}, r[k], saved[k]);
      else if (saved[k] !== undefined) r[k] = saved[k];
    });
    return r;
  }
  function load() {
    try {
      var raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        var fresh = clone(DEFAULT_DB);
        localStorage.setItem(DB_KEY, JSON.stringify(fresh));
        return fresh;
      }
      var m = merge(DEFAULT_DB, JSON.parse(raw));
      m.adminAuth = DEFAULT_DB.adminAuth; // لا تخزين بيانات الدخول المعدّلة من اللوحة
      return m;
    } catch (e) { return clone(DEFAULT_DB); }
  }
  function save(db) {
    try {
      var s = clone(db);
      delete s.adminAuth;
      localStorage.setItem(DB_KEY, JSON.stringify(s));
      window.dispatchEvent(new CustomEvent("major-db-updated"));
      return true;
    } catch (e) { return false; }
  }
  function loadCart() {
    try { var v = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); return true; } catch (e) { return false; } }
  function uid(p) { return (p || "id") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function formatMoney(n, cur) { return Number(n || 0).toLocaleString("ar-DZ") + " " + (cur || "دج"); }
  function getLogo() { return LOGO_SVG; }
  function getAdminAuth() { return Object.assign({}, DEFAULT_DB.adminAuth); }

  window.ElectroDB = {
    KEY: DB_KEY, load: load, save: save,
    loadCart: loadCart, saveCart: saveCart,
    uid: uid, formatMoney: formatMoney,
    getLogo: getLogo, getAdminAuth: getAdminAuth,
    getDefault: function () { return clone(DEFAULT_DB); }
  };
})();