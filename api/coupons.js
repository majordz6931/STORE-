/* Vercel serverless function — /api/coupons */
var db = require("./_lib/github-db");
var D = require("./_lib/defaults");

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var list = await db.read("coupons.json", D.clone(D.DEFAULT_COUPONS));
      if (!Array.isArray(list) || list.length === 0) list = D.clone(D.DEFAULT_COUPONS);
      return res.status(200).json(list);
    }
    if (req.method === "POST") {
      var c = req.body || {};
      if (!c.code) return res.status(400).json({ error: "bad-request" });
      var coupon = {
        code: String(c.code).trim().toUpperCase(),
        type: c.type === "fixed" ? "fixed" : "percent",
        value: Number(c.value) || 0,
        used: Number(c.used) || 0,
        max: Number(c.max) || 0,
        expires: String(c.expires || "")
      };
      var list2 = await db.read("coupons.json", []);
      list2 = Array.isArray(list2) ? list2 : [];
      list2 = list2.filter(function (x) { return x.code !== coupon.code; });
      list2.unshift(coupon);
      var ok = await db.write("coupons.json", list2, "coupons: update");
      if (!ok) return res.status(500).json({ error: "storage" });
      return res.status(200).json(coupon);
    }
    if (req.method === "DELETE") {
      var code = req.query.code;
      if (!code) return res.status(400).json({ error: "bad-request" });
      var list3 = await db.read("coupons.json", []);
      list3 = (Array.isArray(list3) ? list3 : []).filter(function (x) { return x.code !== code; });
      var ok2 = await db.write("coupons.json", list3, "coupons: delete");
      if (!ok2) return res.status(500).json({ error: "storage" });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};