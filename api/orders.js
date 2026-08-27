/* Vercel serverless function — /api/orders */
var db = require("./_lib/github-db");

/* إبقاء الحجم صغيراً: آخر 100 طلب، وإزالة إثباتات الدفع القديمة جداً */
function prune(list) {
  var out = list.slice(0, 100);
  return out.map(function (o, i) {
    if (o && i >= 30 && o.proof) { var copy = Object.assign({}, o); copy.proof = ""; return copy; }
    return o;
  });
}

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      var list = await db.read("orders.json", []);
      list = Array.isArray(list) ? list : [];
      if (req.query.admin === "1") return res.status(200).json(list); // كاملة للأدمن
      if (req.query.id) {
        var ids = String(req.query.id).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        var filtered = list.filter(function (o) { return ids.indexOf(o.id) !== -1; });
        // دون إثباتات للعميل العادي
        return res.status(200).json(filtered.map(function (o) { var c = Object.assign({}, o); c.proof = ""; return c; }));
      }
      return res.status(200).json(list.map(function (o) { var c = Object.assign({}, o); c.proof = ""; return c; }));
    }
    if (req.method === "POST") {
      var o = req.body || {};
      if (!o.id || !Array.isArray(o.items) || !o.items.length) return res.status(400).json({ error: "bad-request" });
      var order = {
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
      var list2 = await db.read("orders.json", []);
      list2 = Array.isArray(list2) ? list2 : [];
      list2 = list2.filter(function (x) { return x.id !== order.id; });
      list2.unshift(order);
      var ok = await db.write("orders.json", prune(list2), "orders: new");
      if (!ok) return res.status(500).json({ error: "storage" });
      return res.status(200).json(order);
    }
    if (req.method === "PATCH") {
      var id = req.query.id;
      var status = req.body && req.body.status;
      var allowed = ["pending", "confirmed", "delivered", "cancelled"];
      if (!id || allowed.indexOf(status) === -1) return res.status(400).json({ error: "bad-request" });
      var list3 = await db.read("orders.json", []);
      list3 = Array.isArray(list3) ? list3 : [];
      var found = list3.find(function (x) { return x.id === id; });
      if (!found) return res.status(404).json({ error: "not-found" });
      found.status = status;
      var ok2 = await db.write("orders.json", prune(list3), "orders: status");
      if (!ok2) return res.status(500).json({ error: "storage" });
      return res.status(200).json(found);
    }
    if (req.method === "DELETE") {
      var id2 = req.query.id;
      if (!id2) return res.status(400).json({ error: "bad-request" });
      var list4 = await db.read("orders.json", []);
      list4 = (Array.isArray(list4) ? list4 : []).filter(function (x) { return x.id !== id2; });
      var ok3 = await db.write("orders.json", prune(list4), "orders: delete");
      if (!ok3) return res.status(500).json({ error: "storage" });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};