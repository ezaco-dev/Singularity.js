const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys");
const { loadCommands } = require("./utils/loader");
const { owner } = require("./config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    browser: ["SingularityBot", "Chrome", "110.0.0"]
  });

  const commands = loadCommands();

  // Logging kredensial
  sock.ev.on("creds.update", saveCreds);

  // Handler pesan masuk
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const fromMe = msg.key.fromMe ? "(BOT sendiri)" : "";

    // 🔥 LOGGING ke terminal
    console.log(`
  ==== Pesan Masuk ====
  Dari    : ${sender} ${fromMe}
  Isi     : ${text}
  =====================
    `);

    // cek reply context
    let reply = null;
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

      // text
      if (quoted.conversation) {
        reply = {
          type: "text",
          data: quoted.conversation
        };
      }

      // image
      if (quoted.imageMessage) {
        try {
          const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {},
            { logger: console }
          );
          reply = {
            type: "image",
            data: buffer,
            caption: quoted.imageMessage.caption || ""
          };
        } catch (err) {
          console.error("[ERROR] downloadMediaMessage:", err.message);
        }
      }

      // video
      if (quoted.videoMessage) {
        try {
          const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {},
            { logger: console }
          );
          reply = {
            type: "video",
            data: buffer,
            caption: quoted.videoMessage.caption || ""
          };
        } catch (err) {
          console.error("[ERROR] downloadMediaMessage:", err.message);
        }
      }

      // audio/voice
      if (quoted.audioMessage) {
        try {
          const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {},
            { logger: console }
          );
          reply = {
            type: "audio",
            data: buffer,
            ptt: quoted.audioMessage.ptt || false // true kalau voice note
          };
        } catch (err) {
          console.error("[ERROR] downloadMediaMessage:", err.message);
        }
      }
    }

    let taged = [];
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      taged = msg.message.extendedTextMessage.contextInfo.mentionedJid;
    }

    const parts = text.trim().split(" ");
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(2);

    for (let cmd of commands) {
      if (cmd.command === cmdName) {
        const ownerOnly = cmd.ownerOnly || false;

        if (ownerOnly && sender !== owner) {
          return;
        }

        try {
          // 👉 sender + reply ikut dilempar ke command
          const responses = await cmd.run(args, msg, sock, sender, reply, taged);

          if (responses) {
            if (Array.isArray(responses)) {
              for (let res of responses) {
                await sock.sendMessage(msg.key.remoteJid, res);
              }
            } else {
              await sock.sendMessage(msg.key.remoteJid, responses);
           }
          }
        } catch (err) {
          console.error(`[ERROR] Command ${cmdName} gagal:`, err.message);
          await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ Error di command "${cmdName}": ${err.message}`,
          });
        }
        break;
      }
    }

  });
}

startBot();
