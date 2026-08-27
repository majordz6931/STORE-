/* GET /api/health — فحص إعدادات التخزين بدون كشف المفتاح */
var db = require("./_lib/github-db");

module.exports = async function (req, res) {
  var tokenSet = !!(process.env.GH_TOKEN || process.env.GITHUB_TOKEN);
  var result = {
    ok: false,
    tokenSet: tokenSet,
    repo: db.OWNER + "/" + db.REPO,
    branch: db.BRANCH,
    storage: tokenSet ? "configured" : "missing-token"
  };
  if (!tokenSet) return res.status(500).json(result);
  try {
    var products = await db.readApi("products.json");
    result.ok = Array.isArray(products);
    result.products = Array.isArray(products) ? products.length : 0;
    result.storage = result.ok ? "connected" : "read-failed";
    return res.status(result.ok ? 200 : 500).json(result);
  } catch (e) {
    result.storage = "read-failed";
    return res.status(500).json(result);
  }
};