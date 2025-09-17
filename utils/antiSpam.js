const cooldown = new Map();
const delay = 3000; // 3 detik

function check(user) {
  const now = Date.now();
  if (cooldown.has(user)) {
    const last = cooldown.get(user);
    if (now - last < delay) return false;
  }
  cooldown.set(user, now);
  return true;
}

module.exports = { check };
