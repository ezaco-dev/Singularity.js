const { owner } = require("../config");

function isOwner(user) {
  return user === owner;
}

function isAdmin(user, groupMetadata) {
  return groupMetadata?.participants?.some(p => p.id === user && p.admin !== null);
}

module.exports = { isOwner, isAdmin };
