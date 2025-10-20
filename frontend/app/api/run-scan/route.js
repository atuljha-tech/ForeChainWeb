import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function sha256(content) {
  return "0x" + crypto.createHash("sha256").update(content).digest("hex");
}

function generateUniqueFilename(scanType) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${scanType}_scan_${timestamp}_${random}.txt`;
}

export async function POST(request) {
  try {
    const { scanType = 'nmap' } = await request.json();
    const scriptPath = path.join(process.cwd(), "..", "kali-simulation", scanType, "scan.sh");
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Scan script not found: ${scriptPath}`);
    }

    const uniqueFilename = generateUniqueFilename(scanType);
    console.log(`🎯 Generated unique filename: ${uniqueFilename}`);

    const reportsDir = path.join(process.cwd(), "..", "kali-simulation", scanType, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const outputPath = path.join(reportsDir, uniqueFilename);

    // Run the scan
    console.log(`🛡️ Running ${scanType} scan...`);
    
    const tempDir = path.join(process.cwd(), 'temp_scans', `${scanType}_isolated_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const isolatedOutput = path.join(tempDir, 'scan_result.txt');
    
    try {
      await new Promise((resolve, reject) => {
        exec(`cd "${tempDir}" && bash "${scriptPath}" > "${isolatedOutput}" 2>&1`, (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message));
          resolve(stdout);
        });
      });

      // Wait for scan completion
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (fs.existsSync(isolatedOutput)) {
        fs.copyFileSync(isolatedOutput, outputPath);
        console.log('✅ Scan completed, file copied to reports');
      } else {
        throw new Error(`${scanType} scan failed - no output generated`);
      }
      
    } finally {
      // Cleanup
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup warning:', cleanupError.message);
      }
    }

    // 🚨 CRITICAL FIX: Read content ONCE and use everywhere
    console.log(`📖 Reading file content for hash calculation...`);
    const content = fs.readFileSync(outputPath, "utf-8");
    const hash = sha256(content);
    const finalStats = fs.statSync(outputPath);

    console.log(`✅ ${scanType} scan completed: ${uniqueFilename}`);
    console.log(`📏 File size: ${(finalStats.size / 1024).toFixed(2)} KB`);
    console.log(`🔐 SINGLE HASH CALCULATED: ${hash}`);

    // Update ledger with THE hash
    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      try { 
        ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8")); 
      } catch (e) { 
        ledger = []; 
      }
    }

    const entry = {
      id: ledger.length + 1,
      filename: uniqueFilename,
      tool: scanType,
      timestamp: new Date().toISOString(),
      uploader: "System Scan",
      hash: hash, // 🚨 THIS IS THE SINGLE SOURCE OF TRUTH
      filepath: `kali-simulation/${scanType}/reports/${uniqueFilename}`,
      size: content.length,
      content: content // 🚨 INCLUDE CONTENT TO PREVENT RE-READING
    };

    ledger.push(entry);
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), "utf-8");

    console.log(`📝 Ledger updated with hash: ${hash}`);

    return new Response(JSON.stringify({ 
      success: true, 
      entry, // 🚨 This contains the SINGLE hash
      message: `Scan completed. Hash: ${hash.slice(0, 16)}...`
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
    
  } catch (err) {
    console.error("❌ run-scan error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}