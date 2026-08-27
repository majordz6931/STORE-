/* =====================================================================
   GitHub-DB — قاعدة بيانات مصغّرة على مستودع GitHub (فرع "db")
   مناسبة لـ Vercel Serverless Functions (بدون دومين/استضافة خارجية).
   ---------------------------------------------------------------
   • القراءة: raw.githubusercontent.com (CDN عام بلا حدود) — لا يحتاج مفتاح
   • الكتابة: GitHub Contents API (يتطلب GH_TOKEN في متغيرات Vercel)
   ===================================================================== */
var GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
var OWNER = process.env.GH_OWNER || "majordz6931";
var REPO = process.env.GH_REPO || "STORE-";
var BRANCH = process.env.GH_BRANCH || "db";
var PREFIX = "data/";

function apiUrl(file) { return "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + PREFIX + file + "?ref=" + BRANCH; }
function rawUrl(file) { return "https://raw.githubusercontent.com/" + OWNER + "/" + REPO + "/" + BRANCH + "/" + PREFIX + file + "?t=" + Date.now(); }
function authHeaders() {
  var h = { Accept: "application/vnd.github+json", "User-Agent": "major-store" };
  if (GH_TOKEN) h.Authorization = "token " + GH_TOKEN;
  return h;
}

/* قراءة — raw أولاً (بلا حدود)، ثم Contents API الاحتياطية */
async function read(file, fallback) {
  try {
    var r = await fetch(rawUrl(file), { cache: "no-store", headers: { "User-Agent": "major-store" } });
    if (r.ok) return JSON.parse(await r.text());
  } catch (e) {}
  // fallback عبر API (ينفع حتى لو الريبو خاص)
  try {
    if (GH_TOKEN) {
      var r2 = await fetch(apiUrl(file), { headers: authHeaders() });
      if (r2.ok) {
        var j = await r2.json();
        if (j && j.content) return JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
      }
    }
  } catch (e) {}
  return fallback;
}

/* كتابة — GitHub Contents API (يتطلب المفتاح) */
async function write(file, data, message) {
  var content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  if (!GH_TOKEN) return false;

  var sha = null;
  try {
    var meta = await fetch(apiUrl(file), { headers: authHeaders() });
    if (meta.ok) sha = (await meta.json()).sha;
  } catch (e) {}

  var body = { message: message || "db: update " + file, content: content, branch: BRANCH };
  if (sha) body.sha = sha;

  var r = await fetch(apiUrl(file), { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
  if (r.status === 409 && sha) {
    try {
      var meta2 = await fetch(apiUrl(file), { headers: authHeaders() });
      if (meta2.ok) { sha = (await meta2.json()).sha; body.sha = sha; }
    } catch (e) {}
    r = await fetch(apiUrl(file), { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
  }
  return r.ok;
}

module.exports = { read: read, write: write, OWNER: OWNER, REPO: REPO, BRANCH: BRANCH };
