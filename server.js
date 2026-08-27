const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 8080;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname)));

// Light request log (only non-GET) so admin actions are visible in server logs.
app.use((req, res, next) => {
  if (req.method !== "GET") {
    console.log("[" + new Date().toLocaleTimeString() + "] " + req.method + " " + req.url);
  }
  next();
});

/* =====================================================================
   HELPERS
   ===================================================================== */
function readJSON(file, fallback) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return parsed != null ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(file, data) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch (e) {}
}

/* =====================================================================
   PRODUCTS — single source of truth (file backed, broadcast on change)
   ===================================================================== */
const PRODUCTS_FILE = path.join(__dirname, "products.json");

function defaultProducts() {
  return JSON.parse(JSON.stringify([
    { id: "c1", cat: "cyber", name: "حماية الحسابات — باقة أساسية", nameEn: "Account protection — Basic", price: 9.99, emoji: "🛡️", desc: "تعزيز حماية الحسابات والإعدادات الأمنية.", descEn: "Strengthen account protection and security settings." },
    { id: "c2", cat: "cyber", name: "حماية متقدمة + استشارة", nameEn: "Advanced protection + consult", price: 24.99, emoji: "🔐", desc: "حماية متقدمة مع استشارة عبر الديسكورد.", descEn: "Advanced protection with Discord consultation." },
    { id: "p8", cat: "streamer", name: "مشاهدات كيك 1K", nameEn: "Kick views 1K", price: 2.49, emoji: "📺", desc: "زيادة مشاهدات Kick لجمهورك.", descEn: "Boost Kick views for your stream." },
    { id: "p9", cat: "streamer", name: "مشاهدات كيك 5K", nameEn: "Kick views 5K", price: 7.99, emoji: "📡", desc: "باقة مشاهدات Kick أكبر.", descEn: "Larger Kick views pack." },
    { id: "p10", cat: "streamer", name: "مشاهدات تيك توك 5K", nameEn: "TikTok views 5K", price: 1.49, emoji: "🎵", desc: "مشاهدات تيك توك حقيقية المظهر.", descEn: "Natural-looking TikTok views." },
    { id: "p11", cat: "streamer", name: "مشاهدات تيك توك 20K", nameEn: "TikTok views 20K", price: 3.99, emoji: "📱", desc: "باقة نمو سريع لتيك توك.", descEn: "Fast growth pack for TikTok." },
    { id: "p12", cat: "streamer", name: "مشاهدات تيك توك 50K", nameEn: "TikTok views 50K", price: 8.49, emoji: "🚀", desc: "انطلاقة قوية لفيديوهاتك.", descEn: "Strong launch for your videos." },
    { id: "p1", cat: "gaming", name: "Blood Strike Tools — باقة ستارتر", nameEn: "Blood Strike Tools — Starter", price: 4.99, emoji: "🎯", desc: "أدوات مساعدة لبلود سترايك مع تفعيل سريع.", descEn: "Blood Strike helper tools with fast activation." },
    { id: "p2", cat: "gaming", name: "Blood Strike Tools — برو", nameEn: "Blood Strike Tools — Pro", price: 9.99, emoji: "⚔️", desc: "باقة متقدمة مع دعم فوري عبر ديسكورد.", descEn: "Advanced pack with instant Discord support." },
    { id: "p3", cat: "gaming", name: "فري فاير — أدوات أساسية", nameEn: "Free Fire — Basic tools", price: 5.99, emoji: "🔥", desc: "حزمة أدوات فري فاير للاعبين.", descEn: "Free Fire tools pack for players." },
    { id: "p4", cat: "gaming", name: "فري فاير — باقة النخبة", nameEn: "Free Fire — Elite pack", price: 12.99, emoji: "👑", desc: "أقوى عروض فري فاير مع أولوية التنفيذ.", descEn: "Top Free Fire offers with priority delivery." },
    { id: "p5", cat: "gaming", name: "بيباس فري فاير 100", nameEn: "Free Fire Diamonds 100", price: 1.99, emoji: "💎", desc: "شحن بيباس فري فاير — تسليم سريع.", descEn: "Free Fire diamonds top-up — fast delivery." },
    { id: "p6", cat: "gaming", name: "بيباس فري فاير 310", nameEn: "Free Fire Diamonds 310", price: 5.49, emoji: "💠", desc: "شحن 310 بيباس.", descEn: "310 diamonds top-up." },
    { id: "p7", cat: "gaming", name: "بيباس فري فاير 520", nameEn: "Free Fire Diamonds 520", price: 8.99, emoji: "💎", desc: "شحن 520 بيباس.", descEn: "520 diamonds top-up." }
  ]));
}

