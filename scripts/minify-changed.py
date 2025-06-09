import json
import subprocess
from pathlib import Path

# Get list of changed files (from last commit)
try:
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD^", "HEAD"],
        capture_output=True,
        text=True,
        check=True
    )
except subprocess.CalledProcessError as e:
    print("Error running git diff:", e.stderr)
    exit(1)

changed_files = result.stdout.splitlines()

# Ensure minified directory exists
minified_dir = Path("minified")
minified_dir.mkdir(exist_ok=True)

# Process only JSON files in data/
for file in changed_files:
    path = Path(file)
    if path.suffix == ".json" and path.parent.name == "data":
        try:
            with path.open(encoding="utf-8") as f:
                content = json.load(f)

            minified_path = minified_dir / path.name
            with minified_path.open("w", encoding="utf-8") as f:
                json.dump(content, f, separators=(",", ":"))  # minify

            print(f"Minified: {path} → {minified_path}")

        except Exception as e:
            print(f"Failed to process {file}: {e}")
