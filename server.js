const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Chat store
const chatStore = {};
const DATA_FILE = path.join(__dirname, "chat_data.json");
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
    // Broadcast to ALL clients for user msgs (admin may not be in room)
    // For admin msgs, only to room
    if (message.from === "user") {
      io.emit("chat:message", { chatId, message });
    } else {
      socket.to(chatId).emit("chat:message", { chatId, message });
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