# 🛒 MAJOR AM 360 — Store (v2, لأبنى من الصفر)

متجر رقمي (أدوات جيمنج + مشاهدات + حماية) مع لوحة تحكم كاملة.

## 🏗️ البنية

- **الواجهة** (ثابتة): `index.html`, `admin.html`, `css/`, `js/` → **Vercel** أو أي استضافة ثابتة.
- **السيرفر** (`server.js` — Express + Socket.IO): **Render/Railway** — المصدر الوحيد للبيانات:
  - المنتجات، طرق الدفع، الطلبات، الكوبونات، الإعدادات، الدردشة (كلها ملفات JSON في `data/`)
  - بث لحظي لكل العملاء (منتجات/طلبات/دفع/كوبونات/إعدادات)

## 🚀 النشر

### 1) السيرفر على Render (مجاني)
1. [render.com](https://render.com) → New → Web Service → اربط مستودع GitHub.
2. الإعدادات: Root Directory = `store` · Start Command = `node server.js` · Plan = Free.
3. تحصل على رابط مثل `https://major-store.onrender.com`.
4. (اختياري) UptimeRobot ليبقى السيرفر مستيقظاً.

### 2) الواجهة على Vercel
1. عدّل `js/config.js`:
   ```js
   window.MAJOR_CONFIG = { API_URL: "https://major-store.onrender.com" }
   ```
2. ارفع المستودع لـ Vercel (Vercel CLI: `vercel --prod` من داخل `store/`، أو اربط المستودع).

## 🔑 لوحة التحكم
- المستخدم: `MAJOR` · كلمة السر: `yemavava91@@@@@#####`

## 🧪 محلياً
```bash
cd store
npm install
node server.js
# افتح http://localhost:8080
```

## 📁 ملفات البيانات (في `data/`، غير مرفوعة لـ git)
| الملف | المحتوى |
|---|---|
| `products.json` | المنتجات |
| `payments.json` | طرق الدفع (اسم/محفظة/QR) |
| `orders.json` | الطلبات + إثباتات الدفع |
| `coupons.json` | أكواد الخصم |
| `config.json` | ديسكورد/واتساب/إعلان |
| `chat_data.json` | رسائل الدردشة |