// build-secure.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Ensure obfuscated directory exists
const obfuscatedDir = path.join(__dirname, "obfuscated");
if (!fs.existsSync(obfuscatedDir)) {
  fs.mkdirSync(obfuscatedDir);
}

// Files to obfuscate (updated for src/)
const filesToObfuscate = [
  { input: "src/main.js", output: "obfuscated/main.js" },
  { input: "src/renderer.js", output: "obfuscated/renderer.js" }
];

// Obfuscation options
const options =
  "--compact true --control-flow-flattening true --dead-code-injection true " +
  "--debug-protection true --disable-console-output true " +
  "--identifier-names-generator hexadecimal --string-array true " +
  "--string-array-threshold 0.75 --unicode-escape-sequence true";

filesToObfuscate.forEach(({ input, output }) => {
  console.log(`Obfuscating ${input} → ${output}`);
  execSync(`npx javascript-obfuscator ${input} --output ${output} ${options}`, {
    stdio: "inherit"
  });
});

console.log("✅ Obfuscation complete!");
