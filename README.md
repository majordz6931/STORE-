# 🛒 MAJOR AM 360 — Store (v3 · بدون سيرفر إطلاقاً)

متجر رقمي كامل يعمل **على Vercel فقط** — لا دومين، لا استضافة خارجية، لا سيرفر Node.

## 🏗️ كيف يعمل

- **الواجهة** (ثابتة): `index.html` (المتجر) + `admin.html` (اللوحة) على Vercel.
- **البيانات**: محفوظة في **مستودع GitHub نفسه** على فرع منفصل `db` (في مجلد `data/`).
  - القراءة: `raw.githubusercontent.com` (CDN عام مجاني بلا حدود).
  - الكتابة: دوال Vercel Serverless (`/api/*`) تستخدم GitHub Contents API بمفتاح `GH_TOKEN`.
- **التحديث الحي**: استطلاع دوري قصير (Polling) بدل WebSocket — لا حاجة لأي سيرفر.

### الدوال (Vercel Functions — مجلد `api/`)
| الدالة | المهمة |
|---|---|
| `api/products.js` | منتجات (GET/POST/DELETE) |
| `api/payments.js` | طرق الدفع (اسم/محفظة/QR) |
| `api/orders.js` | طلبات + تغيير الحالة |
| `api/coupons.js` | أكواد الخصم |
| `api/config.js` | ديسكورد/واتساب/إعلان |
| `api/chat.js` | دردشة الزبائن (Polling) |
| `api/sync.js` | لقطة موحّدة لكل البيانات |
| `api/_lib/github-db.js` | طبقة القراءة/الكتابة على GitHub |

## 🚀 النشر على Vercel — 4 خطوات

### 1) اجعل المستودع عاماً (Public)
GitHub → مستودع `STORE-` → **Settings → Danger Zone → Change visibility → Public**.
(القراءة من raw CDN تحتاج مستودعاً عاماً — الكتابة تحتاج المفتاح فقط.)

### 2) أنشئ مفتاح GitHub (PAT)
GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**
- الصلاحية: **repo** فقط (كل الصلاحيات تحت repo)
- انسخ المفتاح (يظهر مرة واحدة فقط!)

### 3) أضف المفتاح إلى إعدادات Vercel
Vercel → مشروعك → **Settings → Environment Variables** → أضف:

| Name | Value |
|---|---|
| `GH_TOKEN` | (المفتاح الذي أنشأته) |

> الدوال تقرأ أيضاً `GH_OWNER` / `GH_REPO` / `GH_BRANCH` كاختياري — افتراضياً `majordz6931` / `STORE-` / `db`.

### 4) ارفع المشروع
من مجلد `store/`:
```bash
vercel login
vercel --prod
```
أو اربط المستودع بـ Vercel للرفع التلقائي عند كل `git push`.

## 🔑 لوحة التحكم
- المستخدم: `MAJOR` · كلمة السر: `yemavava91@@@@@#####`

## 📁 فرع `db` — ملفات البيانات
| الملف | المحتوى |
|---|---|
| `data/products.json` | المنتجات |
| `data/payments.json` | طرق الدفع |
| `data/orders.json` | الطلبات + إثباتات الدفع |
| `data/coupons.json` | أكواد الخصم |
| `data/config.json` | الإعدادات |
| `data/chat_data.json` | رسائل الدردشة |

## 🧪 محلياً (للاختبار)
```bash
cd store
npm install
GH_TOKEN=ghp_xxx node server.js   # يعمل على http://localhost:8080
```
بدون `GH_TOKEN` تعمل القراءة فقط (الكتابة تظهر رسالة خطأ).

## ⚠️ ملاحظات
- حدود Vercel مجانية: ~100K استدعاء دوال شهرياً — كافية لمثل هذا المتجر.
- الكتابة على GitHub تخلق commit واحداً لكل عملية حفظ — تظهر في تبويب Actions/Commits على فرع `db`.
- لو ضغط المستخدم مرتين بسرعة، تعالج الدوال تعارضات الـ sha تلقائياً (إعادة المحاولة لمرة واحدة).