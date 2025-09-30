// utils/db.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function ensure() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

function read() {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "{}");
  } catch (e) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
    return {};
  }
}

function write(data) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
  get(path, fallback = null) {
    const data = read();
    if (!path) return data;
    const keys = path.split(".");
    let cur = data;
    for (let k of keys) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, k)) cur = cur[k];
      else return fallback;
    }
    return cur;
  },
  set(path, value) {
    const data = read();
    const keys = path.split(".");
    let cur = data;
    while (keys.length > 1) {
      const k = keys.shift();
      if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
      cur = cur[k];
    }
    cur[keys[0]] = value;
    write(data);
    return value;
  },
  push(path, value) {
    const arr = db.get(path, []);
    if (!Array.isArray(arr)) throw new Error("Path is not an array");
    arr.push(value);
    db.set(path, arr);
    return arr;
  },
  has(path) {
    const val = db.get(path, undefined);
    return val !== undefined && val !== null;
  },
  delete(path) {
    const data = read();
    const keys = path.split(".");
    let cur = data;
    while (keys.length > 1) {
      const k = keys.shift();
      if (!cur[k]) return false;
      cur = cur[k];
    }
    const ok = delete cur[keys[0]];
    write(data);
    return ok;
  }
};

module.exports = db;
