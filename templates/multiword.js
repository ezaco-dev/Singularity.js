const { Text } = require("../utils/sender");

module.exports = {
  command: "ulang",
  aliases: ["repeat"],
  description: "Contoh command multi word",
  usage: "!ulang <teks>",
  ownerOnly: false,
  adminOnly: false,
  groupOnly: false,
  privateOnly: false,
  cooldown: 2000,

  run: async ({ args }) => {
    if (!args || args.length === 0) {
      return Text("⚠️ Gunakan: !ulang <teks>");
    }

    // gabungkan semua kata setelah command
    return [Text(args.join(" "));]
  }
};
