/* =====================================================================
   MAJOR Store (v3) — خادم محلي للاختبار فقط
   ---------------------------------------------------------------------
   • الإنتاج: دوال Vercel في api/ (لا يُستخدم server.js)
   • محلياً: هذا الملف يشغّل نفس الدوال + الملفات الثابتة في منفذ واحد
   • البيانات تُحفظ على GitHub (فرع db) — يتطلب GH_TOKEN للكتابة
   ===================================================================== */
var express = require("express");
var path = require("path");
var app = express();

var PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));

/* ===== دوال الـ API (نفس التي تعمل على Vercel) ===== */
app.all("/api/products", require("./api/products"));
app.all("/api/payments", require("./api/payments"));
app.all("/api/orders", require("./api/orders"));
app.all("/api/coupons", require("./api/coupons"));
app.all("/api/config", require("./api/config"));
app.all("/api/chat", require("./api/chat"));
app.all("/api/sync", require("./api/sync"));

/* ===== الملفات الثابتة ===== */
app.use(express.static(path.join(__dirname)));

app.get("/", function (req, res) { res.sendFile(path.join(__dirname, "index.html")); });

app.listen(PORT, "0.0.0.0", function () {
  console.log("🚀 MAJOR Store (local serverless) running on http://0.0.0.0:" + PORT);
  console.log("📦 " + (process.env.GH_TOKEN ? "✓ GH_TOKEN set" : "⚠️  GH_TOKEN missing — writes will fail"));
});