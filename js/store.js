(function () {
  "use strict";

  var DB_KEY = "major_store_v4";
  var CART_KEY = "major_store_cart_v4";

  /* الشعار الدائري */
  var LOGO_SVG = "<div class='logo-frame'><svg class='major-logo-svg' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='mg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#22ffb5'/><stop offset='1' stop-color='#7b5fff'/></linearGradient></defs><circle cx='50' cy='50' r='34' fill='none' stroke='url(#mg)' stroke-width='2'/><circle cx='50' cy='50' r='28' fill='#060b16'/><g stroke='#22ffb5' stroke-width='2' fill='none' stroke-linecap='round'><path d='M50 26 L74 40 L74 60 Q74 70 50 78 Q26 70 26 60 L26 40 Z'/></g><circle cx='40' cy='46' r='2.6' fill='#22ffb5'/><circle cx='60' cy='46' r='2.6' fill='#22ffb5'/><path d='M42 56 Q50 62 58 56' stroke='#22ffb5' stroke-width='2' fill='none' stroke-linecap='round'/><text x='50' y='108' text-anchor='middle' font-family='Arial' font-size='6' font-weight='700' fill='#22ffb5' letter-spacing='3'>MAJOR</text></svg></div>";

  /* ترجمة لجميع النصوص في الواجهة - تدعم العربية والإنجليزية */
  var I18N = {
    ar: {
      siteTitle: "MAJOR STORE",
      siteSub: "منتجات رقمية وبرامج وأدوات عملية",
      navShop: "المتجر",
      navCats: "الأقسام",
      navAbout: "من نحن",
      navContact: "تواصل",
      navAdmin: "لوحة التحكم",
      searchPh: "ابحث عن قوالب، أدوات، ملفات…",
      heroBadge: "Digital Products · Templates · Courses",
      heroLine1: "أدوات",
      heroLine1Accent: "الأدوات الرقمية",
      heroLine2: "وبرامج الأمن السيبراني",
      heroText: "برامج مرخّصة، قوالب جاهزة، ملفات رقمية ودورات عملية — كل ما تحتاجه لإنجاز أعمالك في مكان واحد.",
      heroCta: "تصفح المنتجات",
      heroSecondary: "تواصل مع الدعم",
      statClients: "عميل محترف",
      statGuarantee: "ضمان المنتجات",
      statSupport: "دعم تقني",
      bullet1: "تجهيز فوري",
      bullet2: "ضمان الجودة",
      bullet3: "دعم على Discord",
      bullet4: "مدفوعات مشفرة",
      sectionCategories: "// الأقسام",
      sectionAll: "جميع المنتجات",
      sectionAllCount: "منتج",
      sectionShop: "// let products = filteredList;",
      sectionShopTitle1: "أدوات",
      sectionShopTitle2: "احترافية",
      resultCount: "منتج",
      sortFeatured: "الأكثر تميزاً",
      sortLow: "السعر: الأقل أولاً",
      sortHigh: "السعر: الأعلى أولاً",
      sortRating: "الأعلى تقييماً",
      emptyTitle: "لم نجد نتيجة",
      emptyText: "جرّب كلمة بحث أخرى أو تصفح جميع الأقسام.",
      emptyAction: "عرض جميع المنتجات",
      featIntro: "// why us",
      featTitle1: "ليش يختارون المتخصصون",
      featTitle2: "MAJOR STORE؟",
      feat1Title: "منتجات مرخصة",
      feat1Text: "كل الأدوات تأتي مرخصة أو من مصادر مفتوحة موثوقة، مع ضمان تفعيل.",
      feat2Title: "تسليم لحظي",
      feat2Text: "تستلم كود التفعيل أو ملف التوزيعة خلال دقائق بعد تأكيد الدفع.",
      feat3Title: "دعم فني حقيقي",
      feat3Text: "فريق متمكن في الأمن السيبراني يقدم دعماً فعلياً عبر Discord.",
      feat4Title: "مدفوعات آمنة",
      feat4Text: "Crypto, PayPal, Bank Card — كل المعاملات تتم بسرية تامة.",
      aboutTitle1: "MAJOR STORE",
      aboutTitle2: "حلول رقمية جاهزة",
      aboutText: "منصة لبيع المنتجات الرقمية القانونية مثل القوالب، الأدوات المكتبية، الحزم التعليمية، والخدمات المساندة للمشاريع الصغيرة والمبدعين.",
      aboutCta: "تواصل معنا",
      newsletterTitle1: "اشترك في",
      newsletterTitle2: "القائمة البريدية",
      newsletterText: "احصل على آخر المنتجات والعروض مباشرة في بريدك.",
      newsletterPh: "your@email.com",
      newsletterBtn: "اشترك",
      newsletterMsg: "تم الاشتراك بنجاح — شكراً لك ✦",
      footerText: "Cybersecurity tools for professionals.",
      copyright: "جميع الحقوق محفوظة.",
      cartHead: "سلة التسوق",
      cartEmpty: "السلة فارغة",
      cartEmptyText: "أضف منتجاتك وستظهر هنا.",
      cartBrowse: "تصفح المنتجات",
      cartTotal: "الإجمالي",
      cartCheckout: "إكمال الطلب",
      cartIn: "✓ في السلة",
      cartAdd: "＋ أضف للسلة",
      cartAddFull: "إضافة إلى السلة",
      cartStock: "موجود في المخزون",
      cartQty: "الكمية",
      cartView: "view",
      cartClose: "×",
      cartRemove: "حذف",
      toastAdded: "تمت الإضافة للسلة",
      toastRequired: "يرجى استكمال الحقول المطلوبة",
      toastCouponInvalid: "كود الخصم غير صحيح",
      toastOrderOk: "تم استلام طلبك {id}، سنتواصل معك قريباً",
      toastOrderEmpty: "السلة فارغة",
      checkoutTitle: "إكمال الطلب",
      checkoutName: "الاسم الكامل",
      checkoutNamePh: "اسمك الكامل",
      checkoutPhone: "رقم الهاتف",
      checkoutPhonePh: "07 xx xx xx xx",
      checkoutEmail: "البريد الإلكتروني",
      checkoutEmailPh: "you@example.com",
      checkoutCountry: "البلد",
      checkoutCountryPh: "مثال: الجزائر",
      proofLabel: "إثبات الدفع (سكرين شوت / صورة العملية)",
      proofHint: "بعد إتمام الدفع، التقط صورة أو سكرين شوت للعملية وأرفقها هنا — يستلمها صاحب المتجر للتأكد.",
      proofUpload: "📷 إرفاق صورة",
      proofRemove: "إزالة",
      proofInvalid: "الملف غير صالح — يجب أن يكون صورة",
      proofAttached: "تم إرفاق إثبات الدفع",
      admProof: "إثبات الدفع",
      admOrderProof: "الإثبات",
      payNoConfig: "سيتم إرسال تفاصيل الدفع بعد تأكيد الطلب.",
      checkoutPayment: "طريقة الدفع",
      checkoutNote: "ملاحظات",
      checkoutNotePh: "أي تفاصيل...",
      checkoutTot: "المجموع",
      checkoutSubmit: "تأكيد وتسليم",
      checkoutNoteMsg: "سيتواصل معك خلال دقائق لتأكيد التسليم.",
      couponPlaceholder: "كود الخصم (اختياري)",
      couponApply: "تطبيق الخصم",
      couponApplied: "تم تطبيق الخصم",
      contactTitle: "راسلنا",
      contactName: "الاسم",
      contactEmail: "البريد الإلكتروني",
      contactMessage: "رسالتك",
      contactSubmit: "إرسال الرسالة",
      contactSuccess: "تم إرسال رسالتك بنجاح، سنرد عليك قريباً.",
      contactRequired: "يرجى كتابة الاسم والرسالة",
      contactSending: "جارٍ إرسال رسالتك...",
      contactFail: "تعذر إرسال الرسالة، تحقق من الاتصال وحاول مجدداً.",
      toastCloudFail: "تعذرت مزامنة الطلب مع الخادم، لكنه محفوظ محلياً.",
      supportButton: "تواصل معنا",
      quickView: "عرض سريع",
      addrLabel: "العنوان",
      hours24: "24/7",
      esc: "esc",
      operatorCmd: "$",
      // Admin panel translations
      admAuthTitle: "login()",
      admAuthSub: "أدخل بياناتك للوصول إلى لوحة الإدارة.",
      admAuthHint: "🔒 محمية بالكامل — يلزم اسم مستخدم وكلمة مرور حقيقيان.<br />إذا لم تُنشئ مستخدم الإدارة بعد، شغّل <b>create-admin-user.sql</b> في Supabase → SQL Editor،<br />ثم سجّل الدخول بـ: <b>User:</b> admin &nbsp;·&nbsp; <b>Pass:</b> كلمة السر التي ضبطتها هناك.<br />إذا ظهر 'User already registered' فكلمة السر فقط هي التي يجب تصحيحها.",
      admBackStore: "← العودة إلى MAJOR STORE",
      admSideMain: "// main",
      admSideStorefront: "// storefront",
      admNavOverview: "نظرة عامة",
      admNavProducts: "المنتجات",
      admNavCategories: "الأقسام",
      admNavCoupons: "الكوبونات",
      admNavPayments: "المدفوعات",
      admNavHomepage: "الواجهة",
      admNavSections: "الأقسام المعروضة",
      admNavOrders: "الطلبات",
      admNavMessages: "الرسائل",
      admNavSettings: "الإعدادات",
      admOpenStore: "↗ فتح المتجر",
      admLogout: "⇥ خروج",
      admPageTitle: "نظرة عامة",
      admWelcomeTitle: "مرحباً بعودتك، <em>root</em>",
      admWelcomeSub: "إليك ملخص سريع لعمليات MAJOR STORE اليوم.",
      admHello: "// hello admin",
      admRecent: "// recent activity",
      admViewAll: "عرض الكل ←",
      admQuickActions: "// quick actions",
      admQuickHeader: "ماذا الآن؟",
      admQAAddProduct: "إضافة منتج",
      admQAAddProductSub: "أضف منتجاً جديداً للمتجر",
      admQAPayments: "طرق الدفع",
      admQAPaymentsSub: "تخصيص طرق الكريبتو والعملات الورقية",
      admQASettings: "الإعدادات",
      admQASettingsSub: "الهوية وبيانات التواصل",
      admRecentOrders: "الطلبات الأخيرة",
      admNoOrders: "// لا طلبات بعد<br /><small>ستظهر الطلبات هنا فور وصولها.</small>",
      admProductsCatalog: "// catalog",
      admProductsH: "المنتجات",
      admProductsP: "أضف، حرر، احذف أو فعّل المنتجات. الأسعار بالدولار فقط.",
      admNewProduct: "＋ منتج جديد",
      admSearchProducts: "ابحث في المنتجات...",
      admSortNew: "الأحدث أولاً",
      admSortLow: "السعر ↑",
      admSortHigh: "السعر ↓",
      admMetricProducts: "المنتجات",
      admMetricActive: "مفعلة",
      admMetricOrders: "الطلبات",
      admMetricTotal: "إجمالي",
      admMetricPending: "قيد الانتظار",
      admMetricAction: "تحتاج إجراء",
      admMetricRevenue: "الإيرادات",
      admMetricUSD: "بالدولار",
      admCategoryOrg: "// organization",
      admCategoryH: "الأقسام",
      admCategoryP: "تحكم بالأقسام التي تظهر في المتجر.",
      admCurrentCats: "الأقسام الحالية",
      admAddNewCat: "إضافة قسم جديد",
      admCategoriesLabel: "اسم (AR / EN)",
      admIconLabel: "أيقونة",
      admColorLabel: "لون",
      admAddCategoryBtn: "إضافة القسم",
      admCategoriesCount: "قسم",
      admCouponsDisc: "// discounts",
      admCouponsH: "الكوبونات",
      admCouponsP: "أنشئ أكواد خصم يطبّقها الزبون عند الطلب (نسبة مئوية أو مبلغ ثابت USD).",
      admAddCoupon: "إضافة كوبون",
      admCurrentCoupons: "الكوبونات الحالية",
      admCouponCode: "الكود",
      admCouponType: "النوع",
      admCouponValue: "القيمة",
      admCouponPct: "نسبة مئوية %",
      admCouponFixed: "مبلغ ثابت $",
      admCouponActive: "مفعّل",
      admCouponStateOn: "مفعّل",
      admCouponStateOff: "معطل",
      admPaymentsCh: "// checkout",
      admPaymentsH: "المدفوعات والكريبتو",
      admPaymentsP: "أدِر طرق الدفع، واضبط شبكات العملات الرقمية + رموز QR المعروضة للزبائن.",
      admPayMethodsLabel: "طرق الدفع (واحد في كل سطر)",
      admPayMethodsHint: "Crypto, FIAT, محفظات إلكترونية. أمثلة: \"Bitcoin (BTC)\", \"USDT (BEP20)\", \"PayPal\"",
      admPaysPlace: "Bitcoin (BTC)\nUSDT (BEP20)\nPayPal",
      admSavePays: "حفظ طرق الدفع",
      admCryptoD: "// crypto details",
      admCryptoH: "شبكات الكريبتو ورموز QR",
      admCryptoP: "لكل عملة كريبتو، أضف شبكة أو أكثر (مثل BSC — BNB Smart Chain (BEP20))، عنوان محفظة، وصورة QR اختيارية. يختار الزبون الشبكة عند الدفع.",
      admSaveCrypto: "حفظ إعدادات الكريبتو",
      admAddCryptoCfg: "＋ إضافة إعدادات لعملة",
      admStorefrontS: "// storefront",
      admHomepageH: "الواجهة والنصوص",
      admHomepageP: "حدّث نصوص الصفحة الرئيسية. يجب ملء النسختين العربية والإنجليزية.",
      admSaveHome: "حفظ التغييرات",
      admSectionsH: "الأقسام المعروضة",
      admSectionsP: "أظهر/أخفِ كل قسم في الصفحة الرئيسية وحرر محتواه بالعربية والإنجليزية.",
      admSaveSections: "حفظ الأقسام",
      admShowHide: "إظهار / إخفاء الأقسام",
      admShowHideSub: "Hero • الأقسام • المتجر • المزايا • من نحن • المدفوعات • النشرة",
      admHeroHide: "Hero",
      admCatHide: "الأقسام",
      admShopHide: "المتجر",
      admFeatHide: "المزايا",
      admAboutHide: "من نحن",
      admPayHide: "طرق الدفع",
      admNewsletterHide: "النشرة / التواصل",
      admHeroBullets: "نقاط الـ Hero (4)",
      admFeatSection: "بطاقات المزايا (4)",
      admAboutSection: "قسم 'من نحن'",
      admHeroStats: "إحصائيات الـ Hero (3)",
      admTitleArEn: "Hero ونصوص الصفحة الرئيسية — AR / EN",
      admSales: "// sales",
      admOrdersH: "الطلبات",
      admOrdersP: "راجع طلبات الزبائن وحدّث حالاتها.",
      admClearOrders: "مسح الكل",
      admThOrder: "الطلب",
      admThClient: "العميل",
      admThAddress: "العنوان",
      admThTotal: "الإجمالي",
      admThPayment: "طريقة الدفع",
      admThStatus: "الحالة",
      admNoOrdersTab: "لا توجد طلبات بعد.",
      admInbox: "// inbox",
      admMessagesH: "الرسائل",
      admMessagesP: "رسائل الزبائن من زر التواصل في المتجر. رد، ضع done، أو احذف.",
      admNoMessages: "لا توجد رسائل بعد.",
      admReply: "↩ رد",
      admReplyBtn: "رد",
      admDone: "تم",
      admWriteReply: "اكتب رداً...",
      admStatusNew: "جديد",
      admStatusReplied: "تم الرد",
      admStatusDone: "منتهي",
      admBrandIden: "// brand",
      admSettingsH: "الإعدادات",
      admSettingsP: "الهوية وبيانات التواصل. الأسعار بالدولار USD فقط.",
      admIdentity: "الهوية",
      admContact: "التواصل",
      admSaveSettings: "حفظ الإعدادات",
      admSzBrand: "اسم المتجر",
      admSzCurrency: "العملة",
      admSzSubAR: "العنوان الفرعي (AR)",
      admSzSubEN: "العنوان الفرعي (EN)",
      admSzFooterAR: "تذييل (AR)",
      admSzFooterEN: "تذييل (EN)",
      admSzPhone: "الهاتف",
      admSzWhatsapp: "واتساب",
      admSzEmail: "البريد الإلكتروني",
      admSzAddrAR: "العنوان (AR)",
      admSzAddrEN: "العنوان (EN)",
      admSzDiscord: "رابط Discord",
      admSzAnnEnabled: "تفعيل شريط الإعلان",
      admSzAnnAR: "نص الإعلان (AR)",
      admSzAnnEN: "نص الإعلان (EN)",
      admCategoryNamePhAR: "اختبار تطبيقات الويب",
      admCategoryNamePhEN: "Website templates",
      admCatTagAR: "tagline (AR)",
      admCatTagEN: "tagline (EN)",
      admCatTagPhAR: "أدوات احترافية",
      admCatTagPhEN: "Professional tools",
      admStatusPending: "قيد الانتظار",
      admStatusConfirmed: "مؤكد",
      admStatusShipped: "تم الشحن",
      admStatusDelivered: "تم التسليم",
      admStatusCancelled: "ملغي",
      admPcHash: "coupon: ",
      admPcFrom1: "من ",
      admPcNote: "ملاحظة: ",
      admChTitle: "new product",
      admChTitleEdit: "edit product",
      admCancel: "إلغاء",
      admSaveProduct: "حفظ المنتج",
      admNewProductE: "منتج جديد",
      admCatIden: "اسم المعرف",
      admCatUiAR: "🇸🇦 AR",
      admCatUiEN: "🇬🇧 EN",
      admEditorBadgeAR: "شارة (AR)",
      admEditorBadgeEN: "شارة (EN)",
      admEditorBadgePhAR: "الأكثر مبيعاً",
      admEditorBadgePhEN: "Best seller",
      admEditorImageUrl: "رابط الصورة (اختياري)",
      admEditorImagePh: "https://...",
      admPdtCategory: "القسم",
      admPdtPrice: "السعر USD",
      admPdtOldPrice: "السعر القديم",
      admPdtStock: "المخزون",
      admPdtIcon: "الأيقونة",
      admPdtColor: "اللون",
      admPdtName: "الاسم",
      admPdtTagline: "العنوان الفرعي",
      admPdtDesc: "الوصف",
      admCloudFail: "فشل رفع البيانات إلى السحابة — محفوظ محلياً فقط",
      admToastSyncOk: "✓ تم النشر في السحابة ({n} منتج، {c} قسم)",
      admToastSyncErr: "✗ فشل النشر في السحابة",
      admPublishBtn: "↑ نشر الآن",
      admCloudReady: "السحابة جاهزة",
      admCloudOnline: "السحابة متصلة",
      admCloudLocal: "وضع محلي فقط",
      admCloudSyncing: "جاري المزامنة...",
      admLivePreview: "معاينة مباشرة ↗",
      admRootAccess: "صلاحيات إدارية",
      admEditorCD: "// catalog",
      admNoCoupon: "// لا توجد كوبونات بعد.",
      admCouponAdded: "✓ تمت إضافة الكوبون {code}",
      admCouponDel: "✓ تم حذف الكوبون",
      admProductAdded: "✓ تمت إضافة المنتج",
      admProductUpdated: "✓ تم تحديث المنتج ($",
      admProductDel: "✓ تم حذف المنتج",
      admCatAdded: "✓ تمت إضافة القسم",
      admCatDel: "✓ تم حذف القسم",
      admOrderDel: "✓ تم حذف الطلب",
      admStatusChanged: "✓ الحالة: ",
      admPaySaved: "تم الحفظ",
      admHomeSaved: "تم الحفظ",
      admSecSaved: "تم الحفظ",
      admSetSaved: "تم الحفظ",
      admReplyFailed: "فشل الرد",
      admUpdateFailed: "فشل التحديث",
      admDeleteFailed: "فشل الحذف",
      admContactMsg: "تواصل مباشرة",
      admDeleteMsg: "حذف الرسالة",
      admDeleteConfirm: "هل تريد حذف هذه الرسالة نهائياً؟",
      admMessageDeleted: "✓ تم حذف الرسالة",
      admNoContact: "لا يوجد بريد إلكتروني للتواصل مع صاحب الرسالة",
      admPayCount: "✓ تم حفظ {n} طريقة دفع",
      admValidCode: "أكمل الكود والقيمة",
      admExistsCode: "الكوبون موجود مسبقاً",
      admPriceRequired: "أدخل السعر (USD)",
      admNameRequired: "أدخل الاسم",
      admTxt: "homepage copy (AR + EN)",
      admHomeSavedToast: "✓ تم حفظ الصفحة الرئيسية (AR + EN)",
      admPhotoshop: "✓ تم حفظ الأقسام",
      admTypePercent: "نسبة %",
      admTypeFixed: "مبلغ $",
      admCouponActiveCh: "مفعّل",
      admLoginFail: "// ACCESS DENIED — بيانات اعتماد خاطئة. إذا لم تُنشئ مستخدم الإدارة، شغّل create-admin-user.sql في Supabase > Authentication > Users.",
      admErr401: "// رمز الدخول منتهي أو خاطئ — اضغط خروج وسجّل الدخول مجدداً.",
      admErrNetwork: "// لا اتصال بـ Supabase — تحقق من الإنترنت.",
      admAccessDenied: "// ACCESS DENIED",
      admCurrencyLabel: "العملة",
      admCurrencyVal: "USD — $",
      admSavePH: "حفظ الصفحة",
      admBtnCloseEditor: "إلغاء",
      admLogoText: "MAJOR STORE",
      admLogoSub: "لوحة الإدارة",
      admProductBadge: "منتفع",
      admCat0: "// لا توجد منتجات مطابقة لبحثك.",
      admBrandCh: "اسم المتجر",
      admPHRequired: "أدخل كلمة السر الحقيقية لمستخدم Supabase المُنشأ.",
      admPasteHere: "log in",
      admLiveP: "معاينة ↗",
      admLogBtn: "⇥",
      
      admPanelProductsTitle: "المنتجات",
      admPanelProductsDesc: "أضف، عدل، احذف أو فعّل/عطّل المنتجات. الأسعار بالدولار.",
      admPanelCategoriesTitle: "التصنيفات",
      admPanelCategoriesDesc: "تحكم في التصنيفات التي تظهر في واجهة المتجر.",
      admPanelCouponsTitle: "كوبونات الخصم",
      admPanelCouponsDesc: "أنشئ رموز خصم يمكن للزبائن استخدامها عند الدفع (نسبة أو مبلغ ثابت).",
      admPanelPaymentsTitle: "طرق الدفع والكريبتو",
      admPanelPaymentsDesc: "أدِر طرق الدفع، واضبط شبكات العملات الرقمية + رموز QR المعروضة للزبائن.",
      admPanelOrdersTitle: "الطلبات",
      admPanelOrdersDesc: "راجع طلبات الزبائن وحدّث حالتها.",
      admPanelMessagesTitle: "الرسائل",
      admPanelMessagesDesc: "رسائل الزوار من زر الاتصال في المتجر. رد، علّم كمكتمل، أو احذف.",
      admPanelSettingsTitle: "الإعدادات",
      admPanelSettingsDesc: "الهوية، معلومات الاتصال والعملة. الأسعار بالدولار فقط.",
      admPanelEyebrowCatalog: "// الكتالوج",
      admPanelEyebrowOrg: "// التنظيم",
      admPanelEyebrowDiscounts: "// الخصومات",
      admPanelEyebrowCheckout: "// الدفع",
      admPanelEyebrowOrders: "// المبيعات",
      admPanelEyebrowMessages: "// صندوق الوارد",
      admPanelEyebrowSettings: "// العلامة التجارية",

      
      admPublishProducts: "↑ انشر للسحابة",
      admSortNew: "الأحدث أولاً",
      admSortLow: "السعر ↑",
      admSortHigh: "السعر ↓",
      admSortOld: "الأقدم أولاً",

      
      admPublishBtn: "انشر ☁️",
      admPublishReminder: "⚠️ لديك تغييرات غير منشورة. اضغط <strong>انشر</strong> لتظهر للزبائن.",
      admPublishTitle: "انشر كل التغييرات إلى السحابة ليتمكن الزوار من رؤيتها",
      admQAPublish: "انشر للتخزين السحابي",
      admQAPublishSub: "مزامنة كل البيانات لتظهر للزوار",
      admNoMessages: "// لا توجد رسائل بعد.",
      admNoOrders: "// لا توجد طلبات بعد.",
      admOrderId: "الطلب",
      admOrderCustomer: "الزبون",
      admOrderDetails: "التفاصيل",
      admOrderTotal: "المجموع",
      admOrderPayment: "الدفع",
      admOrderStatus: "الحالة",
      admCurrentCoupons: "الكوبونات الحالية",
      admCryptoTitle: "شبكات الكريبتو + QR",
      admCryptoHint: "ضبط عناوين المحافظ ورموز QR لكل طريقة كريبتو.",
      admCryptoAdd: "＋ إضافة إعدادات طريقة",
      admCryptoSave: "حفظ إعدادات الكريبتو",
      admPanelHomepageTitle: "محرر الصفحة الرئيسية",
      admPanelHomepageDesc: "تعديل القسم الرئيسي، زر الدعوة، والمحتوى المميز.",
      admPanelSectionsTitle: "الأقسام",
      admPanelSectionsDesc: "تشغيل/إيقاف الأقسام التي تظهر في واجهة المتجر.",
      admHomeAR: "🇸🇦 العربية",
      admHomeEN: "🇬🇧 الإنجليزية",
      admHomeBadge: "الشارة",
      admHomeTitle: "العنوان",
      admHomeText: "النص",
      admHomeCta: "زر الدعوة",
      admHomeSecondary: "الرابط الثانوي",
      admHomeSave: "حفظ الصفحة الرئيسية",
      admSecSave: "حفظ الأقسام",
      admSetBrand: "العلامة التجارية",
      admSetStoreName: "اسم المتجر",
      admSetSubtitle: "العنوان الفرعي",
      admSetFooter: "التذييل",
      admSetContact: "الاتصال",
      admSetPhone: "الهاتف",
      admSetWhatsapp: "واتساب",
      admSetEmail: "البريد الإلكتروني",
      admSetDiscord: "رابط دعوة ديسكورد",
      admSetAddress: "العنوان",
      admSetAddrAR: "العنوان (عربي)",
      admSetAddrEN: "العنوان (إنجليزي)",
      admSetAnnouncement: "شريط الإعلان",
      admSetAnnounceEnable: "تفعيل الإعلان",
      admSetAnnounceAR: "النص (عربي)",
      admSetAnnounceEN: "النص (إنجليزي)",
      admSetBtn: "حفظ الإعدادات",
      admEditorSave: "حفظ المنتج",
      admEditorCancel: "إلغاء",
      admAuthLogin: "تسجيل الدخول",
      admAuthEnter: "أدخل بيانات الدخول للوصول إلى لوحة التحكم",
      admAuthEmail: "البريد أو اسم المستخدم",
      admAuthEmailPh: "admin@majorstore.store",
      admAuthPass: "كلمة المرور",
      admAuthPassPh: "••••••••",
      admAuthBtn: "→ تسجيل الدخول $",
      admAuthHintFull: "// لست بحاجة لإعداد؟ قم بتشغيل <b>create-admin-user.sql</b> في محرر SQL في Supabase، ثم سجل الدخول بـ <b>admin@majorstore.store</b>",
      admLivePreview: "معاينة حية ↗",

      admAddCouponBtn: "إضافة كوبون",
      admPdtImage: "رابط الصورة",
      admPdtBadge: "الشارة",
      pillAll: "الكل",
      paySelectNetwork: "اختر الشبكة",
      payNetwork: "الشبكة",
      payAddressLabel: "العنوان",
      payCopy: "نسخ",
      payCopied: "تم النسخ ✓",
      payScanQr: "امسح رمز QR للدفع",
      payNoDetails: "لم يتم إعداد تفاصيل الدفع لهذه الطريقة بعد",
      paySendNote: "أرسل المبلغ بالضبط ثم ضع رمز العملية في الملاحظات أدناه.",
      payTitle1: "طرق الدفع",
      payTitle2: "المتاحة",
      payText: "جميع المعاملات تتم بخصوصية كاملة، عبر شبكات دفع آمنة ومعتمدة عالمياً."
    },
    en: {
      siteTitle: "MAJOR STORE",
      siteSub: "Digital products, software & practical tools",
      navShop: "Shop",
      navCats: "Categories",
      navAbout: "About",
      navContact: "Contact",
      navAdmin: "Admin",
      searchPh: "Search templates, tools, files...",
      heroBadge: "Digital Products · Templates · Courses",
      heroLine1: "Digital Products",
      heroLine1Accent: "Tools",
      heroLine2: "& Cybersecurity Programs",
      heroText: "Licensed software, ready-made templates, digital downloads and practical courses — everything you need in one place.",
      heroCta: "Browse products",
      heroSecondary: "Contact support",
      statClients: "Pro clients",
      statGuarantee: "Products guarantee",
      statSupport: "Tech support",
      bullet1: "Instant delivery",
      bullet2: "Guaranteed quality",
      bullet3: "Discord support",
      bullet4: "Crypto payments",
      sectionCategories: "// Categories",
      sectionAll: "All products",
      sectionAllCount: "items",
      sectionShop: "// let products = filteredList;",
      sectionShopTitle1: "Pro",
      sectionShopTitle2: "tools",
      resultCount: "products",
      sortFeatured: "Featured",
      sortLow: "Price: Low to High",
      sortHigh: "Price: High to Low",
      sortRating: "Top rated",
      emptyTitle: "No results found",
      emptyText: "Try another keyword or browse all categories.",
      emptyAction: "Show all products",
      featIntro: "// why us",
      featTitle1: "Why professionals choose",
      featTitle2: "MAJOR STORE?",
      feat1Title: "Licensed products",
      feat1Text: "Every tool is licensed or comes from a trusted open-source project, with activation guarantee.",
      feat2Title: "Instant delivery",
      feat2Text: "You get the activation code or distro file within minutes after payment confirmation.",
      feat3Title: "Real tech support",
      feat3Text: "Cybersecurity experts ready to help you via Discord — pre and post purchase.",
      feat4Title: "Secure payments",
      feat4Text: "Crypto, PayPal, Visa/Master — every transaction is fully private.",
      aboutTitle1: "MAJOR STORE",
      aboutTitle2: "Ready-to-use digital solutions",
      aboutText: "A legal digital storefront for templates, productivity tools, educational bundles and support services for small businesses and creators.",
      aboutCta: "Contact us",
      newsletterTitle1: "Subscribe to",
      newsletterTitle2: "our newsletter",
      newsletterText: "Be the first to get new products, offers and updates.",
      newsletterPh: "your@email.com",
      newsletterBtn: "Subscribe",
      newsletterMsg: "Subscribed — check your inbox ✦",
      footerText: "Cybersecurity tools for professionals.",
      copyright: "All rights reserved.",
      cartHead: "Shopping cart",
      cartEmpty: "Your cart is empty",
      cartEmptyText: "Add some products and they'll show up here.",
      cartBrowse: "Browse products",
      cartTotal: "Total",
      cartCheckout: "Checkout",
      cartIn: "✓ in cart",
      cartAdd: "＋ Add",
      cartAddFull: "Add to cart",
      cartStock: "In stock",
      cartQty: "Qty",
      cartView: "view",
      cartClose: "×",
      cartRemove: "Remove",
      toastAdded: "Added to cart",
      toastRequired: "Please complete all required fields",
      toastCouponInvalid: "Invalid coupon code",
      toastOrderOk: "Order {id} received, we will contact you soon",
      toastOrderEmpty: "Cart is empty",
      checkoutTitle: "Checkout",
      checkoutName: "Full name",
      checkoutNamePh: "Your full name",
      checkoutPhone: "Phone",
      checkoutPhonePh: "07 xx xx xx xx",
      checkoutEmail: "Email",
      checkoutEmailPh: "you@example.com",
      checkoutCountry: "Country",
      checkoutCountryPh: "e.g. Algeria",
      proofLabel: "Payment proof (screenshot / transaction photo)",
      proofHint: "After paying, take a photo or screenshot of the transaction and attach it here — the store owner receives it for verification.",
      proofUpload: "📷 Attach image",
      proofRemove: "Remove",
      proofInvalid: "Invalid file — please attach an image",
      proofAttached: "Payment proof attached",
      admProof: "Payment proof",
      admOrderProof: "Proof",
      payNoConfig: "Payment details will be sent after order confirmation.",
      checkoutPayment: "Payment method",
      checkoutNote: "Notes",
      checkoutNotePh: "Any details...",
      checkoutTot: "Total",
      checkoutSubmit: "Confirm & deliver",
      checkoutNoteMsg: "We will contact you within minutes to confirm delivery.",
      couponPlaceholder: "Coupon code (optional)",
      couponApply: "Apply",
      couponApplied: "Coupon applied",
      contactTitle: "Contact us",
      contactName: "Name",
      contactEmail: "Email",
      contactMessage: "Your message",
      contactSubmit: "Send message",
      contactSuccess: "Your message has been sent successfully. We will reply soon.",
      contactRequired: "Please enter your name and message",
      contactSending: "Sending your message...",
      contactFail: "Could not send the message. Check your connection and try again.",
      toastCloudFail: "Could not sync the order with the server, but it is saved locally.",
      supportButton: "Contact us",
      quickView: "Quick view",
      addrLabel: "Address",
      hours24: "24/7",
      esc: "esc",
      operatorCmd: "$",
      // Admin panel translations
      admAuthTitle: "login()",
      admAuthSub: "Enter your credentials to access the admin panel.",
      admAuthHint: "🔒 Protected — real credentials are required.<br />No user created yet? Run <b>create-admin-user.sql</b> in Supabase → SQL Editor,<br />then log in with: <b>User:</b> admin &nbsp;·&nbsp; <b>Pass:</b> the password you set there.<br />If it says 'User already registered', only the password is wrong.",
      admBackStore: "← back to MAJOR STORE",
      admSideMain: "// main",
      admSideStorefront: "// storefront",
      admNavOverview: "Overview",
      admNavProducts: "Products",
      admNavCategories: "Categories",
      admNavCoupons: "Coupons",
      admNavPayments: "Payments",
      admNavHomepage: "Hero",
      admNavSections: "Sections",
      admNavOrders: "Orders",
      admNavMessages: "Messages",
      admNavSettings: "Settings",
      admOpenStore: "↗ open store",
      admLogout: "⇥ logout",
      admPageTitle: "Overview",
      admWelcomeTitle: "Welcome back, <em>root</em>",
      admWelcomeSub: "Here's a quick summary of MAJOR STORE operations today.",
      admHello: "// hello admin",
      admRecent: "// recent activity",
      admViewAll: "view all →",
      admQuickActions: "// quick actions",
      admQuickHeader: "what now?",
      admQAAddProduct: "add product",
      admQAAddProductSub: "add new product to the storefront",
      admQAPayments: "payment methods",
      admQAPaymentsSub: "tweak crypto & fiat methods",
      admQASettings: "settings",
      admQASettingsSub: "identity & contact details",
      admRecentOrders: "Recent orders",
      admNoOrders: "// no orders yet<br /><small>you'll see orders here as they arrive.</small>",
      admProductsCatalog: "// catalog",
      admProductsH: "Products",
      admProductsP: "Add, edit, delete or toggle products. Prices in USD only.",
      admNewProduct: "＋ new product",
      admSearchProducts: "search products...",
      admSortNew: "newest first",
      admSortLow: "price ↑",
      admSortHigh: "price ↓",
      admMetricProducts: "Products",
      admMetricActive: "active",
      admMetricOrders: "Orders",
      admMetricTotal: "total",
      admMetricPending: "Pending",
      admMetricAction: "needs action",
      admMetricRevenue: "Revenue",
      admMetricUSD: "in USD",
      admCategoryOrg: "// organization",
      admCategoryH: "Categories",
      admCategoryP: "Control what categories appear in the storefront.",
      admCurrentCats: "current categories",
      admAddNewCat: "add new category",
      admCategoriesLabel: "name (AR / EN)",
      admIconLabel: "icon",
      admColorLabel: "color",
      admAddCategoryBtn: "add category",
      admCategoriesCount: "categories",
      admCouponsDisc: "// discounts",
      admCouponsH: "Coupons",
      admCouponsP: "Create discount codes customers can apply at checkout (percent or fixed USD).",
      admAddCoupon: "add coupon",
      admCurrentCoupons: "current coupons",
      admCouponCode: "code",
      admCouponType: "type",
      admCouponValue: "value",
      admCouponPct: "percent %",
      admCouponFixed: "fixed $",
      admCouponActive: "active",
      admCouponStateOn: "active",
      admCouponStateOff: "off",
      admPaymentsCh: "// checkout",
      admPaymentsH: "Payments & Crypto",
      admPaymentsP: "Manage the payment methods, and configure crypto networks + QR codes shown to customers.",
      admPayMethodsLabel: "Payment methods (one per line)",
      admPayMethodsHint: "Include Crypto, FIAT, E-Wallets. Examples: \"Bitcoin (BTC)\", \"USDT (BEP20)\", \"PayPal\"",
      admPaysPlace: "Bitcoin (BTC)\nUSDT (BEP20)\nPayPal",
      admSavePays: "save payment methods",
      admCryptoD: "// crypto details",
      admCryptoH: "Crypto networks & QR codes",
      admCryptoP: "For each crypto method, add one or more networks (e.g. BSC — BNB Smart Chain (BEP20)), a wallet address and an optional QR image. The customer picks the network at checkout.",
      admSaveCrypto: "save crypto settings",
      admAddCryptoCfg: "＋ add config for a method",
      admStorefrontS: "// storefront",
      admHomepageH: "Hero & Copy",
      admHomepageP: "Update homepage text. Both Arabic and English versions must be filled.",
      admSaveHome: "save changes",
      admSectionsH: "Sections",
      admSectionsP: "Show/hide every homepage section and edit its content in AR / EN.",
      admSaveSections: "save sections",
      admShowHide: "show / hide sections",
      admShowHideSub: "Hero • Categories • Shop • Features • About • Payments • Newsletter",
      admHeroHide: "Hero",
      admCatHide: "Categories",
      admShopHide: "Shop",
      admFeatHide: "Features",
      admAboutHide: "About",
      admPayHide: "Payment methods",
      admNewsletterHide: "Newsletter / Contact",
      admHeroBullets: "hero bullets (4)",
      admFeatSection: "features (4 cards)",
      admAboutSection: "about section",
      admHeroStats: "hero stats (3)",
      admTitleArEn: "Hero & homepage copy — AR / EN",
      admSales: "// sales",
      admOrdersH: "Orders",
      admOrdersP: "Review customer orders and update their status.",
      admClearOrders: "clear all",
      admThOrder: "order",
      admThClient: "client",
      admThAddress: "address",
      admThTotal: "total",
      admThPayment: "payment",
      admThStatus: "status",
      admNoOrdersTab: "no orders yet.",
      admInbox: "// inbox",
      admMessagesH: "Messages",
      admMessagesP: "Visitor messages from the storefront contact button. Reply, mark done, or delete.",
      admNoMessages: "no messages yet.",
      admReply: "↩ reply",
      admReplyBtn: "reply",
      admDone: "done",
      admWriteReply: "write reply...",
      admStatusNew: "new",
      admStatusReplied: "replied",
      admStatusDone: "done",
      admBrandIden: "// brand",
      admSettingsH: "Settings",
      admSettingsP: "Identity, contact details & currency. Prices are USD only.",
      admIdentity: "identity",
      admContact: "contact",
      admSaveSettings: "save settings",
      admSzBrand: "brand",
      admSzCurrency: "currency",
      admSzSubAR: "subtitle (AR)",
      admSzSubEN: "subtitle (EN)",
      admSzFooterAR: "footer (AR)",
      admSzFooterEN: "footer (EN)",
      admSzPhone: "phone",
      admSzWhatsapp: "whatsapp",
      admSzEmail: "email",
      admSzAddrAR: "address (AR)",
      admSzAddrEN: "address (EN)",
      admSzDiscord: "discord link",
      admSzAnnEnabled: "enable announcement bar",
      admSzAnnAR: "announcement (AR)",
      admSzAnnEN: "announcement (EN)",
      admCategoryNamePhAR: "قوالب مواقع AR",
      admCategoryNamePhEN: "Website templates",
      admCatTagAR: "tagline (AR)",
      admCatTagEN: "tagline (EN)",
      admCatTagPhAR: "Professional tools (AR)",
      admCatTagPhEN: "Professional tools",
      admStatusPending: "pending",
      admStatusConfirmed: "confirmed",
      admStatusShipped: "shipped",
      admStatusDelivered: "delivered",
      admStatusCancelled: "cancelled",
      admPcHash: "coupon: ",
      admPcFrom1: "from ",
      admPcNote: "note: ",
      admChTitle: "new product",
      admChTitleEdit: "edit product",
      admCancel: "cancel",
      admSaveProduct: "save product",
      admNewProductE: "new product",
      admCatIden: "id name",
      admCatUiAR: "🇸🇦 AR",
      admCatUiEN: "🇬🇧 EN",
      admEditorBadgeAR: "badge (AR)",
      admEditorBadgeEN: "badge (EN)",
      admEditorBadgePhAR: "Best seller AR",
      admEditorBadgePhEN: "Best seller",
      admEditorImageUrl: "image url (optional)",
      admEditorImagePh: "https://...",
      admPdtCategory: "category",
      admPdtPrice: "price USD",
      admPdtOldPrice: "old price",
      admPdtStock: "stock",
      admPdtIcon: "icon",
      admPdtColor: "color",
      admPdtName: "name",
      admPdtTagline: "tagline",
      admPdtDesc: "description",
      admCloudFail: "Cloud sync failed — saved locally only",
      admToastSyncOk: "✓ published to cloud ({n} products, {c} categories)",
      admToastSyncErr: "✗ cloud publish FAILED",
      admPublishBtn: "↑ publish now",
      admCloudReady: "cloud sync: ready",
      admCloudOnline: "cloud sync: online",
      admCloudLocal: "local only",
      admCloudSyncing: "syncing…",
      admLivePreview: "live preview ↗",
      admRootAccess: "root access",
      admEditorCD: "// catalog",
      admNoCoupon: "// no coupons yet.",
      admCouponAdded: "✓ coupon {code} added",
      admCouponDel: "✓ coupon deleted",
      admProductAdded: "✓ product added",
      admProductUpdated: "✓ product updated ($",
      admProductDel: "✓ product deleted",
      admCatAdded: "✓ category added",
      admCatDel: "✓ category deleted",
      admOrderDel: "✓ order deleted",
      admStatusChanged: "✓ status: ",
      admPaySaved: "saved",
      admHomeSaved: "saved",
      admSecSaved: "saved",
      admSetSaved: "saved",
      admReplyFailed: "reply failed",
      admUpdateFailed: "update failed",
      admDeleteFailed: "delete failed",
      admContactMsg: "contact directly",
      admDeleteMsg: "delete message",
      admDeleteConfirm: "Delete this message permanently?",
      admMessageDeleted: "✓ message deleted",
      admNoContact: "This message has no email address",
      admPayCount: "✓ {n} payment methods saved",
      admValidCode: "complete code & value",
      admExistsCode: "coupon already exists",
      admPriceRequired: "complete price (USD)",
      admNameRequired: "complete name",
      admTxt: "homepage copy (AR + EN)",
      admHomeSavedToast: "✓ homepage copy saved (AR + EN)",
      admPhotoshop: "✓ sections saved",
      admTypePercent: "percent %",
      admTypeFixed: "fixed $",
      admCouponActiveCh: "active",
      admLoginFail: "// ACCESS DENIED — invalid credentials.",
      admErr401: "// session expired or invalid — click logout and log in again.",
      admErrNetwork: "// cannot reach Supabase — check your connection.",
      admAccessDenied: "// ACCESS DENIED",
      admCurrencyLabel: "currency",
      admCurrencyVal: "USD — $",
      admSavePH: "save page",
      admBtnCloseEditor: "cancel",
      admLogoText: "MAJOR STORE",
      admLogoSub: "Control Center",
      admProductBadge: "products",
      admCat0: "// no products matching your query.",
      admBrandCh: "brand",
      admPHRequired: "Enter your real Supabase user credentials.",
      admPasteHere: "log in",
      admLiveP: "preview ↗",
      admLogBtn: "⇥",
      
      admPanelProductsTitle: "Products",
      admPanelProductsDesc: "Add, edit, delete or toggle products. Prices in USD.",
      admPanelCategoriesTitle: "Categories",
      admPanelCategoriesDesc: "Control what categories appear in the storefront.",
      admPanelCouponsTitle: "Coupons",
      admPanelCouponsDesc: "Create discount codes customers can apply at checkout (percent or fixed USD).",
      admPanelPaymentsTitle: "Payments & Crypto",
      admPanelPaymentsDesc: "Manage the payment methods, and configure crypto networks + QR codes shown to customers.",
      admPanelOrdersTitle: "Orders",
      admPanelOrdersDesc: "Review customer orders and update their status.",
      admPanelMessagesTitle: "Messages",
      admPanelMessagesDesc: "Visitor messages from the storefront contact button. Reply, mark done, or delete.",
      admPanelSettingsTitle: "Settings",
      admPanelSettingsDesc: "Identity, contact details & currency. Prices are USD only.",
      admPanelEyebrowCatalog: "// catalog",
      admPanelEyebrowOrg: "// organization",
      admPanelEyebrowDiscounts: "// discounts",
      admPanelEyebrowCheckout: "// checkout",
      admPanelEyebrowOrders: "// sales",
      admPanelEyebrowMessages: "// inbox",
      admPanelEyebrowSettings: "// brand",

      
      admPublishProducts: "↑ publish to cloud",
      admSortNew: "newest first",
      admSortLow: "price ↑",
      admSortHigh: "price ↓",
      admSortOld: "oldest first",

      
      admPublishBtn: "Publish ☁️",
      admPublishReminder: "⚠️ You have unsaved changes. Click <strong>Publish</strong> to make them visible.",
      admPublishTitle: "Publish all changes to the cloud so visitors can see them",
      admQAPublish: "publish to cloud",
      admQAPublishSub: "sync all data so visitors see it",
      admNoMessages: "// no messages yet.",
      admNoOrders: "// no orders yet.",
      admOrderId: "Order",
      admOrderCustomer: "Customer",
      admOrderDetails: "Details",
      admOrderTotal: "Total",
      admOrderPayment: "Payment",
      admOrderStatus: "Status",
      admCurrentCoupons: "Current Coupons",
      admCryptoTitle: "Crypto Networks + QR",
      admCryptoHint: "Configure wallet addresses and QR codes for each crypto method.",
      admCryptoAdd: "＋ add method config",
      admCryptoSave: "save crypto settings",
      admPanelHomepageTitle: "Homepage Editor",
      admPanelHomepageDesc: "Edit the hero section, call-to-action, and featured content.",
      admPanelSectionsTitle: "Sections",
      admPanelSectionsDesc: "Toggle which sections appear on the storefront.",
      admHomeAR: "🇸🇦 Arabic",
      admHomeEN: "🇬🇧 English",
      admHomeBadge: "Badge",
      admHomeTitle: "Title",
      admHomeText: "Text",
      admHomeCta: "CTA Button",
      admHomeSecondary: "Secondary CTA",
      admHomeSave: "Save Homepage",
      admSecSave: "Save Sections",
      admSetBrand: "Brand",
      admSetStoreName: "Store Name",
      admSetSubtitle: "Subtitle",
      admSetFooter: "Footer",
      admSetContact: "Contact",
      admSetPhone: "Phone",
      admSetWhatsapp: "WhatsApp",
      admSetEmail: "Email",
      admSetDiscord: "Discord Invite Link",
      admSetAddress: "Address",
      admSetAddrAR: "Address (AR)",
      admSetAddrEN: "Address (EN)",
      admSetAnnouncement: "Announcement Bar",
      admSetAnnounceEnable: "Enable Announcement",
      admSetAnnounceAR: "Text (AR)",
      admSetAnnounceEN: "Text (EN)",
      admSetBtn: "Save Settings",
      admEditorSave: "Save Product",
      admEditorCancel: "Cancel",
      admAuthLogin: "Login",
      admAuthEnter: "Enter your credentials to access the dashboard",
      admAuthEmail: "Email or username",
      admAuthEmailPh: "admin@majorstore.store",
      admAuthPass: "Password",
      admAuthPassPh: "••••••••",
      admAuthBtn: "→ login $",
      admAuthHintFull: "// Need to set up? Run <b>create-admin-user.sql</b> in Supabase SQL Editor, then log in with <b>admin@majorstore.store</b>",
      admLivePreview: "live preview ↗",

      admAddCouponBtn: "Add coupon",
      admPdtImage: "Image URL",
      admPdtBadge: "Badge",
      pillAll: "All",
      paySelectNetwork: "Select Network",
      payNetwork: "Network",
      payAddressLabel: "Address",
      payCopy: "Copy",
      payCopied: "Copied ✓",
      payScanQr: "Scan the QR code to pay",
      payNoDetails: "No payment details configured yet",
      paySendNote: "Send the exact amount, then paste the transaction code in the notes below.",
      payTitle1: "Payment",
      payTitle2: "Methods",
      payText: "All transactions are fully private, through secure and globally accepted payment networks."
    },

  };

  var DEFAULT_DB = {
  "settings": {
    "brand": "MAJOR STORE",
    "brandSubtitle": {
      "ar": "منتجات رقمية وبرامج وأدوات عملية",
      "en": "Digital products, software & practical tools"
    },
    "announcement": {
      "ar": "⚡ خصومات هذا الأسبوع على القوالب والملفات الرقمية — لفترة محدودة",
      "en": "⚡ Weekly deals on templates and digital downloads — limited time"
    },
    "announcementEnabled": true,
    "heroBadge": {
      "ar": "Digital Products · Templates · Courses",
      "en": "Digital Products · Templates · Courses"
    },
    "heroTitle": {
      "ar": "برامج رقمية||وأدوات عملية||لأصحاب المشاريع والمبدعين",
      "en": "Digital Products||Tools||for Teams & Creators"
    },
    "heroText": {
      "ar": "متجر متخصص في البرامج المرخّصة، القوالب الجاهزة، الملفات الرقمية، والدورات العملية لمساعدة الأعمال والمبدعين على الإنجاز بسرعة.",
      "en": "A curated store for licensed software, ready-made templates, digital downloads and practical courses for businesses and creators."
    },
    "heroCta": {
      "ar": "تصفح المنتجات",
      "en": "Browse products"
    },
    "heroSecondary": {
      "ar": "تواصل مع الدعم",
      "en": "Contact support"
    },
    "heroStats": [
      {
        "ar": {
          "value": "500+",
          "label": "عميل سعيد"
        },
        "en": {
          "value": "500+",
          "label": "Happy customers"
        }
      },
      {
        "ar": {
          "value": "99.9%",
          "label": "تسليم ناجح"
        },
        "en": {
          "value": "99.9%",
          "label": "Successful delivery"
        }
      },
      {
        "ar": {
          "value": "24/7",
          "label": "دعم متواصل"
        },
        "en": {
          "value": "24/7",
          "label": "Always-on support"
        }
      }
    ],
    "heroBullets": [
      {
        "ar": "تسليم فوري",
        "en": "Instant delivery"
      },
      {
        "ar": "منتجات مرخّصة",
        "en": "Licensed products"
      },
      {
        "ar": "دفع آمن",
        "en": "Secure payments"
      },
      {
        "ar": "دعم سريع",
        "en": "Fast support"
      }
    ],
    "features": [
      {
        "icon": "◎",
        "title": {
          "ar": "منتجات موثوقة",
          "en": "Trusted products"
        },
        "text": {
          "ar": "جميع الملفات والبرامج المعروضة مخصّصة للاستخدام المشروع ومرفقة بوصف واضح وسهل.",
          "en": "Every listed file and software package is presented for legitimate use with clear, simple descriptions."
        }
      },
      {
        "icon": "⚡",
        "title": {
          "ar": "تسليم لحظي",
          "en": "Instant delivery"
        },
        "text": {
          "ar": "بعد تأكيد الطلب تحصل على الملف أو تفاصيل التسليم بسرعة مباشرة من المتجر أو فريق الدعم.",
          "en": "After order confirmation, your download or delivery details are provided quickly by the store or support team."
        }
      },
      {
        "icon": "⬢",
        "title": {
          "ar": "لوحة تحكم سهلة",
          "en": "Easy dashboard"
        },
        "text": {
          "ar": "أضف المنتجات، راقب الطلبات، وعدّل طرق الدفع بسهولة من لوحة إدارة بسيطة وواضحة.",
          "en": "Add products, monitor orders and manage payments easily from a clean, simple dashboard."
        }
      },
      {
        "icon": "$",
        "title": {
          "ar": "مدفوعات مرنة",
          "en": "Flexible payments"
        },
        "text": {
          "ar": "ادعم التحويل البنكي، البطاقات، PayPal والعملات الرقمية مع تفاصيل دفع قابلة للتخصيص.",
          "en": "Support bank transfer, cards, PayPal and crypto with customizable payment instructions."
        }
      }
    ],
    "about": {
      "title": {
        "ar": "حلول رقمية جاهزة",
        "en": "Ready-to-use digital solutions"
      },
      "text": {
        "ar": "منصة لبيع المنتجات الرقمية القانونية مثل القوالب، الأدوات المكتبية، الحزم التعليمية، والخدمات المساندة للمشاريع الصغيرة والمبدعين.",
        "en": "A legal digital storefront for templates, productivity tools, educational bundles and support services for small businesses and creators."
      }
    },
    "sections": {
      "hero": true,
      "categories": true,
      "shop": true,
      "features": true,
      "about": true,
      "payments": true,
      "contact": true
    },
    "phone": "+213 770 12 34 56",
    "whatsapp": "213770123456",
    "email": "support@majorstore.dz",
    "address": {
      "ar": "الجزائر",
      "en": "Algeria"
    },
    "instagram": "@majorstore.dz",
    "footerText": {
      "ar": "منتجات رقمية موثوقة لتسريع عملك.",
      "en": "Reliable digital products to help your business move faster."
    },
    "currency": "$",
    "currencyCode": "USD",
    "paymentMethods": [
      "USDT (TRC20)",
      "USDT (ERC20)",
      "USDT (BEP20)",
      "Bitcoin (BTC)",
      "Bank Transfer",
      "PayPal",
      "Visa / Mastercard",
      "Wise",
      "Cash on Delivery"
    ],
    "cryptoConfig": {
      "USDT (TRC20)": {
        "networks": [
          {
            "id": "trc20",
            "label": "TRON — TRC20",
            "address": "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "qr": ""
          }
        ]
      },
      "USDT (ERC20)": {
        "networks": [
          {
            "id": "erc20",
            "label": "Ethereum — ERC20",
            "address": "0x1111111111111111111111111111111111111111",
            "qr": ""
          }
        ]
      },
      "USDT (BEP20)": {
        "networks": [
          {
            "id": "bep20",
            "label": "BSC — BEP20",
            "address": "0x2222222222222222222222222222222222222222",
            "qr": ""
          }
        ]
      },
      "Bitcoin (BTC)": {
        "networks": [
          {
            "id": "btc",
            "label": "Bitcoin Mainnet",
            "address": "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "qr": ""
          }
        ]
      }
    },
    "discordLink": "mailto:support@majorstore.dz"
  },
  "adminAuth": {
    "user": "",
    "pass": ""
  },
  "categories": [
    {
      "id": "productivity",
      "name": {
        "ar": "الإنتاجية والمكاتب",
        "en": "Productivity & Office"
      },
      "icon": "📊",
      "color": "#0a2a1f"
    },
    {
      "id": "templates",
      "name": {
        "ar": "قوالب جاهزة",
        "en": "Ready-made Templates"
      },
      "icon": "🧩",
      "color": "#0d2438"
    },
    {
      "id": "design",
      "name": {
        "ar": "التصميم والهوية",
        "en": "Design & Branding"
      },
      "icon": "🎨",
      "color": "#1a0d35"
    },
    {
      "id": "courses",
      "name": {
        "ar": "دورات وملفات تعليمية",
        "en": "Courses & Learning"
      },
      "icon": "📚",
      "color": "#2a0a1a"
    },
    {
      "id": "automation",
      "name": {
        "ar": "أتمتة وأدوات عمل",
        "en": "Automation Tools"
      },
      "icon": "🤖",
      "color": "#1d2611"
    },
    {
      "id": "business",
      "name": {
        "ar": "حزم الأعمال",
        "en": "Business Kits"
      },
      "icon": "💼",
      "color": "#231510"
    },
    {
      "id": "media",
      "name": {
        "ar": "ميديا ومونتاج",
        "en": "Media & Editing"
      },
      "icon": "🎬",
      "color": "#0e1d2a"
    },
    {
      "id": "services",
      "name": {
        "ar": "خدمات ودعم",
        "en": "Services & Support"
      },
      "icon": "🛠",
      "color": "#1a1a0d"
    }
  ],
  "products": [
    {
      "id": "p1",
      "category": "productivity",
      "name": {
        "ar": "لوحة إدارة ميزانية Excel",
        "en": "Excel Budget Dashboard"
      },
      "price": 18,
      "oldPrice": 25,
      "badge": {
        "ar": "الأكثر مبيعاً",
        "en": "Best seller"
      },
      "specs": {
        "ar": "ملف جاهز للتعديل",
        "en": "Fully editable template"
      },
      "icon": "📊",
      "color": "#0d2235",
      "stock": 25,
      "description": {
        "ar": "لوحة مالية جاهزة لمتابعة الإيرادات والمصاريف والتقارير الشهرية للشركات الصغيرة.",
        "en": "A ready-to-use finance dashboard for tracking income, expenses and monthly reporting."
      },
      "rating": 4.9,
      "reviews": 412
    },
    {
      "id": "p2",
      "category": "templates",
      "name": {
        "ar": "قالب صفحة هبوط React",
        "en": "React Landing Page Template"
      },
      "price": 29,
      "oldPrice": 39,
      "badge": {
        "ar": "حديث",
        "en": "Modern"
      },
      "specs": {
        "ar": "سريع وسهل التخصيص",
        "en": "Fast and customizable"
      },
      "icon": "🧩",
      "color": "#0d3520",
      "stock": 18,
      "description": {
        "ar": "قالب احترافي لصفحات الهبوط مناسب للمنتجات الرقمية والخدمات والشركات الناشئة.",
        "en": "A professional landing page template for digital products, services and startups."
      },
      "rating": 4.8,
      "reviews": 156
    },
    {
      "id": "p3",
      "category": "design",
      "name": {
        "ar": "حزمة هوية بصرية للشركات",
        "en": "Business Brand Identity Pack"
      },
      "price": 45,
      "oldPrice": 60,
      "badge": {
        "ar": "احترافي",
        "en": "Pro"
      },
      "specs": {
        "ar": "شعارات + ألوان + ملفات",
        "en": "Logos, colors and assets"
      },
      "icon": "🎨",
      "color": "#2a0a1a",
      "stock": 12,
      "description": {
        "ar": "ملفات هوية بصرية جاهزة تشمل نماذج شعارات وألوان وخطوط وعناصر استخدام أساسية.",
        "en": "A polished branding kit including logo concepts, color palettes, typography and essential assets."
      },
      "rating": 4.9,
      "reviews": 89
    },
    {
      "id": "p4",
      "category": "automation",
      "name": {
        "ar": "أداة جدولة المحتوى",
        "en": "Content Scheduling Toolkit"
      },
      "price": 35,
      "oldPrice": 0,
      "badge": {
        "ar": "للأعمال",
        "en": "Business"
      },
      "specs": {
        "ar": "خطط + قوالب + سير عمل",
        "en": "Plans, templates and workflow"
      },
      "icon": "🤖",
      "color": "#1a0d35",
      "stock": 20,
      "description": {
        "ar": "حزمة تساعدك في تنظيم وجدولة المحتوى ونشره بطريقة أسهل عبر فريقك.",
        "en": "A toolkit to organize, schedule and streamline content publishing across your team."
      },
      "rating": 4.7,
      "reviews": 234
    },
    {
      "id": "p5",
      "category": "business",
      "name": {
        "ar": "حزمة عقود ومستندات فريلانس",
        "en": "Freelance Contract Bundle"
      },
      "price": 22,
      "oldPrice": 28,
      "badge": {
        "ar": "جاهز للاستعمال",
        "en": "Ready to use"
      },
      "specs": {
        "ar": "Word + PDF",
        "en": "Word + PDF"
      },
      "icon": "💼",
      "color": "#0d2438",
      "stock": 30,
      "description": {
        "ar": "مجموعة مستندات وعقود وفواتير جاهزة تساعد المستقلين على تنظيم العمل مع العملاء.",
        "en": "A ready bundle of contracts, invoices and client documents for freelancers."
      },
      "rating": 4.8,
      "reviews": 67
    },
    {
      "id": "p6",
      "category": "courses",
      "name": {
        "ar": "دورة إدارة المنتجات الرقمية",
        "en": "Digital Product Management Course"
      },
      "price": 32,
      "oldPrice": 0,
      "badge": {
        "ar": "تعليمي",
        "en": "Educational"
      },
      "specs": {
        "ar": "فيديو + ملفات عمل",
        "en": "Video + worksheets"
      },
      "icon": "📚",
      "color": "#1d2611",
      "stock": 99,
      "description": {
        "ar": "دورة عملية تشرح تسعير المنتجات الرقمية وبناء العروض وتحسين تجربة العميل.",
        "en": "A practical course on pricing, packaging and improving customer experience for digital products."
      },
      "rating": 4.9,
      "reviews": 512
    },
    {
      "id": "p7",
      "category": "media",
      "name": {
        "ar": "حزمة مقدمات فيديو قصيرة",
        "en": "Short Video Intro Pack"
      },
      "price": 14,
      "oldPrice": 18,
      "badge": {
        "ar": "كلاسيكي",
        "en": "Classic"
      },
      "specs": {
        "ar": "Premiere + CapCut",
        "en": "Premiere + CapCut"
      },
      "icon": "🎬",
      "color": "#1d2611",
      "stock": 42,
      "description": {
        "ar": "مجموعة مقدمات وانتقالات جاهزة لصناع المحتوى والمونتاج القصير.",
        "en": "A pack of ready intros and transitions for content creators and short-form editors."
      },
      "rating": 4.8,
      "reviews": 178
    },
    {
      "id": "p8",
      "category": "services",
      "name": {
        "ar": "دليل خدمة العملاء",
        "en": "Customer Support Playbook"
      },
      "price": 12,
      "oldPrice": 0,
      "badge": {
        "ar": "مفيد",
        "en": "Useful"
      },
      "specs": {
        "ar": "SOP + قوالب رد",
        "en": "SOP + reply templates"
      },
      "icon": "🛠",
      "color": "#0e1d2a",
      "stock": 999,
      "description": {
        "ar": "ملف إجرائي يساعدك على تنظيم خدمة العملاء والردود الجاهزة وأساليب التصعيد.",
        "en": "An operations file for managing customer support, canned responses and escalation workflows."
      },
      "rating": 4.7,
      "reviews": 91
    },
    {
      "id": "p9",
      "category": "productivity",
      "name": {
        "ar": "مخطط أعمال Notion",
        "en": "Notion Business Planner"
      },
      "price": 19,
      "oldPrice": 24,
      "badge": {
        "ar": "مرتب",
        "en": "Organized"
      },
      "specs": {
        "ar": "قواعد بيانات ولوحات",
        "en": "Databases and dashboards"
      },
      "icon": "📝",
      "color": "#231510",
      "stock": 40,
      "description": {
        "ar": "نظام Notion متكامل لإدارة المهام والعملاء والأهداف والمحتوى في مكان واحد.",
        "en": "A complete Notion system for managing tasks, clients, goals and content in one place."
      },
      "rating": 4.9,
      "reviews": 56
    },
    {
      "id": "p10",
      "category": "design",
      "name": {
        "ar": "UI Kit لمتجر إلكتروني",
        "en": "E-commerce UI Kit"
      },
      "price": 36,
      "oldPrice": 42,
      "badge": {
        "ar": "UI",
        "en": "UI"
      },
      "specs": {
        "ar": "Figma components",
        "en": "Figma components"
      },
      "icon": "🛍",
      "color": "#1a1a0d",
      "stock": 20,
      "description": {
        "ar": "مجموعة واجهات جاهزة لمتاجر إلكترونية تتضمن صفحات المنتجات والسلة والدفع.",
        "en": "A polished UI component kit for online stores including products, cart and checkout screens."
      },
      "rating": 4.8,
      "reviews": 145
    },
    {
      "id": "p11",
      "category": "media",
      "name": {
        "ar": "مكتبة مؤثرات صوتية",
        "en": "Sound Effects Library"
      },
      "price": 11,
      "oldPrice": 0,
      "badge": {
        "ar": "متوفر",
        "en": "Available"
      },
      "specs": {
        "ar": "WAV + MP3",
        "en": "WAV + MP3"
      },
      "icon": "🔊",
      "color": "#0d2438",
      "stock": 33,
      "description": {
        "ar": "مكتبة أصوات للمحتوى المرئي والإعلانات والبودكاست والمشاريع القصيرة.",
        "en": "A sound library for video content, ads, podcasts and short creative projects."
      },
      "rating": 4.6,
      "reviews": 88
    },
    {
      "id": "p12",
      "category": "courses",
      "name": {
        "ar": "مكتبة أوامر الذكاء الاصطناعي",
        "en": "AI Prompt Library"
      },
      "price": 25,
      "oldPrice": 32,
      "badge": {
        "ar": "محدّث",
        "en": "Updated"
      },
      "specs": {
        "ar": "أكثر من 300 Prompt",
        "en": "300+ prompts"
      },
      "icon": "✨",
      "color": "#1d2611",
      "stock": 50,
      "description": {
        "ar": "حزمة أوامر جاهزة للكتابة والتسويق والتصميم والإنتاجية باستخدام أدوات الذكاء الاصطناعي.",
        "en": "A prompt bundle for writing, marketing, design and productivity with AI tools."
      },
      "rating": 4.9,
      "reviews": 367
    }
  ],
  "coupons": [
    {
      "code": "MAJOR10",
      "type": "percent",
      "value": 10,
      "active": true
    },
    {
      "code": "WELCOME5",
      "type": "fixed",
      "value": 5,
      "active": true
    },
    {
      "code": "DIGITAL15",
      "type": "percent",
      "value": 15,
      "active": true
    }
  ],
  "orders": []
};

  var currentLang = (localStorage.getItem("major_lang_v4") === "en") ? "en" : "ar";

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
        localStorage.setItem(DB_KEY, JSON.stringify(clone(DEFAULT_DB)));
        return clone(DEFAULT_DB);
      }
      var m = merge(DEFAULT_DB, JSON.parse(raw));
      m.adminAuth = DEFAULT_DB.adminAuth;
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

  /* ترجمة أي قيمة بحسب اللغة الحالية (عربي / فرنسي / إنجليزي) */
  function localize(v) {
    if (v && typeof v === "object" && (v.ar !== undefined || v.en !== undefined)) return v[currentLang] || v.ar || v.en;
    return v;
  }

  function formatMoney(n) {
    return "$" + Number(n || 0).toFixed(2);
  }

  function setLang(lang) {
    currentLang = (lang === "en") ? "en" : "ar";
    localStorage.setItem("major_lang_v4", currentLang);
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
    window.dispatchEvent(new CustomEvent("major-lang-changed"));
  }

  function getLang() { return currentLang; }
  function t(key) { var L = I18N[currentLang] || I18N.ar; return L[key] || I18N.ar[key] || key; }

  function getLogo() { return LOGO_SVG; }

  window.ElectroDB = {
    KEY: DB_KEY, load: load, save: save,
    loadCart: loadCart, saveCart: saveCart,
    uid: uid, formatMoney: formatMoney,
    localize: localize, getLogo: getLogo,
    setLang: setLang,
    getLang: getLang, t: t,
    I18N: I18N,
    getDefault: function () { return clone(DEFAULT_DB); }
  };

  /* تطبيق اللغة على الفور */
  setLang(currentLang);
})();