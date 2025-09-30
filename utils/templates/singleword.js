// Template Command: Single Word
// Contoh penggunaan: ping

module.exports = {
  command: "ping", // nanti otomatis diganti kalau pakai "make"
  aliases: [], // bisa tambahkan alias lain, misalnya ["test"]
  description: "Contoh command single word sederhana",
  usage: "ping",
  ownerOnly: false,   // true kalau hanya bisa dipakai owner
  adminOnly: false,   // true kalau hanya bisa dipakai admin group
  groupOnly: false,   // true kalau hanya jalan di group
  privateOnly: false, // true kalau hanya jalan di private chat
  cooldown: 3000,     // jeda antar penggunaan (ms)

  run: async ({ args, msg, sock, sender, reply, media, taged }) => {
    // args = array kata setelah command
    // msg   = pesan asli
    // sock  = koneksi baileys
    // sender= siapa pengirim
    // reply = balasan kalau user reply pesan lain
    // media = file yang dikirim
    // taged = user yang di-mention

    return { text: "🏓 Pong! Command single word berhasil jalan." };
  }
};
