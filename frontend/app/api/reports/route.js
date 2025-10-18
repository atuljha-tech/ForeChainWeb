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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Filename parameter is required" 
        }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Your logic to delete the report file
    const reportsDir = path.join(process.cwd(), "..", "kali-simulation", "reports");
    const filePath = path.join(reportsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "File not found" 
        }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    
    // Also remove from ledger if it exists there
    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    if (fs.existsSync(ledgerPath)) {
      try {
        const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
        const updatedLedger = ledger.filter(entry => entry.filename !== filename);
        fs.writeFileSync(ledgerPath, JSON.stringify(updatedLedger, null, 2));
      } catch (e) {
        console.error("Error updating ledger:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Report deleted successfully' 
      }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Delete error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}