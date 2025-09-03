const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@adiwajshing/baileys");
const readline = require("readline");
const { loadCommands } = require("./utils/loader");

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const method = await ask("Pilih metode login (qrcode / pairing): ");
  let phoneNumber = null;

  if (method === "pairing") {
    phoneNumber = await ask("Masukkan nomor HP (contoh: 6281234567890): ");
  }

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: method === "qrcode",
    browser: ['SingularityBot', 'Chrome', '1.0.0']
  });

  // 🔹 Kalau pairing → generate kode setelah socket connect
  if (method === "pairing") {
    if (!sock.authState.creds.registered && phoneNumber) {
      const code = await sock.requestPairingCode(phoneNumber.trim());
      console.log(`📲 Pairing Code (masukkan di WhatsApp > Linked Devices): ${code}`);
    }
  }

  sock.ev.on("creds.update", saveCreds);

  // 🔹 Load commands
  const commands = loadCommands();

  // 🔹 Listener pesan
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    let text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    for (let cmd of commands) {
      if (text.startsWith(cmd.command)) {
        try {
          if (cmd.type === "text") {
            await sock.sendMessage(msg.key.remoteJid, { text: cmd.response });
          } 
          else if (cmd.type === "image") {
            if (!cmd.response.startsWith("http")) throw new Error("Response bukan URL image");
            await sock.sendMessage(msg.key.remoteJid, { image: { url: cmd.response } });
          }
          else if (cmd.type === "sticker") {
            if (!cmd.response.startsWith("http")) throw new Error("Response bukan URL sticker");
            await sock.sendMessage(msg.key.remoteJid, { sticker: { url: cmd.response } });
          }
          else {
            throw new Error(`Tipe pesan ${cmd.type} belum didukung`);
          }
        } catch (err) {
          console.error(`[ERROR] Command "${cmd.command}" gagal:`, err.message);
          await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Error di command "${cmd.command}": ${err.message}` });
        }
        break;
      }
    }
  });
}

startBot();
