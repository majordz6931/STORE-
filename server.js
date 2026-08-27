const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] }
});

const PORT = process.env.PORT || 8080;
const DATA_DIR = path.join(__dirname, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname)));

// --- tiny request log (non-GET only) ---------------------------------------
app.use((req, res, next) => {
  if (req.method !== "GET") console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

/* =========================================================================
   Helpers — read/write JSON files inside /data
   ========================================================================= */
function readJSON(file, fallback) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    const parsed = JSON.parse(raw);
    return parsed != null ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(file, data) {
  try { fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2)); } catch (e) {}
}

/* =========================================================================
   PRODUCTS
   ========================================================================= */
function defaultProducts() {
  return [
    { id: "c1", cat: "cyber", name: "حماية الحسابات — باقة أساسية", nameEn: "Account protection — Basic", price: 9.99, emoji: "🛡️", desc: "تعزيز حماية الحسابات وإعدادات الأمان.", descEn: "Strengthen account protection and security settings." },
    { id: "c2", cat: "cyber", name: "حماية متقدمة + استشارة", nameEn: "Advanced protection + consult", price: 24.99, emoji: "🔐", desc: "حماية متقدمة مع استشارة عبر الديسكورد.", descEn: "Advanced protection with Discord consultation." },
    { id: "p8", cat: "streamer", name: "مشاهدات كيك 1K", nameEn: "Kick views 1K", price: 2.49, emoji: "📺", desc: "زيادة مشاهدات Kick لجمهورك.", descEn: "Boost Kick views for your stream." },
    { id: "p9", cat: "streamer", name: "مشاهدات كيك 5K", nameEn: "Kick views 5K", price: 7.99, emoji: "📡", desc: "باقة مشاهدات Kick أكبر.", descEn: "Larger Kick views pack." },
    { id: "p10", cat: "streamer", name: "مشاهدات تيك توك 5K", nameEn: "TikTok views 5K", price: 1.49, emoji: "🎵", desc: "مشاهدات تيك توك طبيعية.", descEn: "Natural-looking TikTok views." },
    { id: "p11", cat: "streamer", name: "مشاهدات تيك توك 20K", nameEn: "TikTok views 20K", price: 3.99, emoji: "📱", desc: "باقة نمو سريع لتيك توك.", descEn: "Fast growth pack for TikTok." },
    { id: "p12", cat: "streamer", name: "مشاهدات تيك توك 50K", nameEn: "TikTok views 50K", price: 8.49, emoji: "🚀", desc: "انطلاقة قوية لفيديوهاتك.", descEn: "Strong launch for your videos." },
    { id: "p1", cat: "gaming", name: "Blood Strike Tools — ستارتر", nameEn: "Blood Strike Tools — Starter", price: 4.99, emoji: "🎯", desc: "أدوات مساعدة مع تفعيل سريع.", descEn: "Helper tools with fast activation." },
    { id: "p2", cat: "gaming", name: "Blood Strike Tools — برو", nameEn: "Blood Strike Tools — Pro", price: 9.99, emoji: "⚔️", desc: "باقة متقدمة مع دعم فوري عبر ديسكورد.", descEn: "Advanced pack with instant Discord support." },
    { id: "p3", cat: "gaming", name: "فري فاير — أدوات أساسية", nameEn: "Free Fire — Basic tools", price: 5.99, emoji: "🔥", desc: "حزمة أدوات فري فاير للاعبين.", descEn: "Free Fire tools pack for players." },
    { id: "p4", cat: "gaming", name: "فري فاير — باقة النخبة", nameEn: "Free Fire — Elite pack", price: 12.99, emoji: "👑", desc: "أقوى عروض فري فاير مع أولوية.", descEn: "Top offers with priority delivery." },
    { id: "p5", cat: "gaming", name: "بيباس فري فاير 100", nameEn: "Free Fire Diamonds 100", price: 1.99, emoji: "💎", desc: "شحن بيباس فري فاير — سريع.", descEn: "Free Fire diamonds top-up — fast." },
    { id: "p6", cat: "gaming", name: "بيباس فري فاير 310", nameEn: "Free Fire Diamonds 310", price: 5.49, emoji: "💠", desc: "شحن 310 بيباس.", descEn: "310 diamonds top-up." },
    { id: "p7", cat: "gaming", name: "بيباس فري فاير 520", nameEn: "Free Fire Diamonds 520", price: 8.99, emoji: "💎", desc: "شحن 520 بيباس.", descEn: "520 diamonds top-up." }
  ];
}

let products = readJSON("products.json", null);
if (!Array.isArray(products) || products.length === 0) products = defaultProducts();

app.get("/api/products", (req, res) => res.json(products));

