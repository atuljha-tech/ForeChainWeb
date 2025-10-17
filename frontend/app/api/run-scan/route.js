// app/api/run-scan/route.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function sha256(content) {
  return "0x" + crypto.createHash("sha256").update(content).digest("hex");
}

export async function POST() {
  try {
    // FIXED: Script path
    const scriptPath = path.join(process.cwd(), "..", "kali-simulation", "scan-demo.sh");
    
    // run the demo scan
    await new Promise((resolve, reject) => {
      exec(`bash "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve(stdout);
      });
    });

    // FIXED: Reports directory path
    const reportsDir = path.join(process.cwd(), "..", "kali-simulation", "reports");
    const files = fs.readdirSync(reportsDir).filter(Boolean);
    if (!files.length) throw new Error("No reports found after running scan.");

    // newest by mtime
    const newest = files
      .map((f) => ({ f, mtime: fs.statSync(path.join(reportsDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)[0].f;
    const filePath = path.join(reportsDir, newest);
    const content = fs.readFileSync(filePath, "utf-8");
    const hash = sha256(content);

    // FIXED: Ledger path (was pointing to reports folder instead of JSON file)
    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      try { ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8")); } catch (e) { ledger = []; }
    }

    // create new ledger entry
    const entry = {
      id: ledger.length + 1,
      filename: newest,
      tool: newest.split("_")[0] || "unknown",
      timestamp: new Date().toISOString(),
      uploader: "local_demo_user",
      hash,
      filepath: `kali-simulation/reports/${newest}`
    };

    ledger.push(entry);
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), "utf-8");

    return new Response(JSON.stringify({ success: true, entry }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("run-scan error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}