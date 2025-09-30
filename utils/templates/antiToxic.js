// commands/antibadword.js
const db = require("../utils/db");
const { Text } = require("../utils/sender");
const { badwords } = require("../config"); // pastikan config.exports.badwords = ["kata1","kata2"]

module.exports = {
  command: "antibadword",
  description: "Aktifkan/Matikan Anti-Badword (sensor kata kasar) di grup",
  usage: "!antibadword on / off",
  ownerOnly: false,
  adminOnly: true,
  groupOnly: true,
  privateOnly: false,

  run: async ({ args, msg, reply }) => {
    if (!args || !args[0]) return reply?.("⚠️ Gunakan: !antibadword on / off") || Text("⚠️ Gunakan: !antibadword on / off");

    const chatId = msg.key.remoteJid;
    const mode = args[0].toLowerCase();

    if (mode === "on") {
      db.set(`antibadword.${chatId}`, true);
      return Text("✅ AntiBadword berhasil *diaktifkan* di grup ini.");
    } else if (mode === "off") {
      db.set(`antibadword.${chatId}`, false);
      return Text("❌ AntiBadword *dimatikan* di grup ini.");
    } else {
      return Text("⚠️ Gunakan: !antibadword on / off");
    }
  },

  check: async (msg, sock, text) => {
    try {
      const chatId = msg.key.remoteJid;
      const enabled = db.get(`antibadword.${chatId}`, false);
      if (!enabled) return;

      const body = (text || "").toLowerCase();
      if (!body) return;

      // cek apakah ada badword (simple contains)
      const found = badwords.find(w => {
        if (!w) return false;
        const wlow = w.toLowerCase();
        // cek kata berdiri sendiri atau kemunculan substring (pilih strategi)
        // ini sederhana: cek word boundary
        const re = new RegExp(`\\b${wlow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
        return re.test(body);
      });

      if (found) {
        // hapus pesan
        await sock.sendMessage(chatId, { delete: msg.key });
        await sock.sendMessage(chatId, Text("⚠️ Kata terlarang terdeteksi. Pesan dihapus."));
      }
    } catch (e) {
      console.error("[ANTI-BADWORD HOOK ERR]", e.message);
    }
  },
};
