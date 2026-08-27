/* Vercel serverless function — /api/products */
var db = require("./_lib/github-db");
var D = require("./_lib/defaults");

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var list = await db.read("products.json", D.clone(D.DEFAULT_PRODUCTS));
      if (!Array.isArray(list) || list.length === 0) list = D.clone(D.DEFAULT_PRODUCTS);
      return res.status(200).json(list);
    }
    if (req.method === "POST") {
      var list2 = await db.read("products.json", D.clone(D.DEFAULT_PRODUCTS));
      if (!Array.isArray(list2) || list2.length === 0) list2 = D.clone(D.DEFAULT_PRODUCTS);
      var p = req.body || {};
      if (p.action === "reset") {
        list2 = D.clone(D.DEFAULT_PRODUCTS);
      } else {
        if (!p.id || !p.name) return res.status(400).json({ error: "bad-request" });
        var item = {
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
        list2 = list2.filter(function (x) { return x.id !== item.id; });
        list2.unshift(item);
      }
      var ok = await db.write("products.json", list2, "products: update");
      if (!ok) return res.status(500).json({ error: "storage", detail: db.getLastError() });
      return res.status(200).json(p.action === "reset" ? { ok: true } : list2[0]);
    }
    if (req.method === "DELETE") {
      var id = req.query.id;
      if (!id) return res.status(400).json({ error: "bad-request" });
      var list3 = await db.read("products.json", []);
      list3 = (Array.isArray(list3) ? list3 : []).filter(function (x) { return x.id !== id; });
      var ok2 = await db.write("products.json", list3, "products: delete");
      if (!ok2) return res.status(500).json({ error: "storage", detail: db.getLastError() });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};