const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { loadCommands } = require("./loader");
const { parseMessage } = require("./parser");
const { owner, prefix } = require("../config");
const antiSpam = require("./antiSpam");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./utils/session");

  const sock = makeWASocket({
    auth: state,
    browser: ["SingularityBot", "Chrome", "110.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  const commands = loadCommands();

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const { text, cmdName, args, sender, reply, media, taged } = await parseMessage(msg, sock);

    // 🔴 hook global sebelum command biasa
    require("./messageHook")(msg, sock, text);

    // cek prefix
    if (!cmdName.startsWith(prefix)) return;
    const cleanCmd = cmdName.slice(prefix.length).toLowerCase();

    for (let cmd of commands) {
      if (cmd.command === cleanCmd) {
        if (cmd.ownerOnly && sender !== owner) return;

        // anti spam
        if (!antiSpam.check(sender)) {
          return sock.sendMessage(msg.key.remoteJid, { text: "⏳ Tunggu sebentar sebelum pakai command lagi." });
        }

        try {
          const res = await cmd.run({ args, msg, sock, sender, reply, media, taged });
          if (res) {
            if (Array.isArray(res)) {
              for (let r of res) await sock.sendMessage(msg.key.remoteJid, r);
            } else {
              await sock.sendMessage(msg.key.remoteJid, res);
            }
          }
        } catch (err) {
          console.error(`[ERROR] Command ${cleanCmd}:`, err.message);
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Error di command "${cleanCmd}": ${err.message}` });
        }
        break;
      }
    }
  });
}

startBot();