let productStore = readJSON(PRODUCTS_FILE, null);
if (!Array.isArray(productStore) || productStore.length === 0) productStore = defaultProducts();

function broadcastProducts() {
  io.emit("products:set", productStore);
}

app.get("/api/products", (req, res) => res.json(productStore));

app.post("/api/products", (req, res) => {
  const p = req.body || {};
  if (!p.id || !p.name) return res.status(400).json({ error: "البيانات غير مكتملة" });
  const cleaned = {
    id: String(p.id),
    cat: p.cat || "gaming",
    name: String(p.name),
    nameEn: String(p.nameEn || ""),
    price: Number(p.price) || 0,
    emoji: String(p.emoji || "🎮"),
    image: String(p.image || ""),
    desc: String(p.desc || ""),
    descEn: String(p.descEn || "")
  };
  productStore = productStore.filter(x => x.id !== cleaned.id);
  productStore.unshift(cleaned);
  writeJSON(PRODUCTS_FILE, productStore);
  broadcastProducts();
  res.json(cleaned);
});

app.delete("/api/products/:id", (req, res) => {
  productStore = productStore.filter(p => p.id !== req.params.id);
  writeJSON(PRODUCTS_FILE, productStore);
  broadcastProducts();
  res.json({ ok: true });
});

app.post("/api/products/reset", (req, res) => {
  productStore = defaultProducts();
  writeJSON(PRODUCTS_FILE, productStore);
  broadcastProducts();
  res.json({ ok: true });
});

/* =====================================================================
   PAYMENT METHODS — file backed, broadcast on change
   ===================================================================== */
const PAYMENTS_FILE = path.join(__dirname, "payment_methods.json");
let paymentMethods = [];
try {
  paymentMethods = JSON.parse(fs.readFileSync(PAYMENTS_FILE, "utf8")) || [];
} catch (e) {}
function cleanPaymentMethods(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(p => p && p.id !== "pm1" && p.wallet !== "0x3cff003f38e228c3348ac34c6358daa2e1cc6eb3");
}
paymentMethods = cleanPaymentMethods(paymentMethods);

app.get("/api/payments", (req, res) => res.json(paymentMethods));

app.post("/api/payments", (req, res) => {
  const p = req.body || {};
  if (!p.label || !p.wallet) return res.status(400).json({ error: "label and wallet required" });
  const method = {
    id: p.id || "pm" + Date.now(),
    label: String(p.label).trim(),
    network: String(p.network || "").trim(),
    wallet: String(p.wallet).trim(),
    icon: String(p.icon || "💳"),
    qrImage: typeof p.qrImage === "string" ? p.qrImage : ""
  };
  if (!method.qrImage) delete method.qrImage;
  if (method.id === "pm1" || method.wallet === "0x3cff003f38e228c3348ac34c6358daa2e1cc6eb3") {
    return res.status(400).json({ error: "طريقة الدفع القديمة ممنوعة" });
  }
  paymentMethods = paymentMethods.filter(x => x.id !== method.id);
  paymentMethods.push(method);
  writeJSON(PAYMENTS_FILE, paymentMethods);
  io.emit("payments:updated", paymentMethods);
  res.json(method);
});

app.delete("/api/payments/:id", (req, res) => {
  paymentMethods = paymentMethods.filter(p => p.id !== req.params.id);
  writeJSON(PAYMENTS_FILE, paymentMethods);
  io.emit("payments:updated", paymentMethods);
  res.json({ ok: true });
});

/* =====================================================================
   ORDERS — file backed, broadcast on change (single source of truth)
   ===================================================================== */
const ORDERS_FILE = path.join(__dirname, "orders.json");
let orderStore = readJSON(ORDERS_FILE, []);
if (!Array.isArray(orderStore)) orderStore = [];

function broadcastOrders() {
  io.emit("orders:updated", orderStore);
}

app.get("/api/orders", (req, res) => res.json(orderStore));

