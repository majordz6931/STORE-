/* Vercel serverless function — /api/sync
   لقطة موحّدة لتقليل عدد الاستدعاءات:
   ?admin=1 → كل البيانات (للأدمن)
   ?order=a,b → طلبات محددة (حالة طلبي)
   بدون معاملات → منتجات/دفع/كوبونات/إعدادات (للمتجر)
*/
var db = require("./_lib/github-db");
var D = require("./_lib/defaults");

module.exports = async function (req, res) {
  try {
    var [products, payments, coupons, config] = await Promise.all([
      db.read("products.json", []),
      db.read("payments.json", []),
      db.read("coupons.json", []),
      db.read("config.json", null)
    ]);
    if (!Array.isArray(products) || products.length === 0) products = D.clone(D.DEFAULT_PRODUCTS);
    if (!Array.isArray(coupons) || coupons.length === 0) coupons = D.clone(D.DEFAULT_COUPONS);
    if (!config || typeof config !== "object") config = D.clone(D.DEFAULT_CONFIG);

    var out = {
      products: products,
      payments: Array.isArray(payments) ? payments : [],
      coupons: coupons,
      config: config
    };

    if (req.query.admin === "1") {
      var [orders, chats] = await Promise.all([db.read("orders.json", []), db.read("chat_data.json", [])]);
      out.orders = Array.isArray(orders) ? orders : [];
      out.chats = Array.isArray(chats) ? chats : [];
    }
    if (req.query.order) {
      var ids = String(req.query.order).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var orders2 = await db.read("orders.json", []);
      out.orders = (Array.isArray(orders2) ? orders2 : []).filter(function (o) { return ids.indexOf(o.id) !== -1; });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
};