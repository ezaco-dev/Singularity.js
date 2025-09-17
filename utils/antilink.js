const db = require("./db");

async function checkAntiLink(sock, msg, text, chat, isGroup) {
  if (!isGroup) return false;

  const antilink = db.get(`antilink.${chat}`, false);
  if (antilink && /https?:\/\/\S+/i.test(text)) {
    // hapus pesan
    await sock.sendMessage(chat, { delete: msg.key });
    // kirim notif
    await sock.sendMessage(chat, {
      text: "🚫 Link terdeteksi, pesan dihapus!",
    });
    return true; // sudah ditangani
  }
  return false; // ga ada link
}

function toggleAntiLink(chat, state) {
  db.set(`antilink.${chat}`, state);
  return state;
}

module.exports = { checkAntiLink, toggleAntiLink };
