/* Vercel serverless function — /api/chat (polling-based, no websocket) */
var db = require("./_lib/github-db");

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var chats = await db.read("chat_data.json", []);
      chats = Array.isArray(chats) ? chats : [];
      if (req.query.id) {
        var c = chats.find(function (x) { return x.id === req.query.id; });
        return res.status(200).json(c ? [c] : []);
      }
      return res.status(200).json(chats);
    }
    if (req.method === "POST") {
      var b = req.body || {};
      if (!b.chatId) return res.status(400).json({ error: "bad-request" });
      var chats2 = await db.read("chat_data.json", []);
      chats2 = Array.isArray(chats2) ? chats2 : [];
      var chat = chats2.find(function (x) { return x.id === b.chatId; });
      if (b.message) {
        if (!chat) {
          chat = { id: b.chatId, name: b.name || "زبون", updated: Date.now(), messages: [] };
          chats2.unshift(chat);
        }
        if (chat.messages && chat.messages.some(function (m) { return m && m.ts === b.message.ts; })) {
          return res.status(200).json(chat);
        }
        chat.messages.push(b.message);
        chat.updated = Date.now();
      } else {
        if (!chat) {
          chat = { id: b.chatId, name: b.name || "زبون", updated: Date.now(), messages: [] };
          chats2.unshift(chat);
        }
      }
      var ok = await db.write("chat_data.json", chats2, "chat: update");
      if (!ok) return res.status(500).json({ error: "storage" });
      return res.status(200).json(chat);
    }
    if (req.method === "DELETE") {
      var id = req.query.id;
      if (!id) return res.status(400).json({ error: "bad-request" });
      var chats3 = await db.read("chat_data.json", []);
      chats3 = (Array.isArray(chats3) ? chats3 : []).filter(function (x) { return x.id !== id; });
      var ok2 = await db.write("chat_data.json", chats3, "chat: delete");
      if (!ok2) return res.status(500).json({ error: "storage" });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};