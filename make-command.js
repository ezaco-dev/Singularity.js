const fs = require("fs");
const path = require("path");
const readline = require("readline");

const name = process.argv[2];
const type = process.argv[3] || "single"; // default single

if (!name) {
  console.error("❌ Masukkan nama command. Contoh:");
  console.error("   node make-command.js <command name> single (for one word)");
  console.error("   node make-command.js <command name> multi (for more word)");
  process.exit(1);
}

const filePath = path.join(__dirname, "commands", `${name}.js`);

if (fs.existsSync(filePath)) {
  console.error(`❌ Command "${name}" sudah ada.`);
  process.exit(1);
}

function makeSingle() {
  return `const { Text } = require("../helpers/message");

module.exports = {
  command: "${name}",
  args: false,
  run: (args, msg, sock, sender, reply, taged) => {
    return Text("ini balasan default untuk ${name}");
  }
};`;
}

function makeMulti(words) {
  let vars = [];
  let assigns = [];
  for (let i = 1; i <= words; i++) {
    vars.push(`word${i}`);
    assigns.push(`const word${i} = args[${i - 1}] || "";`);
  }

  return `const { Text } = require("../helpers/message");

module.exports = {
  command: "${name}",
  args: true,
  run: (args, msg, sock, sender, reply, taged) => {
    ${assigns.join("\n    ")}
    if (args.length < ${words}) return Text("⚠️ Harus ada minimal ${words} kata setelah ${name}");
    return Text(\`Kamu kirim: ${vars.map(v => `\${${v}}`).join(" ")}\`);
  }
};`;
}

if (type === "single") {
  fs.writeFileSync(filePath, makeSingle().trim());
  console.log(`✅ Command "${name}" (single) berhasil dibuat di commands/${name}.js`);
} else if (type === "multi") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("👉 Mau berapa kata? ", (answer) => {
    const words = parseInt(answer);
    if (isNaN(words) || words < 1) {
      console.error("❌ Jumlah kata harus angka positif.");
      rl.close();
      process.exit(1);
    }
    fs.writeFileSync(filePath, makeMulti(words).trim());
    console.log(`✅ Command "${name}" (multi-${words} kata) berhasil dibuat di commands/${name}.js`);
    rl.close();
  });
} else {
  console.error("❌ Tipe tidak valid. Gunakan: single / multi");
  process.exit(1);
}
