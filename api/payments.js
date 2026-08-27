/* Vercel serverless function — /api/payments */
var db = require("./_lib/github-db");

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var list = await db.read("payments.json", []);
      return res.status(200).json(Array.isArray(list) ? list : []);
    }
    if (req.method === "POST") {
      var p = req.body || {};
      if (!p.label || !p.wallet) return res.status(400).json({ error: "bad-request" });
      var method = {
        id: p.id || "pm" + Date.now(),
        label: String(p.label).trim(),
        network: String(p.network || "").trim(),
        wallet: String(p.wallet).trim(),
        icon: String(p.icon || "💳"),
        qrImage: typeof p.qrImage === "string" ? p.qrImage : ""
      };
      if (!method.qrImage) delete method.qrImage;
      var list2 = await db.read("payments.json", []);
      list2 = Array.isArray(list2) ? list2 : [];
      list2 = list2.filter(function (x) { return x.id !== method.id; });
      list2.push(method);
      var ok = await db.write("payments.json", list2, "payments: update");
      if (!ok) return res.status(500).json({ error: "storage" });
      return res.status(200).json(method);
    }
    if (req.method === "DELETE") {
      var id = req.query.id;
      if (!id) return res.status(400).json({ error: "bad-request" });
      var list3 = await db.read("payments.json", []);
      list3 = (Array.isArray(list3) ? list3 : []).filter(function (x) { return x.id !== id; });
      var ok2 = await db.write("payments.json", list3, "payments: delete");
      if (!ok2) return res.status(500).json({ error: "storage" });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};