app.post("/api/products", (req, res) => {
  const p = req.body || {};
  if (!p.id || !p.name) return res.status(400).json({ error: "البيانات غير مكتملة" });
  const item = {
    id: String(p.id),
    cat: String(p.cat || "gaming"),
    name: String(p.name),
    nameEn: String(p.nameEn || ""),
    price: Number(p.price) || 0,
    emoji: String(p.emoji || "🎮"),
    image: String(p.image || ""),
    desc: String(p.desc || ""),
    descEn: String(p.descEn || "")
  };
  products = products.filter(x => x.id !== item.id);
  products.unshift(item);
  writeJSON("products.json", products);
  io.emit("products:set", products);
  res.json(item);
});

app.delete("/api/products/:id", (req, res) => {
  products = products.filter(x => x.id !== req.params.id);
  writeJSON("products.json", products);
  io.emit("products:set", products);
  res.json({ ok: true });
});

app.post("/api/products/reset", (req, res) => {
  products = defaultProducts();
  writeJSON("products.json", products);
  io.emit("products:set", products);
  res.json({ ok: true });
});

/* =========================================================================
   PAYMENTS — admin-defined methods (label + wallet + QR), nothing hard-coded
   ========================================================================= */
let payments = readJSON("payments.json", []);
if (!Array.isArray(payments)) payments = [];

app.get("/api/payments", (req, res) => res.json(payments));

app.post("/api/payments", (req, res) => {
  const p = req.body || {};
  if (!p.label || !p.wallet) return res.status(400).json({ error: "bad-request" });
  const method = {
    id: p.id || "pm" + Date.now(),
    label: String(p.label).trim(),
    network: String(p.network || "").trim(),
    wallet: String(p.wallet).trim(),
    icon: String(p.icon || "💳"),
    qrImage: typeof p.qrImage === "string" ? p.qrImage : ""
  };
  if (!method.qrImage) delete method.qrImage;
  payments = payments.filter(x => x.id !== method.id);
  payments.push(method);
  writeJSON("payments.json", payments);
  io.emit("payments:updated", payments);
  res.json(method);
});

app.delete("/api/payments/:id", (req, res) => {
  payments = payments.filter(x => x.id !== req.params.id);
  writeJSON("payments.json", payments);
  io.emit("payments:updated", payments);
  res.json({ ok: true });
});

/* =========================================================================
   ORDERS
   ========================================================================= */
let orders = readJSON("orders.json", []);
if (!Array.isArray(orders)) orders = [];

app.get("/api/orders", (req, res) => res.json(orders));

app.post("/api/orders", (req, res) => {
  const o = req.body || {};
  if (!o.id || !Array.isArray(o.items) || !o.items.length) {
    return res.status(400).json({ error: "bad-request" });
  }
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
    coupon: o.coupon ? String(o.coupon) : null,
    status: "pending",
    at: String(o.at || new Date().toLocaleString())
  };
  orders = orders.filter(x => x.id !== order.id);
  orders.unshift(order);
  writeJSON("orders.json", orders);
  io.emit("orders:updated", orders);
  io.emit("live:activity", {
    name: order.name || "زبون", country: order.country || "",
    item: order.items.map(i => i.name).join(", ") || "طلب",
    time: new Date().toLocaleTimeString()
  });
  io.emit("live:stats", { visitors: visitorCount, todayOrders: orders.length });
  res.json(order);
});

app.patch("/api/orders/:id", (req, res) => {
  const status = req.body && req.body.status;
  if (!["pending", "confirmed", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "invalid-status" });
  }
  const o = orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "not-found" });
  o.status = status;
  writeJSON("orders.json", orders);
  io.emit("orders:updated", orders);
  res.json(o);
});

app.delete("/api/orders/:id", (req, res) => {
  orders = orders.filter(x => x.id !== req.params.id);
  writeJSON("orders.json", orders);
  io.emit("orders:updated", orders);
  res.json({ ok: true });
});

/* =========================================================================
   COUPONS
   ========================================================================= */
const defaultCoupons = [
  { code: "MAJOR10", type: "percent", value: 10, used: 0, max: 100, expires: "" },
  { code: "VIP25", type: "percent", value: 25, used: 0, max: 50, expires: "" },
  { code: "WELCOME5", type: "fixed", value: 5, used: 0, max: 200, expires: "" }
];
let coupons = readJSON("coupons.json", null);
if (!Array.isArray(coupons)) coupons = defaultCoupons;

app.get("/api/coupons", (req, res) => res.json(coupons));

app.post("/api/coupons", (req, res) => {
  const c = req.body || {};
  if (!c.code) return res.status(400).json({ error: "bad-request" });
  const coupon = {
    code: String(c.code).trim().toUpperCase(),
    type: c.type === "fixed" ? "fixed" : "percent",
    value: Number(c.value) || 0,
    used: Number(c.used) || 0,
    max: Number(c.max) || 0,
    expires: String(c.expires || "")
  };
  coupons = coupons.filter(x => x.code !== coupon.code);
  coupons.unshift(coupon);
  writeJSON("coupons.json", coupons);
  io.emit("coupons:set", coupons);
  res.json(coupon);
});

