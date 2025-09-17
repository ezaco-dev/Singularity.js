const { downloadMediaMessage } = require("@whiskeysockets/baileys");

async function parseMessage(msg, sock) {
  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    "";

  const sender = msg.key.participant || msg.key.remoteJid;

  // quoted / reply
  let reply = null;
  let media = null;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) {
    if (quoted.conversation) reply = { type: "text", data: quoted.conversation };
    if (quoted.imageMessage) {
      const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {}, { logger: console });
      reply = { type: "image", data: buffer, caption: quoted.imageMessage.caption || "" };
    }
    if (quoted.videoMessage) {
      const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {}, { logger: console });
      reply = { type: "video", data: buffer, caption: quoted.videoMessage.caption || "" };
    }
    if (quoted.audioMessage) {
      const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {}, { logger: console });
      reply = { type: "audio", data: buffer, ptt: quoted.audioMessage.ptt || false };
    }
  }

  // media utama
  if (msg.message.imageMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = { type: "image", data: buffer, caption: msg.message.imageMessage.caption || "" };
  }
  if (msg.message.videoMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = { type: "video", data: buffer, caption: msg.message.videoMessage.caption || "" };
  }
  if (msg.message.audioMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = { type: "audio", data: buffer, ptt: msg.message.audioMessage.ptt || false };
  }

  // tagging
  const taged = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  const parts = text.trim().split(" ");
  const cmdName = parts[0] || "";
  const args = parts.slice(1);

  return { text, cmdName, args, sender, reply, media, taged };
}

module.exports = { parseMessage };
