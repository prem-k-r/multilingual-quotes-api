const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getSafeChangedFiles() {
    try {
        // Try getting changed files from last commit
        return execSync("git diff --name-only HEAD~1")
            .toString()
            .split("\n")
            .filter(file => file.startsWith("data/") && file.endsWith(".json"));
    } catch (e) {
        console.warn("⚠️ git diff failed — falling back to all data/*.json");
        try {
            return execSync("git ls-files data/*.json")
                .toString()
                .split("\n")
                .filter(Boolean);
        } catch {
            console.error("❌ Could not read any data/*.json files");
            return [];
        }
    }
}

const changedFiles = getSafeChangedFiles();

if (changedFiles.length === 0) {
    console.log("ℹ️ No JSON files to process.");
    process.exit(0);
}

for (const file of changedFiles) {
    const filename = path.basename(file);
    const srcPath = path.join("data", filename);
    const destPath = path.join("minified", filename);

    try {
        const raw = fs.readFileSync(srcPath, "utf8");
        const parsed = JSON.parse(raw);
        fs.mkdirSync("minified", { recursive: true });
        fs.writeFileSync(destPath, JSON.stringify(parsed));
        console.log(`✅ Minified: ${filename} → minified/${filename}`);
    } catch (err) {
        console.error(`❌ Error processing ${filename}: ${err.message}`);
    }
}
