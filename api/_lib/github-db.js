/* =====================================================================
   GitHub-DB — تخزين البيانات في فرع db من مستودع GitHub
   القراءة داخل Vercel: GitHub API (لحظية) ثم raw كاحتياط.
   الكتابة: GitHub Contents API وتتطلب GH_TOKEN في Vercel.
   ===================================================================== */
var GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
var OWNER = process.env.GH_OWNER || "majordz6931";
var REPO = process.env.GH_REPO || "STORE-";
var BRANCH = process.env.GH_BRANCH || "db";
var PREFIX = "data/";
var lastError = "";

function apiUrl(file) {
  return "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + PREFIX + file + "?ref=" + BRANCH;
}
function rawUrl(file) {
  return "https://raw.githubusercontent.com/" + OWNER + "/" + REPO + "/" + BRANCH + "/" + PREFIX + file + "?t=" + Date.now();
}
function authHeaders() {
  var h = { Accept: "application/vnd.github+json", "User-Agent": "major-store" };
  if (GH_TOKEN) h.Authorization = "token " + GH_TOKEN;
  return h;
}
function setError(code) { lastError = code || "github-error"; }
function getLastError() { return lastError; }

async function readApi(file) {
  if (!GH_TOKEN) return undefined;
  var r = await fetch(apiUrl(file), { headers: authHeaders() });
  if (!r.ok) return undefined;
  var j = await r.json();
  if (!j || !j.content) return undefined;
  return JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
}

async function read(file, fallback) {
  try {
    var viaApi = await readApi(file);
    if (viaApi !== undefined) return viaApi;
  } catch (e) {}
  try {
    var r = await fetch(rawUrl(file), { cache: "no-store", headers: { "User-Agent": "major-store" } });
    if (r.ok) return JSON.parse(await r.text());
  } catch (e) {}
  return fallback;
}

async function write(file, data, message) {
  lastError = "";
  if (!GH_TOKEN) {
    setError("github-token-missing");
    return false;
  }

  var content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  var sha = null;
  try {
    var meta = await fetch(apiUrl(file), { headers: authHeaders() });
    if (meta.ok) {
      sha = (await meta.json()).sha;
    } else if (meta.status !== 404) {
      setError("github-read-" + meta.status);
      return false;
    }
  } catch (e) {
    setError("github-read-failed");
    return false;
  }

  var body = { message: message || "db: update " + file, content: content, branch: BRANCH };
  if (sha) body.sha = sha;

  var r;
  try {
    r = await fetch(apiUrl(file), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
  } catch (e) {
    setError("github-write-failed");
    return false;
  }

  if (!r.ok && r.status === 409) {
    try {
      var meta2 = await fetch(apiUrl(file), { headers: authHeaders() });
      if (meta2.ok) {
        body.sha = (await meta2.json()).sha;
        r = await fetch(apiUrl(file), {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(body)
        });
      }
    } catch (e) {
      setError("github-conflict");
      return false;
    }
  }

  if (!r.ok) {
    setError("github-write-" + r.status);
    return false;
  }
  return true;
}

module.exports = {
  read: read,
  write: write,
  readApi: readApi,
  getLastError: getLastError,
  OWNER: OWNER,
  REPO: REPO,
  BRANCH: BRANCH
};