const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const readline = require("readline")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["SingularityBot", "Chrome", "1.0.0"]
  })

  // QR handler
  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update
    if (qr) {
      console.log("📲 Scan QR berikut untuk login:")
      qrcode.generate(qr, { small: true })
    }
    if (connection === "open") {
      console.log("✅ Bot berhasil terhubung ke WhatsApp")
    }
  })

  // pairing mode
  if (process.argv[2] === "pairing") {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question("Masukkan nomor HP (628xxx): ", async (nomor) => {
      try {
        const code = await sock.requestPairingCode(nomor)
        console.log("🔑 Pairing Code:", code)
      } catch (err) {
        console.error("⚠️ Gagal minta pairing code:", err.message)
      }
      rl.close()
    })
  }

  sock.ev.on("creds.update", saveCreds)

	//script

	sock.ev.on("messages.upsert", async ({ messages }) => {
	  const msg = messages[0];
	  if (!msg.message) return;
	
	  // Ambil isi text dari chat (bisa chat biasa / extended)
	  let text = msg.message.conversation || msg.message.extendedTextMessage?.text;
	  if (!text) return;
	
	  // Loop semua command
	  for (let cmd of commands) {
	    if (text.startsWith(cmd.command)) {
	      try {
	        // Kalau tipe command = text → kirim balasan text
	        if (cmd.type === "text") {
	          await sock.sendMessage(msg.key.remoteJid, { text: cmd.response });
	        }
	      } catch (err) {
	        console.error(`[ERROR] Command "${cmd.command}" gagal:`, err.message);
	      }
	      break;
	    }
	  }
	});
	
}

startBot()
