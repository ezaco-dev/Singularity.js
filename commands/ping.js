const { Text } = require("../helpers/message");

module.exports = {
  command: "ping",
  args: false,
  run: (args, msg, sock, sender, reply, taged) => {
    return Text("pong");
  }
};
