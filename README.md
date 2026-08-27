# 🛒 MAJOR AM 360 — Store

متجر رقمي (أدوات جيمنج + مشاهدات + حماية حسابات) مع لوحة تحكم.

## 🏗️ البنية

- **الواجهة (Frontend)** — ملفات ثابتة: `index.html` (المتجر) و `admin.html` (لوحة التحكم) + `css/` + `js/` + `images/` → تُرفع على **Vercel**.
- **السيرفر (Backend)** — `server.js` (Express + Socket.IO) → يُنشر على **Render/Railway**، وهو المصدر الوحيد للحقيقة:
  - المنتجات `products.json`
  - طرق الدفع `payment_methods.json`
  - الطلبات `orders.json`
  - الكوبونات `coupons.json`
  - الإعدادات `config.json`
  - الدردشة + الإشعارات الحية (Socket.IO)

## 🚀 النشر خطوة بخطوة

### 1) نشر السيرفر على Render (مجاني)

1. سجّل في [render.com](https://render.com) (بنفس حساب GitHub).
2. **New → Web Service** → اربط مستودع `STORE-` من GitHub.
3. الإعدادات:
   - **Name**: `major-store`
   - **Root Directory**: `store`
   - **Build Command**: (فارغ — لا حاجة)
   - **Start Command**: `node server.js`
   - **Plan**: Free
4. **Create Web Service** → انتظر 2-3 دقائق حتى يظهر الرابط:
   `https://major-store.onrender.com`

> ⚠️ على الخطة المجانية في Render، السيرفر ينام بعد 15 دقيقة بدون زيارة — يستيقظ تلقائياً عند أول زيارة (قد يأخذ أول طلب ~50 ثانية). لتجنب النوم استعمل [UptimeRobot](https://uptimerobot.com) للـ ping كل 5 دقائق.

### 2) ربط الواجهة بالسيرفر

عدّل **ملف واحد فقط** — `js/config.js`:

```js
window.MAJOR_CONFIG = {
  API_URL: "https://major-store.onrender.com"   // ← رابط السيرفر الجديد
};
```

> بدون `/` في نهاية الرابط.

### 3) نشر الواجهة على Vercel

1. سجّل في [vercel.com](https://vercel.com) **ونصّب Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. من مجلد `store/`:
   ```bash
   vercel login
   vercel --prod
   ```
   (اتبع الأسئلة: ربط حساب GitHub، مجلد الحالي، وغيرها)
3. ستأخذ رابطاً مثل: `https://store.vercel.app`
   - المتجر: `https://store.vercel.app`
   - اللوحة: `https://store.vercel.app/admin`
4. **لأي تعديل جديد**: عدّل الملفات ثم `vercel --prod` من جديد (أو اربط المستودع بـ Vercel ليتم النشر تلقائياً عند كل `git push`).

## 🔑 دخول اللوحة

- المستخدم: `MAJOR`
- كلمة السر: `yemavava91@@@@@#####`

(يمكن إضافة أدمن آخرين من لوحة الأدمن — تُحفظ محلياً في متصفح الأدمن.)

## 🧪 تطوير محلي (بدون نشر)

```bash
cd store
npm install
node server.js
```

ثم افتح `http://localhost:8080` — المتجر واللوحة نفس الأصل، و `js/config.js` يبقى API_URL فارغاً `""`.

## 📁 ملفات البيانات (تُنشأ تلقائياً على السيرفر)

| الملف | المحتوى |
|---|---|
| `products.json` | المنتجات (أصلية 14 منتج) |
| `payment_methods.json` | طرق الدفع التي يضيفها الأدمن |
| `orders.json` | الطلبات + إثباتات الدفع ⚠️ لا تُرفع لـ git |
| `coupons.json` | أكواد الخصم |
| `config.json` | ديسكورد / واتساب / الإعلان |
| `chat_data.json` | رسائل الدردشة ⚠️ لا تُرفع لـ git |