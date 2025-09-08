const { Text } = require("../utils/sender");

module.exports = {
  command: "tes",
  args: false,
  ownerOnly: false,
  run: () => {
    return [
    	Text("ini balasan default untuk tes"),
    	Text("hidup jokowi")
    	]
  }
};
