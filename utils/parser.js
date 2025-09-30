const { downloadMediaMessage } = require("@whiskeysockets/baileys");

async function parseMessage(msg, sock) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    "";

  const cmdName = text.trim().split(/\s+/)[0] || "";
  const args = text.trim().split(/\s+/).slice(1);

  // fungsi reply cepat
  const reply = (m) =>
    sock.sendMessage(msg.key.remoteJid, { text: m }, { quoted: msg });

  // cek quoted / pesan yang direply
  let quotedData = null;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) {
    if (quoted.conversation) {
      quotedData = { type: "text", data: quoted.conversation };
    }
    if (quoted.imageMessage) {
      const buffer = await downloadMediaMessage(
        { message: quoted },
        "buffer",
        {},
        { logger: console }
      );
      quotedData = {
        type: "image",
        data: buffer,
        caption: quoted.imageMessage.caption || "",
      };
    }
    if (quoted.videoMessage) {
      const buffer = await downloadMediaMessage(
        { message: quoted },
        "buffer",
        {},
        { logger: console }
      );
      quotedData = {
        type: "video",
        data: buffer,
        caption: quoted.videoMessage.caption || "",
      };
    }
    if (quoted.audioMessage) {
      const buffer = await downloadMediaMessage(
        { message: quoted },
        "buffer",
        {},
        { logger: console }
      );
      quotedData = {
        type: "audio",
        data: buffer,
        ptt: quoted.audioMessage.ptt || false,
      };
    }
  }

  // media utama
  let media = null;
  if (msg.message.imageMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = {
      type: "image",
      data: buffer,
      caption: msg.message.imageMessage.caption || "",
    };
  }
  if (msg.message.videoMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = {
      type: "video",
      data: buffer,
      caption: msg.message.videoMessage.caption || "",
    };
  }
  if (msg.message.audioMessage) {
    const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
    media = {
      type: "audio",
      data: buffer,
      ptt: msg.message.audioMessage.ptt || false,
    };
  }

  // taged user
  const taged = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  return { text, cmdName, args, sender, reply, media, quoted: quotedData, taged };
}

module.exports = { parseMessage };
