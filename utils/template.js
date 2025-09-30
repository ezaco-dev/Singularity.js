#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TEMPLATE_DIR = path.join(__dirname, "templates");
const COMMAND_DIR = path.join(__dirname, "..", "commands");

function listTemplates() {
  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.log("📂 Folder template tidak ada.");
    return;
  }
  const files = fs.readdirSync(TEMPLATE_DIR).filter(f => f.endsWith(".js"));

  const hidden = ["singleword.js", "multiword.js"];
  const visible = files.filter(f => !hidden.includes(f));

  if (visible.length === 0) {
    console.log("⚠️ Tidak ada template.");
    return;
  }

  console.log("📑 Daftar template:");
  visible.forEach(f => console.log(" - " + f.replace(".js", "")));
}

function useTemplate(name) {
  if (["singleword", "multiword"].includes(name)) {
    console.log(`⚠️ Template '${name}' hanya bisa dipakai lewat "make", bukan "use".`);
    return;
  }

  const file = path.join(TEMPLATE_DIR, name + ".js");
  if (!fs.existsSync(file)) {
    console.log(`⚠️ Template '${name}' tidak ditemukan.`);
    return;
  }
  const dest = path.join(COMMAND_DIR, name + ".js");
  if (fs.existsSync(dest)) {
    console.log(`⚠️ Command '${name}' sudah ada di folder commands.`);
    return;
  }
  fs.copyFileSync(file, dest);
  console.log(`✅ Template '${name}' berhasil dipakai → commands/${name}.js`);
}

function installTemplate(repoUrl) {
  if (!repoUrl) {
    console.log("⚠️ Gunakan: node template.js install <url_repo>");
    return;
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR);
  }

  try {
    console.log("📥 Mengunduh template...");
    execSync(`git clone ${repoUrl} tmp_template_repo`, { stdio: "inherit" });

    const sourceDir = path.join(__dirname, "tmp_template_repo", "template");

    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir);
      files.forEach(f => {
        fs.copyFileSync(path.join(sourceDir, f), path.join(TEMPLATE_DIR, f));
        console.log(`✅ Template '${f}' berhasil di-install.`);
      });
    } else {
      console.log("⚠️ Repo tidak punya folder 'template'.");
    }

    execSync("rm -rf tmp_template_repo");
  } catch (err) {
    console.error("❌ Gagal install template:", err.message);
  }
}

function makeTemplate(fileName, type) {
  if (!fileName || !type) {
    console.log("⚠️ Gunakan: node template.js make <nama_file> <single|multi>");
    return;
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.log("⚠️ Folder templates tidak ditemukan.");
    return;
  }

  const templateFile = path.join(TEMPLATE_DIR, `${type}word.js`);
  if (!fs.existsSync(templateFile)) {
    console.log(`⚠️ Template '${type}word' tidak ada.`);
    return;
  }

  const dest = path.join(COMMAND_DIR, `${fileName}.js`);
  if (fs.existsSync(dest)) {
    console.log(`⚠️ Command '${fileName}' sudah ada di folder commands.`);
    return;
  }

  let content = fs.readFileSync(templateFile, "utf8");

  // Replace default command name dengan nama file
  content = content.replace(/command:\s*".*?"/, `command: "${fileName}"`);
  content = content.replace(/usage:\s*".*?"/, `usage: "!${fileName}"`);

  fs.writeFileSync(dest, content);
  console.log(`✅ Command '${fileName}' berhasil dibuat dari template '${type}word'`);
}

function main() {
  const [,, cmd, arg1, arg2] = process.argv;

  switch (cmd) {
    case "list":
      listTemplates();
      break;
    case "use":
      if (!arg1) return console.log("⚠️ Gunakan: node template.js use <nama>");
      useTemplate(arg1);
      break;
    case "install":
      installTemplate(arg1);
      break;
    case "make":
      makeTemplate(arg1, arg2);
      break;
    default:
      console.log("⚡ Pemakaian:");
      console.log("  node template.js list");
      console.log("  node template.js use <nama>");
      console.log("  node template.js install <repo_url>");
      console.log("  node template.js make <nama_file> <single|multi>");
  }
}

main();
