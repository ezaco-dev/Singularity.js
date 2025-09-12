const fs = require("fs");
const path = require("path");

function loadCommands() {
  const commandsDir = path.join(__dirname, "../commands");
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));

  return files.map(f => require(path.join(commandsDir, f)));
}

module.exports = { loadCommands };
