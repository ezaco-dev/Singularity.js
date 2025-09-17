// utils/sender.js
const fs = require("fs");
const path = require("path");

/**
 * Basic text helper (lowercase)
 * @param {string} content
 * @param {object} extra - extra fields, mis. { mentions: [...] }
 * @returns {object} message object sesuai Baileys
 */
function text(content, extra = {}) {
  return { text: String(content), ...extra };
}
// Alias untuk kompatibilitas (beberapa template pakai Text())
const Text = text;

/**
 * Helper file loader (buffer / path / url)
 */
function getFile(data) {
  if (!data) throw new Error("No file data");
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === "string" && fs.existsSync(data)) {
    return fs.readFileSync(path.resolve(data));
  }
  if (typeof data === "string" && data.startsWith("http")) {
    return { url: data };
  }
  throw new Error("Format file tidak valid (harus buffer, path, atau url)");
}

/** Media helpers */
function Image(data, caption = "", extra = {}) {
  return { image: getFile(data), caption, ...extra };
}
function Video(data, caption = "", extra = {}) {
  return { video: getFile(data), caption, ...extra };
}
function Audio(data, ptt = false, extra = {}) {
  return { audio: getFile(data), ptt, ...extra };
}
function Sticker(data, extra = {}) {
  return { sticker: getFile(data), ...extra };
}
function Document(data, fileName = "file.bin", mimetype = "application/octet-stream", extra = {}) {
  return { document: getFile(data), fileName, mimetype, ...extra };
}
function Location(lat, lng, name = "", address = "") {
  return { location: { degreesLatitude: lat, degreesLongitude: lng }, name, address };
}
function Contact(phone, name = "Kontak") {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${phone}:${phone}
END:VCARD`;
  return { contacts: { displayName: name, contacts: [{ vcard }] } };
}

module.exports = {
  text,
  Text,
  Image,
  Video,
  Audio,
  Sticker,
  Document,
  Location,
  Contact,
  getFile
};
