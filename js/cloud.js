/* MAJOR STORE — Supabase cloud data layer
   The anon key is intentionally public. Admin writes require Supabase Auth. */
(function () {
  "use strict";

  var CONFIG = {
    url: "https://vlqdduqgktwaqehkbbsu.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscWRkdXFna3R3YXFlaGtiYnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDgwNjMsImV4cCI6MjEwMzQyNDA2M30.XEwrGcfjaj50FF2mfJg2ntAk4NEFAO843GEs4TWoH14"
  };
  var BASE = CONFIG.url + "/rest/v1";
  var AUTH = CONFIG.url + "/auth/v1";
  var session = null;

  function headers(withAuth) {
    var h = {
      apikey: CONFIG.anonKey,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };
    var token = withAuth && session && session.access_token ? session.access_token : CONFIG.anonKey;
    h.Authorization = "Bearer " + token;
    return h;
  }

  function request(path, options, authenticated) {
    options = options || {};
    options.headers = Object.assign(headers(authenticated), options.headers || {});
    return fetch(BASE + path, options).then(async function (r) {
      var text = await r.text();
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!r.ok) {
        var message = data && (data.message || data.error_description || data.error) || ("HTTP " + r.status);
        var err = new Error(message); err.status = r.status; err.payload = data; throw err;
      }
      return data;
    });
  }

  function authRequest(path, options) {
    options = options || {};
    options.headers = Object.assign(headers(false), options.headers || {});
    return fetch(AUTH + path, options).then(async function (r) {
      var text = await r.text(); var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!r.ok) {
        var message = data && (data.msg || data.error_description || data.message || data.error) || ("HTTP " + r.status);
        var err = new Error(message); err.status = r.status; err.payload = data; throw err;
      }
      return data;
    });
  }

  function restoreSession() {
    try { session = JSON.parse(localStorage.getItem("major_supabase_session") || "null"); } catch (e) { session = null; }
    return session;
  }
  restoreSession();

  function persistSession(value) {
    session = value || null;
    if (session) localStorage.setItem("major_supabase_session", JSON.stringify(session));
    else localStorage.removeItem("major_supabase_session");
    window.dispatchEvent(new CustomEvent("major-auth-changed"));
  }

  function adminEmail(username) {
    var user = String(username || "").trim();
    return user.indexOf("@") >= 0 ? user : (user + "@majorstore.store");
  }

  async function signIn(username, password) {
    var data = await authRequest("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email: adminEmail(username), password: password })
    });
    persistSession(data);
    return data;
  }

  async function signOut() {
    try { if (session) await authRequest("/logout", { method: "POST", headers: { Authorization: "Bearer " + session.access_token } }); } catch (e) {}
    persistSession(null);
  }

  function isAdmin() { return !!(session && session.access_token); }

  async function getStore() {
    var rows = await request("/store_data?select=data&id=eq.main&limit=1", { method: "GET" }, false);
    return rows && rows[0] ? rows[0].data : null;
  }

  async function saveStore(data) {
    if (!isAdmin()) throw new Error("Admin authentication required");
    /* upsert via POST + Prefer: resolution=merge-duplicate — creates the row if it doesn't exist */
    return request("/store_data?id=eq.main", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicate" },
      body: JSON.stringify({ id: "main", data: data, updated_at: new Date().toISOString() })
    }, true);
  }

  async function createOrder(order) {
    var rows = await request("/orders", { method: "POST", body: JSON.stringify(order) }, false);
    return rows && rows[0] ? rows[0] : order;
  }

  async function getOrders() {
    return request("/orders?select=*&order=created_at.desc", { method: "GET" }, true);
  }
  async function updateOrder(id, patch) {
    return request("/orders?id=eq." + encodeURIComponent(id), { method: "PATCH", body: JSON.stringify(patch) }, true);
  }
  async function deleteOrder(id) {
    return request("/orders?id=eq." + encodeURIComponent(id), { method: "DELETE" }, true);
  }

  async function createMessage(message) {
    var rows = await request("/messages", { method: "POST", body: JSON.stringify(message) }, false);
    return rows && rows[0] ? rows[0] : message;
  }
  async function getMessages() {
    return request("/messages?select=*&order=created_at.desc", { method: "GET" }, true);
  }
  async function updateMessage(id, patch) {
    return request("/messages?id=eq." + encodeURIComponent(id), { method: "PATCH", body: JSON.stringify(patch) }, true);
  }
  async function deleteMessage(id) {
    return request("/messages?id=eq." + encodeURIComponent(id), { method: "DELETE" }, true);
  }

  window.MajorCloud = {
    CONFIG: CONFIG,
    signIn: signIn,
    signOut: signOut,
    isAdmin: isAdmin,
    getStore: getStore,
    saveStore: saveStore,
    createOrder: createOrder,
    getOrders: getOrders,
    updateOrder: updateOrder,
    deleteOrder: deleteOrder,
    createMessage: createMessage,
    getMessages: getMessages,
    updateMessage: updateMessage,
    deleteMessage: deleteMessage
  };
})();