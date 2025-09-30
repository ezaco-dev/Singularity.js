const fs = require("fs");
const path = require("path");

// load semua command yang ada
const commandsPath = path.join(__dirname, "../commands");
const commands = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"))
  .map((file) => require(path.join(commandsPath, file)));

module.exports = async (msg, sock, text) => {
  for (const cmd of commands) {
    if (typeof cmd.check === "function") {
      try {
        await cmd.check(msg, sock, text);
      } catch (err) {
        console.error(`Hook error di ${cmd.command}:`, err);
      }
    }
  }
};
