import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-client-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const DATA_KEYS = ["jeeOS", "jeeMaterials", "jeeOSReelsV1"]; // Never sync Reel API tokens/settings.
const root = document.createElement("aside");
root.id = "firebase-account-panel";
root.innerHTML = `
<style>
#firebase-account-panel{position:fixed;z-index:9999;right:16px;bottom:16px;width:min(340px,calc(100vw - 32px));padding:14px;border:1px solid #526078;border-radius:16px;background:#101827;color:#f7fafc;box-shadow:0 12px 40px #0005;font:14px system-ui}
#firebase-account-panel *{box-sizing:border-box}#firebase-account-panel h3{margin:0 0 8px;font-size:16px}#firebase-account-panel p{margin:6px 0;color:#bac6d8;font-size:12px}#firebase-account-panel input{width:100%;margin:5px 0;padding:10px;border:1px solid #536078;border-radius:8px;background:#0b1220;color:white}
#firebase-account-panel button{margin:5px 5px 0 0;padding:9px 12px;border:0;border-radius:8px;background:#8ab4ff;color:#101827;font-weight:650;cursor:pointer}#firebase-account-panel button.secondary{background:#26364d;color:#fff}#firebase-account-panel [hidden]{display:none!important}#firebase-account-panel #fbStatus{min-height:18px}
</style>
<h3>JEE Life Time Cloud Sync</h3>
<p id="fbStatus" role="status">Checking account…</p>
<div id="fbSignedOut" hidden>
  <input id="fbEmail" type="email" autocomplete="email" placeholder="Email address">
  <input id="fbPassword" type="password" autocomplete="current-password" placeholder="Password (6+ characters)">
  <button id="fbLogin">Log in</button><button id="fbCreate" class="secondary">Create account</button>
</div>
<div id="fbSignedIn" hidden>
  <p id="fbUser"></p><button id="fbLogout" class="secondary">Log out</button>
</div>`;
document.body.appendChild(root);
const $ = id => root.querySelector("#"+id);
let currentUser = null, stopRemote = null, suppress = false, saveTimer = null, lastLocalWrite = 0;
const status = message => { $("fbStatus").textContent = message; };
const readLocal = () => Object.fromEntries(DATA_KEYS.map(k => [k, localStorage.getItem(k)]).filter(([,v]) => v !== null));
const cloudRef = uid => doc(db, "users", uid, "private", "appState");
async function writeCloud() {
  if (!currentUser || suppress) return;
  const payload = readLocal();
  try {
    lastLocalWrite = Date.now();
    await setDoc(cloudRef(currentUser.uid), { data: payload, updatedAtMs: lastLocalWrite, updatedAt: serverTimestamp() }, { merge: true });
    status("Cloud sync is on · saved securely to your account.");
  } catch (e) { status("Cloud sync error: " + e.message); }
}
function scheduleSave() {
  if (!currentUser || suppress) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeCloud, 700);
}
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  originalSetItem.call(this, key, value);
  if (this === localStorage && DATA_KEYS.includes(String(key))) scheduleSave();
};
function applyCloudData(data) {
  suppress = true;
  try { for (const key of DATA_KEYS) if (typeof data?.[key] === "string") originalSetItem.call(localStorage, key, data[key]); }
  finally { suppress = false; }
}
async function startSync(user) {
  currentUser = user;
  if (stopRemote) stopRemote();
  const ref = cloudRef(user.uid);
  const snap = await getDoc(ref);
  const local = readLocal();
  if (!snap.exists()) {
    await writeCloud();
  } else {
    const remote = snap.data().data || {};
    // Preserve this browser's existing data; restore cloud-only keys where this browser has none.
    const merged = { ...remote, ...local };
    applyCloudData(merged);
    lastLocalWrite = Date.now();
    await setDoc(ref, { data: merged, updatedAtMs: lastLocalWrite, updatedAt: serverTimestamp() }, { merge: true });
    if (Object.keys(local).length === 0 && Object.keys(remote).length) location.reload();
  }
  stopRemote = onSnapshot(ref, snapshot => {
    if (!snapshot.exists()) return;
    const record = snapshot.data();
    if (record.updatedAtMs && record.updatedAtMs > lastLocalWrite + 1200) {
      const before = JSON.stringify(readLocal());
      applyCloudData(record.data || {});
      const after = JSON.stringify(readLocal());
      if (before !== after) location.reload();
    }
  }, error => status("Cloud listener error: " + error.message));
}
$("fbLogin").onclick = async () => {
  try { await signInWithEmailAndPassword(auth, $("fbEmail").value.trim(), $("fbPassword").value); }
  catch (e) { status(e.message); }
};
$("fbCreate").onclick = async () => {
  try { await createUserWithEmailAndPassword(auth, $("fbEmail").value.trim(), $("fbPassword").value); }
  catch (e) { status(e.message); }
};
$("fbLogout").onclick = () => signOut(auth).catch(e => status(e.message));
onAuthStateChanged(auth, async user => {
  $("fbSignedOut").hidden = !!user;
  $("fbSignedIn").hidden = !user;
  if (!user) {
    currentUser = null;
    if (stopRemote) stopRemote();
    stopRemote = null;
    status("Not signed in · your existing data remains on this device.");
    return;
  }
  $("fbUser").textContent = user.email || "Signed in";
  status("Connecting your private cloud data…");
  try { await startSync(user); }
  catch (e) { status("Sync setup error: " + e.message); }
});
