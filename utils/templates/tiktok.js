// commands/tiktok.js
const axios = require("axios");
const { Text, Video } = require("../utils/sender");

module.exports = {
  command: "tiktok",
  description: "Download video TikTok tanpa watermark (contoh pakai tikwm)",
  usage: "!tiktok <url>",
  ownerOnly: false,
  adminOnly: false,
  groupOnly: false,
  privateOnly: false,

  run: async ({ args, msg, sock, reply }) => {
    if (!args || !args[0]) return reply?.("⚠️ Kirim link TikTok yang valid.\n\nContoh: !tiktok https://vt.tiktok.com/...") || Text("⚠️ Kirim link TikTok yang valid.");

    const url = args[0];

    try {
      // contoh: TikWM API (bisa ganti endpoint lain bila mati)
      const res = await axios.post("https://www.tikwm.com/api/", new URLSearchParams({ url }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        timeout: 15000,
      });

      const data = res.data;
      if (!data || !data.data || !data.data.play) {
        return Text("⚠️ Tidak bisa mengambil video TikTok (link invalid / API error).");
      }

      // Video helper menerima URL atau buffer — utils/sender.getFile akan mengubah URL jadi { url }
      return Video(data.data.play, `🎬 ${data.data.title || "TikTok video"}`);
    } catch (err) {
      console.error("[TIKTOK ERROR]", err.message || err);
      // berikan pesan yang ramah
      return Text("⚠️ Terjadi kesalahan saat mengunduh video. Coba lagi nanti atau pakai link lain.");
    }
  },
};
