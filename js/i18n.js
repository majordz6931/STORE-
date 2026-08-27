(function () {
  var KEY = "major360_lang";

  var T = {
    ar: {
      dir: "rtl", htmlLang: "ar",
      title: "MAJOR AM 360 — متجر الأدوات والمشاهدات",
      adminTitle: "لوحة التحكم — MAJOR AM 360",
      gateTitle: "اختر اللغة", gateSub: "MAJOR AM 360",
      arabic: "العربية", english: "English", langBtn: "EN",
      shop: "المتجر", how: "كيف أطلب؟", contact: "تواصل", admin: "لوحة التحكم", cart: "السلة",
      heroTitle: "اختر الخدمة المناسبة لك واحصل عليها بسرعة",
      heroSub: "متجر رقمي موثوق لتطوير حساباتك ومشاهداتك — تسليم سريع ودعم مباشر.",
      shopNow: "تسوق الآن", joinDiscord: "انضم للديسكورد",
      trust1: "توصيل سريع", trust2: "دفع آمن", trust3: "دعم مباشر 24/7",
      offers: "العروض المتاحة", offersSub: "اختر المنتج وأضفه للسلة ثم أكمل الطلب.",
      all: "الكل", catCyber: "🛡️ الحماية", catStream: "📺 المشاهدات", catGaming: "🎮 الألعاب",
      addCart: "أضف للسلة", added: "✓ في السلة", buyNow: "اشتري الآن", addedToCart: "✓ في السلة",
      noProducts: "لا توجد منتجات في هذا القسم بعد.",
      searchPlaceholder: "ابحث عن منتج...",
      howTitle: "كيف تطلب؟", howSub: "ثلاث خطوات فقط",
      s1t: "اختر المنتج", s1d: "تصفح المنتجات واختر ما يناسبك.",
      s2t: "ادفع بالطريقة المعروضة", s2d: "حوّل المبلغ بطريقة الدفع الظاهرة عند إتمام الطلب.",
      s3t: "أرسل الإثبات واستلم", s3d: "ارفع صورة التحويل وسنتواصل معك للتنفيذ.",
      contactTitle: "تواصل معنا",
      discOfficial: "قناة الديسكورد الرسمية", discLive: "دعم حي وطلبات مستمرة", openDiscord: "افتح ديسكورد",
      footerLine: "متجر رقمي موثوق",
      yourCart: "سلتك", close: "إغلاق", emptyCart: "السلة فارغة.",
      total: "الإجمالي:", checkout: "إتمام الطلب",
      orderData: "بيانات الطلب",
      name: "الاسم", namePh: "اسمك الكامل",
      contactInfo: "ديسكورد أو واتساب", contactPh: "username أو رقم واتساب",
      country: "البلد", countryPh: "مثال: الجزائر",
      proof: "سكرين شوت إثبات الدفع", proofNeed: "يجب رفع صورة إثبات التحويل",
      confirm: "أرسل الطلب بعد الدفع", cancel: "إلغاء",
      sent: "✓ تم إرسال طلبك مع إثبات الدفع.",
      yourOrderId: "رقم الطلب:",
      payTitle: "طريقة الدفع", copy: "نسخ العنوان", copied: "تم النسخ",
      noPayments: "لا توجد طرق دفع حالياً — تواصل معنا عبر الديسكورد.",
      couponCode: "كود الخصم", couponPlaceholder: "أدخل كود الخصم", couponApply: "تطبيق",
      couponInvalid: "كود الخصم غير صالح أو منتهي", couponApplied: "تم تطبيق الخصم!",
      myOrders: "طلباتي", noOrdersHistory: "لا توجد طلبات سابقة بعد.",
      orderStatus: "حالة الطلب",
      statusPending: "🟡 قيد الانتظار", statusConfirmed: "🟢 تم التأكيد",
      statusDelivered: "🟣 تم التسليم", statusCancelled: "🔴 ملغي",
      chatHello: "مرحباً! كيف نقدر نساعدك؟",
      chatNamePh: "اسمك لبدء المحادثة", chatStart: "ابدأ", chatMsgPh: "اكتب رسالتك...", chatSend: "إرسال",
      liveChat: "الدردشة الحية",
      bought: "اشترى للتو", visiting: "يتصفح المتجر الآن", justNow: "الآن", visitors: "زائر يتصفحون الآن",
      whatsappTooltip: "تواصل واتساب",
      /* لوحة التحكم */
      adminBar: "اللوحة", storeBtn: "المتجر", logout: "خروج",
      loginTitle: "دخول الأدمن", username: "اسم المستخدم", password: "كلمة السر", login: "دخول",
      badLogin: "بيانات الدخول غير صحيحة",
      statsTitle: "لمحة عامة", totalOrders: "إجمالي الطلبات", pending: "قيد الانتظار",
      confirmed: "مؤكد", delivered: "تم التسليم", topProducts: "الأكثر مبيعاً", noOrders: "لا توجد طلبات بعد",
      products: "المنتجات", addProduct: "إضافة منتج", pCount: "عدد المنتجات:",
      pName: "اسم المنتج", pNamePh: "مثال: بيباس 1080",
      pNameEn: "الاسم بالإنجليزية", category: "القسم", price: "السعر ($)", emoji: "إيموجي",
      pImage: "صورة المنتج", desc: "الوصف", descEn: "الوصف بالإنجليزية", publish: "نشر في المتجر",
      colName: "الاسم", colCat: "القسم", colPrice: "السعر", del: "حذف", saved: "تم الحفظ",
      ordersTitle: "الطلبات الواردة", oCount: "عدد الطلبات:",
      colTime: "الوقت", colContact: "التواصل", colItems: "العناصر", colTotal: "المجموع",
      colStatus: "الحالة", action: "إجراء", exportCSV: "📥 تصدير CSV",
      paymentsTab: "طرق الدفع", paymentsTitle: "طرق الدفع",
      paymentsSub: "عرّف طريقة دفعك بحرية — الاسم والمحفظة وصورة QR. تظهر للزبائن عند الطلب.",
      payLabel: "اسم الطريقة", payNetwork: "الشبكة", payWallet: "عنوان المحفظة",
      payQrLabel: "صورة QR", addPayment: "إضافة طريقة", noPayments: "لا توجد طرق دفع", removed: "تم الحذف",
      coupons: "كوبونات الخصم", addCoupon: "إضافة كوبون",
      couponCodeLabel: "الكود", couponType: "النوع", couponPercent: "نسبة %", couponFixed: "مبلغ ثابت",
      couponValue: "القيمة", couponMax: "أقصى استخدام", couponExpires: "تاريخ الانتهاء",
      couponAddBtn: "إضافة الكوبون", noCoupons: "لا توجد كوبونات", couponUsage: "الاستخدام",
      settingsTab: "الإعدادات", discTitle: "رابط الديسكورد", link: "الرابط", saveLink: "حفظ",
      whatsappTitle: "واتساب", whatsappLabel: "رقم واتساب (مع مفتاح الدولة)", whatsappMsgLabel: "رسالة الترحيب",
      whatsappSaved: "✅ تم حفظ واتساب",
      announcementTitle: "الإعلان", annText: "نص الإعلان", annTextEn: "نص الإعلان (إنجليزي)",
      annEnabled: "تفعيل الإعلان", annSaved: "✅ تم حفظ الإعلان",
      admins: "المشرفون", addAdmin: "إضافة مشرف", addAdminBtn: "إضافة",
      used: "الاسم مستخدم", adminAdded: "تمت إضافة المشرف", colUser: "المستخدم",
      chatTitle: "المحادثات", noChats: "لا توجد محادثات بعد", newChat: "بدأ محادثة جديدة", reply: "رد",
      typeMsg: "اكتب رسالتك...", send: "إرسال",
      confirmDelete: "تأكيد الحذف؟", err: "خطأ", retry: "إعادة"
    },
    en: {
      dir: "ltr", htmlLang: "en",
      title: "MAJOR AM 360 — Tools & Views Shop",
      adminTitle: "Dashboard — MAJOR AM 360",
      gateTitle: "Choose language", gateSub: "MAJOR AM 360",
      arabic: "العربية", english: "English", langBtn: "AR",
      shop: "Shop", how: "How to order", contact: "Contact", admin: "Dashboard", cart: "Cart",
      heroTitle: "Pick the service you need and get it fast",
      heroSub: "Trusted digital shop for account tools & views — fast delivery and live support.",
      shopNow: "Shop now", joinDiscord: "Join Discord",
      trust1: "Fast delivery", trust2: "Secure payment", trust3: "24/7 support",
      offers: "Available offers", offersSub: "Pick a product, add it to cart, then checkout.",
      all: "All", catCyber: "🛡️ Protection", catStream: "📺 Views", catGaming: "🎮 Gaming",
      addCart: "Add to cart", added: "✓ In cart", buyNow: "Buy now", addedToCart: "✓ In cart",
      noProducts: "No products in this category yet.",
      searchPlaceholder: "Search products...",
      howTitle: "How to order?", howSub: "Only three steps",
      s1t: "Choose a product", s1d: "Browse products and pick what you need.",
      s2t: "Pay with the shown method", s2d: "Send the amount to the payment method shown at checkout.",
      s3t: "Upload proof & receive", s3d: "Upload the transfer screenshot and we will contact you.",
      contactTitle: "Contact us",
      discOfficial: "Official Discord server", discLive: "Live support & orders", openDiscord: "Open Discord",
      footerLine: "Trusted digital shop",
      yourCart: "Your cart", close: "Close", emptyCart: "Cart is empty.",
      total: "Total:", checkout: "Checkout",
      orderData: "Order details",
      name: "Name", namePh: "Your full name",
      contactInfo: "Discord or WhatsApp", contactPh: "username or WhatsApp number",
      country: "Country", countryPh: "e.g. Algeria",
      proof: "Payment screenshot", proofNeed: "Payment screenshot is required",
      confirm: "Submit order after payment", cancel: "Cancel",
      sent: "✓ Order sent with payment proof.",
      yourOrderId: "Order ID:",
      payTitle: "Payment method", copy: "Copy address", copied: "Copied",
      noPayments: "No payment methods yet — contact us on Discord.",
      couponCode: "Coupon code", couponPlaceholder: "Enter coupon code", couponApply: "Apply",
      couponInvalid: "Invalid or expired coupon", couponApplied: "Applied!",
      myOrders: "My orders", noOrdersHistory: "No orders yet.",
      orderStatus: "Order status",
      statusPending: "🟡 Pending", statusConfirmed: "🟢 Confirmed",
      statusDelivered: "🟣 Delivered", statusCancelled: "🔴 Cancelled",
      chatHello: "Hi! How can we help you?",
      chatNamePh: "Your name to start", chatStart: "Start", chatMsgPh: "Type a message...", chatSend: "Send",
      liveChat: "Live chat",
      bought: "bought", visiting: "is browsing the store", justNow: "just now", visitors: "visitors now",
      whatsappTooltip: "WhatsApp chat",
      /* dashboard */
      adminBar: "Dashboard", storeBtn: "Store", logout: "Logout",
      loginTitle: "Admin login", username: "Username", password: "Password", login: "Sign in",
      badLogin: "Invalid login credentials",
      statsTitle: "Overview", totalOrders: "Total orders", pending: "Pending",
      confirmed: "Confirmed", delivered: "Delivered", topProducts: "Top selling", noOrders: "No orders yet",
      products: "Products", addProduct: "Add product", pCount: "Products:",
      pName: "Product name", pNamePh: "e.g. Diamonds 1080",
      pNameEn: "Name in English", category: "Category", price: "Price ($)", emoji: "Emoji",
      pImage: "Product image", desc: "Description", descEn: "Description (EN)", publish: "Publish",
      colName: "Name", colCat: "Category", colPrice: "Price", del: "Delete", saved: "Saved",
      ordersTitle: "Incoming orders", oCount: "Orders:",
      colTime: "Time", colContact: "Contact", colItems: "Items", colTotal: "Total",
      colStatus: "Status", action: "Action", exportCSV: "📥 Export CSV",
      paymentsTab: "Payments", paymentsTitle: "Payment methods",
      paymentsSub: "Define your payment methods freely — name, wallet & QR image. Shown to customers at checkout.",
      payLabel: "Method name", payNetwork: "Network", payWallet: "Wallet address",
      payQrLabel: "QR image", addPayment: "Add method", noPayments: "No payment methods", removed: "Deleted",
      coupons: "Coupons", addCoupon: "Add coupon",
      couponCodeLabel: "Code", couponType: "Type", couponPercent: "Percent %", couponFixed: "Fixed $",
      couponValue: "Value", couponMax: "Max uses", couponExpires: "Expiry date",
      couponAddBtn: "Add coupon", noCoupons: "No coupons", couponUsage: "Usage",
      settingsTab: "Settings", discTitle: "Discord link", link: "Link", saveLink: "Save",
      whatsappTitle: "WhatsApp", whatsappLabel: "WhatsApp number (with country code)", whatsappMsgLabel: "Welcome message",
      whatsappSaved: "✅ WhatsApp saved",
      announcementTitle: "Announcement", annText: "Announcement text", annTextEn: "Announcement text (EN)",
      annEnabled: "Show announcement", annSaved: "✅ Announcement saved",
      admins: "Admins", addAdmin: "Add admin", addAdminBtn: "Add",
      used: "Username already used", adminAdded: "Admin added", colUser: "User",
      chatTitle: "Chats", noChats: "No chats yet", newChat: "started a new chat", reply: "Reply",
      typeMsg: "Type a message...", send: "Send",
      confirmDelete: "Confirm delete?", err: "Error", retry: "Retry"
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

  window.MajorI18n = { t: t, getLang: getLang, setLang: setLang, apply: apply, boot: boot, onChange: null };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();