(function () {
  var KEY = "major360_lang";

  var T = {
    ar: {
      dir: "rtl", htmlLang: "ar",
      title: "MAJOR AM 360 — متجر الأدوات والمشاهدات",
      adminTitle: "لوحة التحكم — MAJOR AM 360",
      gateTitle: "اختر اللغة / Choose language", gateSub: "MAJOR AM 360",
      arabic: "العربية", english: "English",
      shop: "المتجر", how: "كيف تطلب", contact: "تواصل", admin: "لوحة التحكم", cart: "السلة",
      heroTitle: "اختر الخدمة المناسبة لك واحصل عليها بسرعة",
      heroText: "اختر الخدمة المناسبة لك واحصل عليها بسرعة — متجر رقمي موثوق.",
      shopNow: "تسوق الآن", discord: "ديسكورد", joinDiscord: "انضم لديسكورد MAJOR",
      trusted: "متجر رقمي موثوق",
      support: "دعم", fast: "تسليم", safe: "طلب", fastVal: "سريع", safeVal: "آمن",
      all: "الكل",
      offers: "العروض المتاحة", offersSub: "اختر المنتج وأضفه للسلة ثم أكمل الطلب.",
      addCart: "أضف للسلة", added: "✓ تمت الإضافة", noProducts: "لا توجد منتجات في هذا القسم بعد.",
      howTitle: "كيف تطلب؟", howSub: "ثلاث خطوات فقط.",
      s1t: "اختر المنتج", s1d: "تصفح المنتجات واختر اللي يناسبك.",
      s2t: "ادفع عبر BSC", s2d: "حوّل المبلغ على BNB Smart Chain (BEP20).",
      s3t: "استلم عبر الديسكورد", s3d: "نتواصل معك وننفّذ الطلب بسرعة.",
      contactTitle: "تواصل معنا",
      discOfficial: "قناة الديسكورد الرسمية", discLive: "للدعم والطلبات الحية", openDiscord: "افتح ديسكورد",
      footerLine: "متجر رقمي موثوق",
      yourCart: "سلتك", close: "إغلاق", emptyCart: "السلة فارغة.",
      total: "الإجمالي:", checkout: "إتمام الطلب",
      orderData: "بيانات الطلب",
      name: "الاسم", namePh: "اسمك",
      contactInfo: "ديسكورد أو واتساب", contactPh: "username أو رقم واتساب",
      country: "البلد", countryPh: "مثال: الجزائر",
      notes: "ملاحضات (ID اللعبة / رابط الفيديو)", notesPh: "اكتب تفاصيل التسليم",
      proof: "سكرين شوت إثبات الدفع", proofNeed: "يجب رفع صورة التحويل",
      confirm: "أرسل الطلب بعد الدفع", cancel: "إلغاء",
      sent: "✓ تم إرسال الطلب مع إثبات الدفع.",
      currency: "$",
      payTitle: "الدفع عبر BSC", payNet: "BNB Smart Chain (BEP20)",
      payHint: "حوّل المبلغ بالضبط ثم ارفع سكرين الشوت.",
      copy: "نسخ العنوان", copied: "تم نسخ العنوان", payTo: "عنوان المحفظة",
      screenshot: "سكرين",
      langBtn: "EN",
      adminBar: "لوحة التحكم", storeBtn: "المتجر",
      logout: "خروج",
      loginTitle: "دخول الأدمن", username: "اسم المستخدم", password: "كلمة السر", login: "دخول",
      badLogin: "بيانان الدخول غير صحيحة",
      products: "المنتجات", orders: "الطلبات", admins: "الأدمن",
      addProduct: "إضافة منتج للبيع", pCount: "عدد المننتجات:",
      pName: "اسم المنتج", pNamePh: "مثال: بيباس 1080",
      pNameEn: "الاسم بالإنجليزية",
      category: "القسم", price: "السعر ($)", emoji: "أيقونة (إيموجي)",
      pImage: "صورة المنتج", desc: "الوصف", descEn: "الوصف بالإنجليزية",
      publish: "نشر في المتر",
      colName: "الاسم", colCat: "قسم", colPrice: "سعر", del: "حذف",
      ordersTitle: "الطلبات الواردة", oCount: "عدد الطلبات:",
      colTime: "الوقت", colPhone: "هاتف", colItems: "العناصر", colTotal: "المجموع",
      noOrders: "لا طلبات بعد",
      discTitle: "رابط قناة الديسكورد", discSub: "يظهر الزر في الصفحة الرئسية.",
      link: "الرابط", saveLink: "حفظ الرابط", saved: "تم حفظ رابط الديسكورد",
      addAdmin: "إضافة أدمن آخ", addAdminBtn: "إضافة أدمن",
      used: "الاسم مسستخدم", adminAdded: "تمت إضافة الأدمن",
      colUser: "المستخدم",
      chatTitle: "محادثة مباشرة", chatOnline: "متصل الآن",
      chatHello: "مرحباً، كيف نقدر نساعدك؟",
      chatNamePh: "اسمك للبدء", chatStart: "ابدأ المحادثة",
      chatMsgPh: "اكتب رسالتك...", chatSend: "إرسال",
      liveChat: "الدردشة", noChats: "لا محادثات بعد", reply: "رد",
      userLogin: "تسجيل الدخول", userLoginSub: "سجّل حتى نتعرف على اسمك",
      withGmail: "الدخول عبر Gmail", withDiscord: "الدخول عبر Discord",
      gmail: "Gmail", discUser: "يوزر ديسكورد", discUserPh: "username",
      members: "الأعضاء", noMembers: "لا أعضاء بعد", provider: "الطريقة",
      userLogout: "خروج", hi: "مرحباً",
      search: "🔍 بحث", searchPlaceholder: "ابحث عن منتج...",
      orderStatus: "حالة الطلب",
      statusPending: "🟡 قيد الانتظار", statusConfirmed: "🟢 تم التأكيد",
      statusDelivered: "🟣 تم التسليم", statusCancelled: "🔴 ملغي",
      statsTitle: "📊 إحصائيات المتجر",
      totalOrders: "إجمالي الطلبات", totalRevenue: "إجمالي الإيرادات",
      topProducts: "المنتجات الأكثر مبيعاً",
      applyCoupon: "كود خصم", couponCode: "كود الخصم",
      couponPlaceholder: "أدخل كود الخصم", couponApply: "تطبيق",
      couponInvalid: "كود الخصم غير صالح أو منتهي",
      couponApplied: "تم تطبيق الخصم!", discount: "الخصم",
      ordersHistory: "طلباتي السابقة", myOrders: "طلباتي",
      noOrdersHistory: "لا توجد طلبات سابقة", reorder: "إعادة الطلب",
      confirmDelete: "تأكيد الحذف؟",
      stats: "الإحصائيات", coupons: "كوبونات الخصم",
      addCoupon: "إضافة كود خصم",
      couponCodeLabel: "الكود", couponType: "النوع",
      couponPercent: "نسبة %", couponFixed: "مبلغ ثابت",
      couponValue: "القيمة", coupoonMax: "أقصى استخدام",
      coupoonExpires: "تاريخ الانتهاء", couponAddBtn: "إضافة الكوبون",
      coupoonDelete: "حذف", noCoupons: "لا توجد كوبونات",
      couponUsage: "استخدام",
      markConfirmed: "تأكيد", markDelivered: "تسليم", markCancelled: "إلغاء",
      exportCSV: "📥 تصدير CSV",
      whatsappTooltip: "تواصل واتساب",
      whatsapp: "واتساب",
      announcementTitle: "إعلان",
      announcementTab: "الإعلانات",
      annText: "نص الإعلان",
      annTextEn: "نص الإعلان (إنجليزي)",
      annEnabled: "تفعيل الإعلان",
      annSaved: "✅ تم حفظ الإعلان",
      whatsappTitle: "رابط واتساب",
      whatsappLabel: "رقم واتساب (مع مفتاح الدولة)",
      whatsappMsgLabel: "رسالة الترحيب",
      whatsappSaved: "✅ تم حفظ واتساب",
      featured: "⭐ منتجات مميزة",
      flashSale: "🔥 تخفيضات",
      orderNow: "اطلب الآن",
      loading: "جاري التحميل...", error: "خطأ", retry: "إعادة المحاولة",
      quickAdd: "➕", addedToCart: "✓ في السلة", outOfStock: "نفذ",
      discountLabel: "الخصم:", originalPrice: "السعر الأصلي:",
      yourOrderId: "رقم الطلب:"
    },
    en: {
      dir: "ltr", htmlLang: "en",
      title: "MAJOR AM 360 — Tools & Views Shop",
      adminTitle: "Dashboard — MAJOR AM 360",
      gateTitle: "Choose language / اختر اللغة", gateSub: "MAJOR AM 360",
      arabic: "العربية", english: "English",
      shop: "Shop", how: "How to order", contact: "Contact", admin: "Dashboard", cart: "Cart",
      heroTitle: "Choose the sevice that suits you and get it quickly.",
      shopNow: "Shop now", discord: "Discord", joinDiscord: "Join MAJOR Discord",
      trusted: "Trusted digital shop",
      support: "Support", fast: "Delivery", safe: "Orders", fastVal: "Fast", safeVal: "Safe",
      all: "All",
      offers: "Available offers", offersSub: "Pick a product, add it to cart, then checkout.",
      addCart: "Add to cart", added: "✓ Added", noProducts: "No products in this category yet.",
      howTitle: "How to order?", howSub: "Only three steps.",
      s1t: "Choose a product", s1d: "Browse products and pick what you need.",
      s2t: "Pay on BSC", s2d: "Send the amount on BNB Smart Chain (BEP20).",
      s3t: "Get via Discord", s3d: "We contact you and process the order quickly.",
      contactTitle: "Contact us",
      discOfficial: "Official Discrd server", discLive: "Live support and orders", openDiscord: "Open Discord",
      footerLine: "Trusted digital shop",
      yourCart: "Your cart", close: "Close", emptyCart: "Cart is empty.",
      total: "Total:", checkout: "Checkout",
      orderData: "Order details",
      name: "Name", namePh: "Your name",
      contactInfo: "Discord or WhatsApp", contactPh: "username or WhatsApp number",
      country: "Country", countryPh: "e.g. Algeria",
      notes: "Notes (game ID / video link)", notesPh: "Delivery details",
      proof: "Payment screenshot", proofNeed: "Payment screenshot is required",
      confirm: "Submit order after payment", cancel: "Cancel",
      sent: "✓ Order sent with payment proof.",
      currency: "$",
      payTitle: "Pay via BSC", payNet: "BNB Smart Chain (BEP20)",
      payHint: "Send the exact amount, then upload the screenshot.",
      copy: "Copy address", copied: "Address copied", payTo: "Wallet address",
      screenshot: "Proof",
      langBtn: "AR",
      adminBar: "Dashboard", storeBtn: "Store",
      logout: "Logout",
      loginTitle: "Admin login", username: "Username", password: "Password", login: "Sign in",
      badLogin: "Invalid login details",
      products: "Products", orders: "Orders", admins: "Admins",
      addProduct: "Add a product", pCount: "Products:",
      pName: "Product name (Arabic)", pNamePh: "e.g. Diamonds 1080",
      pNameEn: "Name in English",
      category: "Category", price: "Price ($)", emoji: "Icon (emoji)",
      pImage: "Product image", desc: "Description (Arabic)", descEn: "Description in English",
      publish: "Publish to shop",
      colName: "Name", colCat: "Category", colPrice: "Price", del: "Delete",
      ordersTitle: "Incoming orders", oCount: "Orders:",
      colTime: "Time", colPhone: "Phone", colItems: "Items", colTotal: "Total",
      noOrders: "No orders yet",
      discTitle: "Discord invite link", discSub: "Shown on the homepage.",
      link: "Link", saveLink: "Save link", saved: "Discord link saved",
      addAdmin: "Add another admin", addAdminBtn: "Add admin",
      used: "Username already used", adminAdded: "Admin added", colUser: "User",
      chatTitle: "Live chat", chatOnline: "Online now",
      chatHello: "Hi, how can we help you?",
      chatNamePh: "Your name to start", chatStart: "Start chat",
      chatMsgPh: "Type a message...", chatSend: "Send",
      liveChat: "Live chat", noChats: "No chats yet", reply: "Reply",
      userLogin: "Sign in", userLoginSub: "Sign in so we know your name",
      withGmail: "Continue with Gmail", withDiscord: "Continue with Discord",
      gmail: "Gmail", discUser: "Discord username", discUserPh: "username",
      members: "Members", noMembers: "No members yet", provider: "Provider",
      userLogout: "Sign out", hi: "Hi",
      search: "🔍 Search", searchPlaceholder: "Search products...",
      orderStatus: "Order status",
      statusPending: "🟡 Pending", statusConfirmed: "🟢 Confirmed",
      statusDelivered: "🟣 Delivered", statusCancelled: "🔴 Cancelled",
      statsTitle: "📊 Store Stats",
      totalOrders: "Total orders", totalRevenue: "Total revenue",
      topProducts: "Top selling products",
      applyCoupon: "Coupon code", couponCode: "Coupon code",
      couponPlaceholder: "Enter coupon code", couponApply: "Apply",
      couponInvalid: "Invalid or expired coupon",
      couponApplied: "Applied!", discount: "Discount",
      ordersHistory: "My orders", myOrders: "My orders",
      noOrdersHistory: "No orders yet", reorder: "Reorder",
      confirmDelete: "Confirm delete?",
      stats: "Statistics", coupons: "Coupons",
      addCoupon: "Add coupon",
      couponCodeLabel: "Code", couponType: "Type",
      couponPercent: "Percent %", couponFixed: "Fixed amount",
      couponValue: "Value", couponMax: "Max uses",
      couponEpires: "Expiry date", couponAddBtn: "Add coupoon",
      coupoonDelete: "Delete", noCoupons: "No coupoons",
      couponUsage: "Usage",
      markConfirmed: "Confirm", markDelivered: "Deliver", markCancelled: "Cancel",
      exportCSV: "📥 Export CSV",
      whatsappTooltip: "WhatsApp chat",
      whatsapp: "WhatsApp",
      announcementTitle: "Announcement",
      announcementTab: "Announcements",
      annText: "Announcement text",
      annTextEn: "Announcement text (English)",
      annEnabled: "Show announcement",
      annSaved: "✅ Announcement saved",
      whatsappTitle: "WhatsApp link",
      whatsappLabel: "WhatsApp number (with country code)",
      whatsappMsgLabel: "Welcome message",
      whatsappSaved: "✅ WhatsApp saved",
      featured: "⭐ Featured products",
      flashSale: "🔥 Flash sale",
      orderNow: "Order now",
      loading: "Loading...", error: "Error", retry: "Retry",
      quickAdd: "➕", addedToCart: "✓ In cart", outOfStock: "Out of stock",
      discountLabel: "Discount:", originalPrice: "Original price:",
      yourOrderId: "Order ID:"
    }
  };

  function getLang() { return localStorage.getItem(KEY) || ""; }
  function setLang(lang) { localStorage.setItem(KEY, lang); apply(lang); }

  function t(key) {
    var lang = getLang() || "ar";
    return (T[lang] && T[lang][key]) || T.ar[key] || key;
  }

  function apply(lang) {
    lang = lang || getLang() || "ar";
    var pack = T[lang] || T.ar;
    document.documentElement.lang = pack.htmlLang;
    document.documentElement.dir = pack.dir;
    document.body.classList.toggle("ltr", pack.dir === "ltr");
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute("data-i18n");
      if (pack[k] != null) nodes[i].textContent = pack[k];
    }
    var ph = document.querySelectorAll("[data-i18n-ph]");
    for (var j = 0; j < ph.length; j++) {
      var pk = ph[j].getAttribute("data-i18n-ph");
      if (pack[pk] != null) ph[j].placeholder = pack[pk];
    }
    var isAdmin = /admin\.html/i.test(location.pathname);
    document.title = isAdmin ? pack.adminTitle : pack.title;
    var gate = document.getElementById("langGate");
    if (gate) {
      if (!getLang()) gate.classList.add("show");
      else gate.classList.remove("show");
    }
    if (window.MajorI18n && typeof window.MajorI18n.onChange === "function") {
      window.MajorI18n.onChange(lang);
    }
  }

  function boot() {
    var lang = getLang();
    apply(lang || "ar");
    var gate = document.getElementById("langGate");
    if (gate && !lang) gate.classList.add("show");
    document.addEventListener("click", function (e) {
      var pick = e.target.closest("[data-set-lang]");
      if (pick) setLang(pick.getAttribute("data-set-lang"));
    });
  }

  window.MajorI18n = { t, getLang, setLang, apply, boot, onChange: null };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();