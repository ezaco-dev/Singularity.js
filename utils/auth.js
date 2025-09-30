const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const readline = require("readline")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./utils/session")
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["Ubuntu", "Chrome", "110.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { qr, connection, lastDisconnect } = update

    if (qr) {
      console.log("📲 Scan QR berikut untuk login:")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      console.log("✅ Bot berhasil terhubung ke WhatsApp")
    }

    if (connection === "close") {
      console.error("❌ Koneksi terputus:", lastDisconnect?.error?.message)
      console.log("🔄 Mencoba koneksi ulang dalam 5 detik...")
      setTimeout(() => startBot(), 5000)
    }
  })

  if (process.argv[2] === "pairing") {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question("Masukkan nomor HP (628xxx): ", async (nomor) => {
      try {
        const code = await sock.requestPairingCode(nomor)
        console.log("🔑 Pairing Code:", code)

        sock.ev.on("connection.update", (update) => {
          if (
            update.connection === undefined &&
            update.qr === undefined &&
            update.pairingEphemeralKeyPair
          ) {
            console.log("✅ Pairing sukses, keluar agar session tersimpan...")
            process.exit(0)
          }
        })
      } catch (err) {
        console.error("⚠️ Gagal minta pairing code:", err.message)
      }
      rl.close()
    })
  }
}

startBot()
