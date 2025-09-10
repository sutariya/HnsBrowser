// build-secure.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure obfuscated directory exists
const obfuscatedDir = path.join(__dirname, "obfuscated");
if (!fs.existsSync(obfuscatedDir)) {
  fs.mkdirSync(obfuscatedDir);
}

// Files to obfuscate
const filesToObfuscate = [
  { input: "src/main.js", output: "obfuscated/main.js" },
  { input: "src/renderer.js", output: "obfuscated/renderer.js" }
];

// Simplified, safer obfuscation options
const options =
  "--compact true --control-flow-flattening false --dead-code-injection false " +
  "--debug-protection false --disable-console-output false " +
  "--identifier-names-generator hexadecimal --string-array true " +
  "--string-array-threshold 0.75 --unicode-escape-sequence true";

filesToObfuscate.forEach(({ input, output }) => {
  console.log(`Obfuscating ${input} → ${output}`);
  execSync(`npx javascript-obfuscator ${input} --output ${output} ${options}`, {
    stdio: "inherit"
  });
});

// Copy HTML and preload script to obfuscated directory
console.log("Copying essential files to obfuscated directory...");
fs.copyFileSync(path.join(__dirname, 'src', 'index.html'), path.join(obfuscatedDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'src', 'preload.js'), path.join(obfuscatedDir, 'preload.js'));


console.log("✅ Obfuscation and file copying complete!");