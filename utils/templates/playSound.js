const { Text, Audio } = require("../utils/sender");
const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const { spawn } = require("child_process");

async function convertToOpus(buffer) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-f", "opus",
      "-ac", "2",
      "-ar", "48000",
      "pipe:1"
    ]);

    const chunks = [];
    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
    ffmpeg.on("close", () => resolve(Buffer.concat(chunks)));
    ffmpeg.on("error", reject);

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

module.exports = {
  command: "play",
  aliases: ["song", "musik"],
  description: "Cari dan putar lagu dari YouTube",
  usage: "!play <judul lagu>",
  cooldown: 10000,

  run: async ({ args }) => {
    if (!args || args.length === 0) {
      return Text("⚠️ Gunakan: !play <judul lagu>");
    }

    try {
      const query = args.join(" ");
      const search = await yts(query);
      const song = search.videos[0];
      if (!song) return Text("❌ Lagu tidak ditemukan.");

      const stream = ytdl(song.url, {
        filter: "audioonly",
        quality: "highestaudio"
      });

      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      // convert ke opus biar bisa diputar di WA
      const opusBuffer = await convertToOpus(buffer);

      return [
        Text(`🎵 *${song.title}*\n👤 ${song.author.name}\n⏳ ${song.timestamp}\n🔗 ${song.url}`),
        Audio(opusBuffer, {
          mimetype: "audio/ogg; codecs=opus",
          ptt: false
        })
      ];
    } catch (err) {
      console.error("[PLAY ERROR]", err);
      return Text("⚠️ Gagal mengambil audio, coba lagi.");
    }
  }
};
