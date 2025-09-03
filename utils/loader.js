const fs = require("fs");
const path = require("path");

function loadCommands() {
  const commands = [];
  const dir = path.join(__dirname, "../commands");
  
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith(".js")) {
      const cmd = require(path.join(dir, file));
      commands.push(cmd);
    }
  });

  return commands;
}

module.exports = { loadCommands };
