// app/api/reports/route.js
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const kaliSimulationDir = path.join(process.cwd(), "..", "kali-simulation");
    
    // Check if kali-simulation directory exists
    if (!fs.existsSync(kaliSimulationDir)) {
      console.log("Kali simulation directory not found");
      return new Response(JSON.stringify({ 
        reports: [], 
        ledger: [] 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Define all tool directories to scan
    const toolDirectories = [
      { name: 'nmap', path: path.join(kaliSimulationDir, 'nmap', 'reports') },
      { name: 'nikto', path: path.join(kaliSimulationDir, 'nikto', 'reports') },
      { name: 'wireshark', path: path.join(kaliSimulationDir, 'wireshark', 'reports') },
      { name: 'dvwa', path: path.join(kaliSimulationDir, 'dvwa', 'reports') }
    ];

    let allReports = [];

    // Scan each tool directory
    for (const tool of toolDirectories) {
      if (fs.existsSync(tool.path)) {
        try {
          const files = fs.readdirSync(tool.path);
          
          const toolReports = files.map((file) => {
            try {
              const filePath = path.join(tool.path, file);
              const stats = fs.statSync(filePath);
              
              // Only read files (not directories)
              if (!stats.isFile()) return null;
              
              const content = fs.readFileSync(filePath, "utf-8");
              return { 
                name: file, 
                tool: tool.name,
                content: content.substring(0, 1000), // Limit content size
                size: stats.size,
                modified: stats.mtime,
                fullPath: filePath
              };
            } catch (fileError) {
              console.error(`Error reading file ${file} from ${tool.name}:`, fileError);
              return { 
                name: file, 
                tool: tool.name,
                error: "Could not read file",
                content: "" 
              };
            }
          }).filter(report => report !== null); // Remove null entries

          allReports = [...allReports, ...toolReports];
        } catch (dirError) {
          console.error(`Error reading directory ${tool.name}:`, dirError);
        }
      } else {
        console.log(`Directory not found: ${tool.path}`);
      }
    }

    // Sort reports by modification date (newest first)
    allReports.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    // Load ledger data
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

    // Return combined response
    return new Response(JSON.stringify({ 
      reports: allReports,
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

    // Search for the file in all tool directories
    const kaliSimulationDir = path.join(process.cwd(), "..", "kali-simulation");
    const toolDirectories = [
      'nmap/reports',
      'nikto/reports', 
      'wireshark/reports',
      'dvwa/reports'
    ];

    let filePath = null;
    let toolName = null;

    // Find which directory contains the file
    for (const toolDir of toolDirectories) {
      const potentialPath = path.join(kaliSimulationDir, toolDir, filename);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        toolName = toolDir.split('/')[0]; // Extract tool name from path
        break;
      }
    }

    // Check if file was found
    if (!filePath) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "File not found in any scan directory" 
        }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
    
    // Also remove from ledger if it exists there
    const ledgerPath = path.join(process.cwd(), "..", "forenchain-ledger.json");
    if (fs.existsSync(ledgerPath)) {
      try {
        const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
        const updatedLedger = ledger.filter(entry => entry.filename !== filename);
        fs.writeFileSync(ledgerPath, JSON.stringify(updatedLedger, null, 2));
        console.log(`Updated ledger, removed entry for: ${filename}`);
      } catch (e) {
        console.error("Error updating ledger:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report deleted successfully from ${toolName}`,
        tool: toolName
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