app.post("/api/orders", (req, res) => {
  const o = req.body || {};
  if (!o.id || !o.items || !o.items.length) return res.status(400).json({ error: "بيانات الطلب غير مكتملة" });
  const order = {
    id: String(o.id),
    name: String(o.name || "").trim(),
    contact: String(o.contact || "").trim(),
    country: String(o.country || "").trim(),
    proof: typeof o.proof === "string" ? o.proof : "",
    network: String(o.network || ""),
    wallet: String(o.wallet || ""),
    payLabel: o.payLabel ? String(o.payLabel) : null,
    items: Array.isArray(o.items) ? o.items : [],
    total: Number(o.total) || 0,
    originalTotal: Number(o.originalTotal) || 0,
    coupon: o.coupon ? String(o.coupon) : null,
    status: "pending",
    at: String(o.at || new Date().toLocaleString())
  };
  orderStore = orderStore.filter(x => x.id !== order.id);
  orderStore.unshift(order);
  writeJSON(ORDERS_FILE, orderStore);
  broadcastOrders();

  // Live activity for the storefront social proof
  const activity = {
    name: order.name || "زبون",
    country: order.country || "",
    item: order.items.map(i => i.name).join(", ") || "طلب",
    time: new Date().toLocaleTimeString()
  };
  io.emit("live:activity", activity);
  io.emit("live:stats", { visitors: currentVisitors(), todayOrders: orderStore.length });

  res.json(order);
});

