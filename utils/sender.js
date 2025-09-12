// utils/sender.js
const fs = require("fs");
const path = require("path");

/**
 * Kirim teks biasa
 */
function Text(text) {
  return {
   text
  };
}

/**
 * Kirim gambar
 * @param {Buffer|string} data - bisa buffer, path file, atau URL
 * @param {string} caption
 */
function Image(data, caption = "") {
  return {
    image: getFile(data),
    caption,
  };
}

/**
 * Kirim video
 * @param {Buffer|string} data - bisa buffer, path file, atau URL
 * @param {string} caption
 */
function Video(data, caption = "") {
  return {
    video: getFile(data),
    caption,
  };
}

/**
 * Kirim audio / voice note
 * @param {Buffer|string} data
 * @param {boolean} ptt - true kalau mau jadi voice note
 */
function Audio(data, ptt = false) {
  return {
    audio: getFile(data),
    mimetype: "audio/mpeg",
    ptt,
  };
}

/**
 * Kirim sticker (webp)
 * @param {Buffer|string} data
 */
function Sticker(data) {
  return {
    sticker: getFile(data),
  };
}

/**
 * Kirim dokumen
 * @param {Buffer|string} data
 * @param {string} fileName
 * @param {string} mimetype
 */
function Document(data, fileName = "file.txt", mimetype = "application/pdf") {
  return {
    document: getFile(data),
    fileName,
    mimetype,
  };
}

/**
 * Kirim lokasi
 * @param {number} lat
 * @param {number} lng
 * @param {string} name
 * @param {string} address
 */
function Location(lat, lng, name = "", address = "") {
  return {
    location: { degreesLatitude: lat, degreesLongitude: lng },
    name,
    address,
  };
}

/**
 * Kirim kontak / vCard
 * @param {string} phone
 * @param {string} name
 */
function Contact(phone, name = "Kontak") {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${phone}:${phone}
END:VCARD`;

  return {
    contacts: {
      displayName: name,
      contacts: [{ vcard }],
    },
  };
}

/**
 * Helper: otomatis parse input (buffer / path / url string)
 */
function getFile(data) {
  if (Buffer.isBuffer(data)) return data;

  // kalau input path file
  if (typeof data === "string" && fs.existsSync(data)) {
    return fs.readFileSync(path.resolve(data));
  }

  // kalau input string URL, biarkan Baileys fetch sendiri
  if (typeof data === "string" && data.startsWith("http")) {
    return { url: data };
  }

  throw new Error("Format file tidak valid (harus buffer, path, atau url)");
}

module.exports = {
  Text,
  Image,
  Video,
  Audio,
  Sticker,
  Document,
  Location,
  Contact,
};