app.delete("/api/coupons/:code", (req, res) => {
  coupons = coupons.filter(x => x.code !== req.params.code);
  writeJSON("coupons.json", coupons);
  io.emit("coupons:set", coupons);
  res.json({ ok: true });
});

/* =========================================================================
   CONFIG (discord / whatsapp / announcement)
   ========================================================================= */
const defaultConfig = {
  discord: "https://discord.gg/WrK7ttvq5g",
  whatsapp: "",
  whatsappMsg: "مرحباً! أريد الاستفسار عن منتج",
  announcement: "🔥 عروض حصرية — خصم 10% بكود MAJOR10",
  announcementEn: "🔥 Exclusive offers — 10% off with code MAJOR10",
  announcementEnabled: true
};
let config = Object.assign({}, defaultConfig, readJSON("config.json", {}));

app.get("/api/config", (req, res) => res.json(config));

app.post("/api/config", (req, res) => {
  const b = req.body || {};
  ["discord", "whatsapp", "whatsappMsg", "announcement", "announcementEn"].forEach(k => {
    if (typeof b[k] === "string") config[k] = b[k];
  });
  if (typeof b.announcementEnabled === "boolean") config.announcementEnabled = b.announcementEnabled;
  writeJSON("config.json", config);
  io.emit("config:set", config);
  res.json(config);
});

/* =========================================================================
   CHAT — in memory + file backup
   ========================================================================= */
let chatStore = readJSON("chat_data.json", {});
if (typeof chatStore !== "object" || Array.isArray(chatStore)) chatStore = {};

/* =========================================================================
   LIVE SOCIAL PROOF
   ========================================================================= */
let visitorCount = 0;
let recentActivity = [];

const demoBuyers = [
  { name: "Ali", country: "العراق" }, { name: "Mohamed", country: "مصر" },
  { name: "Sara", country: "المغرب" }, { name: "Ahmed", country: "السعودية" },
  { name: "Khaled", country: "الجزائر" }, { name: "Omar", country: "تونس" },
  { name: "Hassan", country: "ليبيا" }, { name: "Nora", country: "الإمارات" },
  { name: "Youssef", country: "سوريا" }
];
const demoItems = ["VIP25 💎", "MAJOR10 🛡️", "WELCOME5 🔐", "باقة ستارتر 🎯", "مشاهدات 5K 📺", "أدوات أساسية 🔥"];

setInterval(() => {
  io.emit("live:stats", {
    visitors: visitorCount + Math.floor(Math.random() * 3) + 1,
    todayOrders: orders.length,
    recentActivity: recentActivity.slice(-5)
  });
}, 3000);

setInterval(() => {
  if (orders.length !== 0 && Math.random() <= 0.6) return;
  const b = demoBuyers[Math.floor(Math.random() * demoBuyers.length)];
  const act = { name: b.name, country: b.country, item: demoItems[Math.floor(Math.random() * demoItems.length)], time: new Date().toLocaleTimeString() };
  recentActivity.push(act);
  if (recentActivity.length > 20) recentActivity.shift();
  io.emit("live:activity", act);
}, 8000);

/* =========================================================================
   SOCKET.IO
   ========================================================================= */
io.on("connection", (socket) => {
  visitorCount++;
  const names = ["Ali", "Mohamed", "Sara", "Ahmed", "Khaled", "Omar", "Hassan", "Nora", "Youssef", "Malak", "Ibrahim", "Layla", "Amine", "Rayan", "Aya"];
  const countries = ["العراق", "مصر", "المغرب", "السعودية", "الجزائر", "تونس", "ليبيا", "الإمارات", "سوريا", "اليمن", "فلسطين"];
  socket.broadcast.emit("live:visit", {
    name: names[Math.floor(Math.random() * names.length)],
    country: countries[Math.floor(Math.random() * countries.length)]
  });
  socket.emit("live:stats", { visitors: visitorCount, todayOrders: orders.length });

  // Fresh snapshots so every new client is in sync instantly.
  socket.emit("products:set", products);
  socket.emit("payments:updated", payments);
  socket.emit("orders:updated", orders);
  socket.emit("coupons:set", coupons);
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
    writeJSON("chat_data.json", chatStore);
    const payload = { chatId, message, name: name || "" };
    if (message.from === "user") io.emit("chat:message", payload);
    else socket.to(chatId).emit("chat:message", payload);
  });

  socket.on("chat:delete", (chatId) => {
    delete chatStore[chatId];
    writeJSON("chat_data.json", chatStore);
    io.emit("chat:deleted", chatId);
  });

  socket.on("chat:leave", (chatId) => socket.leave(chatId));

  socket.on("disconnect", () => {
    visitorCount = Math.max(0, visitorCount - 1);
    io.emit("live:visitor", { visitors: Math.max(1, visitorCount + Math.floor(Math.random() * 2)) });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 MAJOR Store running on http://0.0.0.0:" + PORT);
  console.log(`📦 Products: ${products.length} | 💳 Payments: ${payments.length} | 🛒 Orders: ${orders.length} | 🎫 Coupons: ${coupons.length}`);
});