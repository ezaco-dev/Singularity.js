// commands/antiLink.js
const db = require("../utils/db");

module.exports = {
  command: "antilink",
  description: "Aktifkan/Matikan Anti-Link di grup",
  usage: "!antilink on / off",
  ownerOnly: false,
  adminOnly: true,
  groupOnly: true,
  privateOnly: false,

  // command handler
  run: async ({ args, msg, reply }) => {
    if (!args[0]) return reply("⚠️ Gunakan: !antilink on / off");

    const chatId = msg.key.remoteJid;
    const opt = args[0].toLowerCase();

    if (opt === "on") {
      db.set(`antilink.${chatId}`, true);
      reply("✅ AntiLink berhasil *diaktifkan* di grup ini.");
    } else if (opt === "off") {
      db.set(`antilink.${chatId}`, false);
      reply("❌ AntiLink *dimatikan* di grup ini.");
    } else {
      reply("⚠️ Gunakan: !antilink on / off");
    }
  },

  // hook otomatis jalan setiap pesan masuk
  check: async ({ msg, sock, text, isGroup }) => {
    if (!isGroup) return;

    const chatId = msg.key.remoteJid;
    const enabled = db.get(`antilink.${chatId}`, false);

    if (enabled && /https?:\/\/\S+/i.test(text)) {
      await sock.sendMessage(chatId, { delete: msg.key });
      await sock.sendMessage(chatId, { text: "🚫 Link terdeteksi, pesan dihapus!" });
    }
  },
};
