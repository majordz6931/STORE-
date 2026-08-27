# MAJOR STORE — Hacking Tools & Cybersecurity Programs

متجر أدوات اختراق وبرامج إلكترونية بهوية cyber داكنة ولوجو دائري متغيّر الألوان، يحمل شعار "MAJOR STORE" في أعلى الموقع بشكل دائم.

## معلومات الدخول

- **المتجر**: افتح `index.html`
- **لوحة التحكم**: افتح `admin.html`
- **username**: `admin`
- **password**: `yemavava91@@@@@#####`

## مزايا الموقع

- ثيم cyber داكن بهوية neon (أخضر ساطع + سماوي + بنفسجي)
- 🖼️ بارنر MAJOR STORE ثابت في أعلى الموقع (دائم الظهور)
- 💵 أسعار بالدولار الأمريكي فقط ($)
- 🌍 دعم اللغتين العربية والإنجليزية - زر `AR/EN` للتنقل بين اللغات
- 💰 طرق دفع متعددة: Bitcoin, Ethereum, USDT (TRC20/ERC20), Litecoin, Monero, PayPal, Visa/Mastercard, Western Union, Wise, BaridiMob/CCP, الدفع عند الاستلام
- 🎟️ كوبونات خصم قابلة للتعديل
- 📝 كل نص (منتجات، أقسام، واجهة) قابل للتعديل بـ AR/EN من لوحة التحكم
- 🛒 سلة شراء + طلب + كوبونات
- 🏪 8 أقسام، 12 منتج جاهز

## التشغيل

```bash
cd store
python3 -m http.server 8080
```

ثم افتح:
- `http://localhost:8080/index.html` → المتجر
- `http://localhost:8080/admin.html` → لوحة التحكم

## بنية المشروع

```text
store/
├── index.html        متجر الواجهة
├── admin.html        لوحة التحكم
├── css/style.css     ستايل المتجر
├── css/admin.css     ستايل اللوحة
├── js/store.js       قاعدة بيانات + i18n + localStorage
├── js/app.js         منطق المتجر
├── js/admin.js       منطق الإدارة
├── images/major-banner.png  البانر الثابت
├── package.json
├── vercel.json
└── README.md
```

> يتم تخزين البيانات في `localStorage` بالمتصفح. لا حاجة لـ GH_TOKEN أو سيرفر خارجي.
