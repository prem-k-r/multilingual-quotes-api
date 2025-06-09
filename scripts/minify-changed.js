const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get changed files from last commit
const output = execSync("git diff --name-only HEAD^ HEAD").toString();
const changedFiles = output.split("\n").filter(file => file.startsWith("data/") && file.endsWith(".json"));

if (changedFiles.length === 0) {
    console.log("No data JSON files changed. Skipping.");
    process.exit(0);
}

for (const file of changedFiles) {
    const filename = path.basename(file);
    const srcPath = path.join("data", filename);
    const destPath = path.join("minified", filename);

    try {
        const data = JSON.parse(fs.readFileSync(srcPath, "utf8"));
        fs.writeFileSync(destPath, JSON.stringify(data));
        console.log(`Minified ${filename} → minified/${filename}`);
    } catch (err) {
        console.error(`Failed to minify ${filename}:`, err.message);
    }
}
