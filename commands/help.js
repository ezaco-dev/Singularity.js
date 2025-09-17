const fs = require("fs");
const path = require("path");
const { text } = require("../utils/sender");
const { loadCommands } = require("../utils/loader");

module.exports = {
  command: "help",
  aliases: ["menu"],
  description: "Menampilkan daftar command atau detail per command",
  usage: "!help [nama_command]",
  ownerOnly: false,
  adminOnly: false,
  groupOnly: false,
  privateOnly: false,
  cooldown: 2000,
  run: async ({ args }) => {
    const commands = loadCommands();

    // jika ada argumen → tampilkan detail command
    if (args.length > 0) {
      const name = args[0].toLowerCase();
      const cmd = commands.find(
        c => c.command === name || (c.aliases && c.aliases.includes(name))
      );

      if (!cmd) {
        return text(`⚠️ Command '${name}' tidak ditemukan.`);
      }

      return text(
        `📖 Detail Command\n\n` +
        `🔹 Nama: ${cmd.command}\n` +
        `🔸 Alias: ${cmd.aliases?.join(", ") || "-"}\n` +
        `📝 Deskripsi: ${cmd.description}\n` +
        `⚡ Usage: ${cmd.usage || "-"}\n` +
        `👑 OwnerOnly: ${cmd.ownerOnly}\n` +
        `👮 AdminOnly: ${cmd.adminOnly}\n` +
        `👥 GroupOnly: ${cmd.groupOnly}\n` +
        `📩 PrivateOnly: ${cmd.privateOnly}\n`
      );
    }

    // jika tanpa argumen → tampilkan semua daftar command
    let helpText = "📑 Daftar Command:\n\n";
    for (let cmd of commands) {
      helpText += `• ${cmd.command} → ${cmd.description}\n`;
    }

    helpText += `\nKetik *!help <command>* untuk detail.`;
    return text(helpText);
  }
};
