const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 8080;

// Serve static files and accept QR images as JSON data.
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname)));

// Payment methods API shared by admin and storefront.
app.get("/api/payments", (req, res) => {
  res.json(paymentMethods);
});

app.post("/api/payments", (req, res) => {
  const p = req.body || {};
  if (!p.label || !p.wallet) return res.status(400).json({ error: "label and wallet are required" });
  const method = {
    id: p.id || "pm" + Date.now(),
    label: String(p.label).trim(),
    network: String(p.network || "").trim(),
    wallet: String(p.wallet).trim(),
    icon: String(p.icon || "💳"),
    qrImage: typeof p.qrImage === "string" ? p.qrImage : ""
  };
  if (method.id === "pm1" || method.wallet === "0x3cff003f38e228c3348ac34c6358daa2e1cc6eb3") {
    return res.status(400).json({ error: "old payment method is not allowed" });
  }
  paymentMethods = paymentMethods.filter((x) => x.id !== method.id);
  paymentMethods.push(method);
  savePaymentMethods();
  io.emit("payments:updated", paymentMethods);
  res.json(method);
});

app.delete("/api/payments/:id", (req, res) => {
  paymentMethods = paymentMethods.filter((p) => p.id !== req.params.id);
  savePaymentMethods();
  io.emit("payments:updated", paymentMethods);
  res.json({ ok: true });
});

// Chat store
const chatStore = {};
const DATA_FILE = path.join(__dirname, "chat_data.json");

// Payment methods are shared between the dashboard and the storefront.
const PAYMENTS_FILE = path.join(__dirname, "payment_methods.json");
let paymentMethods = [];
try {
  const paymentRaw = fs.readFileSync(PAYMENTS_FILE, "utf8");
  paymentMethods = cleanPaymentMethods(JSON.parse(paymentRaw));
} catch (e) {}

function cleanPaymentMethods(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(function (p) {
    // Remove the old built-in BSC method permanently.
    return p && p.id !== "pm1" && p.wallet !== "0x3cff003f38e228c3348ac34c6358daa2e1cc6eb3";
  });
}

function savePaymentMethods() {
  try { fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(paymentMethods)); } catch (e) {}
}
try {
  var raw = fs.readFileSync(DATA_FILE, "utf8");
  var parsed = JSON.parse(raw);
  Object.assign(chatStore, parsed);
} catch (e) {}

function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(chatStore)); } catch (e) {}
}

/* ===== LIVE SOCIAL PROOF ===== */
var visitorCount = 0;
var todayOrders = [];
var recentActivity = [];

// Demo names for social proof
var demoBuyers = [
  { name: "Ali", country: "العراق" },
  { name: "Mohamed", country: "مصر" },
  { name: "Sara", country: "المغرب" },
  { name: "Ahmed", country: "السعودية" },
  { name: "Khaled", country: "الجزائر" },
  { name: "Omar", country: "تونس" },
  { name: "Hassan", country: "ليبيا" },
  { name: "Nora", country: "الإمارات" },
  { name: "Youssef", country: "سوريا" }
];

var demoProducts = [
  "VIP25 💎", "MAJOR10 🛡️", "WELCOME5 🔐",
  "باقة ستارتر 🎯", "مشاهدات 5K 📺", "أدوات أساسية 🔥"
];

// Broadcast live stats every 3s
setInterval(() => {
  io.emit("live:stats", {
    visitors: visitorCount + Math.floor(Math.random() * 3) + 1,  // a little random for realism
    todayOrders: todayOrders.length,
    recentActivity: recentActivity.slice(-5)
  });
}, 3000);

// Periodically add a fake purchase demo (only if no real orders recently)
setInterval(() => {
  if (todayOrders.length === 0 || Math.random() > 0.6) {
    var buyer = demoBuyers[Math.floor(Math.random() * demoBuyers.length)];
    var product = demoProducts[Math.floor(Math.random() * demoProducts.length)];
    var activity = {
      name: buyer.name,
      country: buyer.country,
      item: product,
      time: new Date().toLocaleTimeString()
    };
    recentActivity.push(activity);
    if (recentActivity.length > 20) recentActivity.shift();
    io.emit("live:activity", activity);
  }
}, 8000);

io.on("connection", (socket) => {
  visitorCount++;

  // Notify all other clients about a new visitor
  var visitNames = ["Ali", "Mohamed", "Sara", "Ahmed", "Khaled", "Omar", "Hassan", "Nora", "Youssef", "Malak", "Ibrahim", "Layla", "Amine", "Rayan", "Aya"];
  var visitName = visitNames[Math.floor(Math.random() * visitNames.length)];
  var visitCountries = ["العراق", "مصر", "المغرب", "السعودية", "الجزائر", "تونس", "ليبيا", "الإمارات", "سوريا", "اليمن", "فلسطين"];
  var visitCountry = visitCountries[Math.floor(Math.random() * visitCountries.length)];
  socket.broadcast.emit("live:visit", { name: visitName, country: visitCountry });

  // Send immediate stats to the new client
  socket.emit("live:stats", { visitors: visitorCount, todayOrders: todayOrders.length });

  // Chat: join room
  socket.on("chat:join", (chatId) => {
    socket.join(chatId);
    const msgs = chatStore[chatId] || [];
    socket.emit("chat:history", { chatId, messages: msgs });
  });

  // Chat: new
  socket.on("chat:new", (data) => {
    const { chatId, name } = data;
    if (!chatId) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    socket.join(chatId);
    socket.broadcast.emit("chat:new", { chatId, name: name || "زبون" });
  });

  // Chat: message
  socket.on("chat:message", (data) => {
    const { chatId, message } = data;
    if (!chatId || !message || !message.text) return;
    if (!chatStore[chatId]) chatStore[chatId] = [];
    chatStore[chatId].push(message);
    saveData();
    const payload = { chatId, message, name: data.name || "" };
    // Broadcast user messages to all connected admin/store clients so they are never missed.
    if (message.from === "user") {
      io.emit("chat:message", payload);
    } else {
      socket.to(chatId).emit("chat:message", payload);
    }
  });

  // Chat: delete
  socket.on("chat:delete", (chatId) => {
    delete chatStore[chatId];
    saveData();
    io.emit("chat:deleted", chatId);
  });

  // Chat: leave
  socket.on("chat:leave", (chatId) => {
    socket.leave(chatId);
  });

  // Real order placed — broadcast live
  socket.on("order:new", (data) => {
    var activity = {
      name: data.name || "زبون",
      country: data.country || "",
      item: data.items || "طلب",
      time: new Date().toLocaleTimeString()
    };
    todayOrders.push(activity);
    recentActivity.push(activity);
    if (todayOrders.length > 200) todayOrders.shift();
    if (recentActivity.length > 20) recentActivity.shift();
    io.emit("live:activity", activity);
    io.emit("live:stats", { visitors: visitorCount, todayOrders: todayOrders.length });
  });

  // Disconnect
  socket.on("disconnect", () => {
    visitorCount = Math.max(0, visitorCount - 1);
    io.emit("live:visitor", { visitors: Math.max(1, visitorCount + Math.floor(Math.random() * 2)) });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:" + PORT);
});