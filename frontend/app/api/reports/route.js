// app/api/reports/route.js
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), "..", "kali-simulation", "reports");
    
    // Check if directory exists
    if (!fs.existsSync(reportsDir)) {
      console.log("Reports directory not found");
      // Return empty arrays instead of sample data to match new structure
      return new Response(JSON.stringify({ 
        reports: [], 
        ledger: [] 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const files = fs.readdirSync(reportsDir);
    
    const reports = files.map((file) => {
      try {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        
        // Only read files (not directories)
        if (!stats.isFile()) return null;
        
        const content = fs.readFileSync(filePath, "utf-8");
        return { 
          name: file, 
          content: content.substring(0, 1000), // Limit content size
          size: stats.size,
          modified: stats.mtime
        };
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
        return { 
          name: file, 
          error: "Could not read file",
          content: "" 
        };
      }
    }).filter(report => report !== null); // Remove null entries

    // NEW: Load ledger data
    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      try { 
        ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8")); 
      } catch (e) { 
        console.error("Error reading ledger:", e);
        ledger = []; 
      }
    }

    // NEW: Return combined response
    return new Response(JSON.stringify({ 
      reports: reports,
      ledger: ledger 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: err.message
      }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}