app.patch("/api/orders/:id", (req, res) => {
  const id = req.params.id;
  const status = req.body && req.body.status;
  if (!["pending", "confirmed", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }
  const o = orderStore.find(x => x.id === id);
  if (!o) return res.status(404).json({ error: "not found" });
  o.status = status;
  writeJSON(ORDERS_FILE, orderStore);
  broadcastOrders();
  res.json(o);
});

app.delete("/api/orders/:id", (req, res) => {
  orderStore = orderStore.filter(x => x.id !== req.params.id);
  writeJSON(ORDERS_FILE, orderStore);
  broadcastOrders();
  res.json({ ok: true });
});

/* =====================================================================
   COUPONS — file backed, broadcast on change
   ===================================================================== */
const COUPONS_FILE = path.join(__dirname, "coupons.json");
const defaultCoupons = [
  { code: "MAJOR10", type: "percent", value: 10, used: 0, max: 100, expires: "" },
  { code: "VIP25", type: "percent", value: 25, used: 0, max: 50, expires: "" },
  { code: "WELCOME5", type: "fixed", value: 5, used: 0, max: 200, expires: "" }
];
let couponStore = readJSON(COUPONS_FILE, null);
if (!Array.isArray(couponStore)) couponStore = defaultCoupons;

function broadcastCoupons() {
  io.emit("coupons:set", couponStore);
}

app.get("/api/coupons", (req, res) => res.json(couponStore));

app.post("/api/coupons", (req, res) => {
  const c = req.body || {};
  if (!c.code) return res.status(400).json({ error: "code required" });
  const coupon = {
    code: String(c.code).trim().toUpperCase(),
    type: c.type === "fixed" ? "fixed" : "percent",
    value: Number(c.value) || 0,
    used: Number(c.used) || 0,
    max: Number(c.max) || 0,
    expires: String(c.expires || "")
  };
  couponStore = couponStore.filter(x => x.code !== coupon.code);
  couponStore.unshift(coupon);
  writeJSON(COUPONS_FILE, couponStore);
  broadcastCoupons();
  res.json(coupon);
});

app.delete("/api/coupons/:code", (req, res) => {
  couponStore = couponStore.filter(x => x.code !== req.params.code);
  writeJSON(COUPONS_FILE, couponStore);
  broadcastCoupons();
  res.json({ ok: true });
});

/* =====================================================================
   CONFIG (site-wide settings: discord, whatsapp, announcement)
   ===================================================================== */
const CONFIG_FILE = path.join(__dirname, "config.json");
const defaultConfig = {
  discord: "https://discord.gg/WrK7ttvq5g",
  whatsapp: "",
  whatsappMsg: "مرحباً! أريد الاستفسار عن منتج",
  announcement: "🔥 عروض حصرية — خصم 10% باستخدام كود MAJOR10",
  announcementEn: "🔥 Exclusive offers — 10% off with code MAJOR10",
  announcementEnabled: true
};
let config = Object.assign({}, defaultConfig, readJSON(CONFIG_FILE, {}));

function broadcastConfig() {
  io.emit("config:set", config);
}

app.get("/api/config", (req, res) => res.json(config));

app.post("/api/config", (req, res) => {
  const b = req.body || {};
  ["discord", "whatsapp", "whatsappMsg", "announcement", "announcementEn"].forEach(k => {
    if (typeof b[k] === "string") config[k] = b[k];
  });
  if (typeof b.announcementEnabled === "boolean") config.announcementEnabled = b.announcementEnabled;
  writeJSON(CONFIG_FILE, config);
  broadcastConfig();
  res.json(config);
});

/* =====================================================================
   CHAT — in memory + file backup (per machine only)
   ===================================================================== */
const chatStore = {};
const DATA_FILE = path.join(__dirname, "chat_data.json");
try {
  Object.assign(chatStore, readJSON(DATA_FILE, {}));
} catch (e) {}

function saveData() {
  writeJSON(DATA_FILE, chatStore);
}

function currentVisitors() {
  return visitorCount;
}

/* =====================================================================
   LIVE SOCIAL PROOF
   ===================================================================== */
var visitorCount = 0;
var recentActivity = [];

var demoBuyers = [
  { name: "Ali", country: "العراق" }, { name: "Mohamed", country: "مصر" },
  { name: "Sara", country: "المغرب" }, { name: "Ahmed", country: "السعودية" },
  { name: "Khaled", country: "الجزائر" }, { name: "Omar", country: "تونس" },
  { name: "Hassan", country: "ليبيا" }, { name: "Nora", country: "الإمارات" },
  { name: "Youssef", country: "سوريا" }
];

var demoProducts = [
  "VIP25 💎", "MAJOR10 🛡️", "WELCOME5 🔐",
  "باقة ستارتر 🎯", "مشاهدات 5K 📺", "أدوات أساسية 🔥"
];

setInterval(function () {
  io.emit("live:stats", {
    visitors: visitorCount + Math.floor(Math.random() * 3) + 1,
    todayOrders: orderStore.length,
    recentActivity: recentActivity.slice(-5)
  });
}, 3000);

setInterval(function () {
  if (orderStore.length !== 0 && Math.random() <= 0.6) return;
  const buyer = demoBuyers[Math.floor(Math.random() * demoBuyers.length)];
  const product = demoProducts[Math.floor(Math.random() * demoProducts.length)];
  const activity = { name: buyer.name, country: buyer.country, item: product, time: new Date().toLocaleTimeString() };
  recentActivity.push(activity);
  if (recentActivity.length > 20) recentActivity.shift();
  io.emit("live:activity", activity);
}, 8000);

io.on("connection", (socket) => {
  visitorCount++;
  var visitNames = ["Ali", "Mohamed", "Sara", "Ahmed", "Khaled", "Omar", "Hassan", "Nora", "Youssef", "Malak", "Ibrahim", "Layla", "Amine", "Rayan", "Aya"];
  var visitCountries = ["العراق", "مصر", "المغرب", "السعودية", "الجزائر", "تونس", "ليبيا", "الإمارات", "سوريا", "اليمن", "فلسطين"];
  socket.broadcast.emit("live:visit", { name: visitNames[Math.floor(Math.random() * visitNames.length)], country: visitCountries[Math.floor(Math.random() * visitCountries.length)] });
  socket.emit("live:stats", { visitors: visitorCount, todayOrders: orderStore.length });

  // Send current snapshots so every new client is in sync.
  socket.emit("products:set", productStore);
  socket.emit("payments:updated", paymentMethods);
  socket.emit("orders:updated", orderStore);
  socket.emit("coupons:set", couponStore);
  socket.emit("config:set", config);

  socket.on("chat:join", (chatId) => {
    socket.join(chatId);
    socket.emit("chat:history", { chatId, messages: chatStore[chatId] || [] });
  });

  socket.on("chat:new", (data) => {
    const { chatId, name } = data || {};
    if (!chatId) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    socket.join(chatId);
    socket.broadcast.emit("chat:new", { chatId, name: name || "زبون" });
  });

  socket.on("chat:message", (data) => {
    const { chatId, message, name } = data || {};
    if (!chatId || !message || !message.text) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    chatStore[chatId].push(message);
    saveData();
    var payload = { chatId, message, name: name || "" };
    if (message.from === "user") io.emit("chat:message", payload);
    else socket.to(chatId).emit("chat:message", payload);
  });

  socket.on("chat:delete", (chatId) => {
    delete chatStore[chatId];
    saveData();
    io.emit("chat:deleted", chatId);
  });

  socket.on("chat:leave", (chatId) => socket.leave(chatId));

  socket.on("disconnect", () => {
    visitorCount = Math.max(0, visitorCount - 1);
    io.emit("live:visitor", { visitors: Math.max(1, visitorCount + Math.floor(Math.random() * 2)) });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:" + PORT);
  console.log("📦 Products:", productStore.length, "| 💳 Payments:", paymentMethods.length, "| 🛒 Orders:", orderStore.length, "| 🎫 Coupons:", couponStore.length);
});