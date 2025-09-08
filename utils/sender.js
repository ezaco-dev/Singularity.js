function Text(text) {
  return { text };
}

function Image(url) {
  return { image: { url } };
}

function Sticker(url) {
  return { sticker: { url } };
}

module.exports = { Text, Image, Sticker };
