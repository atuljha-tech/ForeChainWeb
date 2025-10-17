// app/api/verify/route.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

function sha256(content) {
  return "0x" + crypto.createHash("sha256").update(content).digest("hex");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { filename } = body;
    if (!filename) return new Response(JSON.stringify({ ok: false, error: "filename required" }), { status: 400 });

    const filePath = path.join(process.cwd(), "..", "kali-simulation", "reports", filename);
    if (!fs.existsSync(filePath)) return new Response(JSON.stringify({ ok: false, error: "file not found" }), { status: 404 });

    const content = fs.readFileSync(filePath, "utf-8");
    const hash = sha256(content);

    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      try { ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8")); } catch (e) { ledger = []; }
    }

    const entry = ledger.find((e) => e.filename === filename);
    const matches = entry ? entry.hash === hash : false;

    return new Response(JSON.stringify({ ok: true, filename, hash, matches, ledgerEntry: entry || null }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("verify error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
