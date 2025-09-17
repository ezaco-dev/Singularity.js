// utils/loader.js
const fs = require("fs");
const path = require("path");

function loadCommands() {
  const commandsDir = path.join(__dirname, "..", "commands");
  if (!fs.existsSync(commandsDir)) return [];
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));
  const cmds = [];
  for (const f of files) {
    try {
      const mod = require(path.join(commandsDir, f));
      if (mod && mod.command) cmds.push(mod);
    } catch (e) {
      console.error("Error load command", f, e.message);
    }
  }
  return cmds;
}

module.exports = { loadCommands };