/* Vercel serverless function — /api/config */
var db = require("./_lib/github-db");
var D = require("./_lib/defaults");

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var cfg = await db.read("config.json", null);
      if (!cfg || typeof cfg !== "object") cfg = D.clone(D.DEFAULT_CONFIG);
      return res.status(200).json(cfg);
    }
    if (req.method === "POST") {
      var b = req.body || {};
      var cfg2 = await db.read("config.json", D.clone(D.DEFAULT_CONFIG));
      if (!cfg2 || typeof cfg2 !== "object") cfg2 = D.clone(D.DEFAULT_CONFIG);
      ["discord", "whatsapp", "whatsappMsg", "announcement", "announcementEn"].forEach(function (k) {
        if (typeof b[k] === "string") cfg2[k] = b[k];
      });
      if (typeof b.announcementEnabled === "boolean") cfg2.announcementEnabled = b.announcementEnabled;
      var ok = await db.write("config.json", cfg2, "config: update");
      if (!ok) return res.status(500).json({ error: "storage" });
      return res.status(200).json(cfg2);
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};