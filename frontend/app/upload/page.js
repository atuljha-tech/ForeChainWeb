'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState, useEffect } from "react";

export default function Upload() {
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [deletedScans, setDeletedScans] = useState(new Set()); // Track deleted scans

  // Fetch recent scans when page loads
  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      
      // Filter out deleted scans
      const availableScans = data.reports?.filter(scan => 
        !deletedScans.has(scan.name)
      ) || [];
      
      // Get the most recent 4 scans, reverse to show newest first
      const recent = availableScans.slice(-4).reverse();
      setRecentScans(recent);
    } catch (error) {
      console.error("Error fetching scans:", error);
    }
  };

  const handleFakeScan = async () => {
    setIsScanning(true);
    setMessage("⏳ Running simulated scan...");
    
    try {
      const res = await fetch("/api/run-scan", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Scan completed! ${data.entry.filename} created and added to blockchain`);
        // Refresh the scan list to show the new scan
        await fetchRecentScans();
      } else {
        setMessage(`❌ Scan failed: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to execute scan");
    } finally {
      setIsScanning(false);
    }
  };

  // Handle scan deletion
  const handleDeleteScan = async (scanName) => {
    try {
      const res = await fetch(`/api/reports?filename=${encodeURIComponent(scanName)}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Add to deleted set to filter it out
        setDeletedScans(prev => new Set([...prev, scanName]));
        // Refresh the list
        await fetchRecentScans();
        setMessage(`🗑️ Scan "${scanName}" deleted successfully`);
      } else {
        setMessage(`❌ Failed to delete scan`);
      }
    } catch (error) {
      console.error("Error deleting scan:", error);
      setMessage("❌ Error deleting scan");
    }
  };

  // Format filename for display
  const formatScanName = (filename) => {
    return filename
      .replace(/_/g, ' ')
      .replace('.txt', '')
      .replace('.xml', '')
      .replace('.json', '')
      .replace('scan report', '')
      .trim();
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    if (filename.includes('.xml')) return '📊';
    if (filename.includes('.json')) return '📋';
    if (filename.includes('.txt')) return '📄';
    return '📁';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <Header />
      
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Scan Card */}
          <div className="bg-black border-2 border-green-700 rounded-xl p-8 mb-8 hover:border-green-500 transition-all duration-300 hover:shadow-glow">
            {/* Terminal Header */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-green-400 font-mono text-sm flex-1 text-center">
                scan_control.terminal
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-green-300 mb-4 font-mono glow-text">
                SCAN_CONTROL
              </h1>
              <p className="text-green-500 font-mono text-sm mb-6">
                Execute security scans & generate forensic reports
              </p>
            </div>

            {/* Scan Button */}
            <button 
              onClick={handleFakeScan}
              disabled={isScanning}
              className={`w-full font-mono py-4 px-6 rounded border transition-all duration-300 transform hover:-translate-y-0.5 mb-6 text-lg ${
                isScanning
                  ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-500 text-white hover:shadow-glow'
              }`}
            >
              {isScanning ? '🔄 EXECUTING_SCAN...' : '⚡ RUN_DEMO_SCAN'}
            </button>

            {/* Status Message */}
            {message && (
              <div className={`bg-gray-900 border rounded-lg p-4 mb-6 ${
                message.includes('✅') ? 'border-green-800' : 
                message.includes('❌') ? 'border-red-800' : 
                message.includes('🗑️') ? 'border-yellow-800' : 'border-green-800'
              }`}>
                <p className={`font-mono text-sm text-center ${
                  message.includes('✅') ? 'text-green-300' : 
                  message.includes('❌') ? 'text-red-300' : 
                  message.includes('🗑️') ? 'text-yellow-300' : 'text-green-300'
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* System Status */}
            <div className="flex items-center justify-center space-x-2 text-green-400 font-mono text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System: Ready | Scanner: Online | Active Scans: {recentScans.length}</span>
            </div>
          </div>

          {/* Recent Scans Section */}
          <div className="bg-black border-2 border-green-700 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-green-300 font-mono text-xl uppercase tracking-wider">
                🕐 RECENT_SCANS
              </h3>
              <div className="text-green-500 font-mono text-sm bg-green-900/30 px-3 py-1 rounded border border-green-700">
                {recentScans.length} ACTIVE
              </div>
            </div>
            
            {recentScans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentScans.map((scan, index) => (
                  <div 
                    key={scan.name} 
                    className="bg-gray-900 border border-green-800 rounded-lg p-4 hover:border-green-600 transition-all duration-300 group relative"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteScan(scan.name)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete scan"
                    >
                      🗑️
                    </button>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-300 font-mono text-sm font-bold">
                          SCAN_{index + 1}
                        </span>
                      </div>
                      <span className="text-green-500 font-mono text-xs bg-green-900/30 px-2 py-1 rounded">
                        ACTIVE
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500 text-sm">{getFileIcon(scan.name)}</span>
                        <span className="text-green-300 font-mono text-sm truncate" title={scan.name}>
                          {formatScanName(scan.name)}
                        </span>
                      </div>
                      
                      {scan.size && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500 text-sm">💾</span>
                          <span className="text-green-400 font-mono text-xs">
                            {(scan.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      )}
                      
                      {scan.modified && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500 text-sm">🕒</span>
                          <span className="text-green-400 font-mono text-xs">
                            {new Date(scan.modified).toLocaleDateString()} {new Date(scan.modified).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-green-800">
                      <div className="flex justify-between items-center">
                        <span className="text-green-500 font-mono text-xs">Status:</span>
                        <span className="text-green-300 font-mono text-xs bg-green-900/50 px-2 py-1 rounded">
                          COMPLETED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-green-800 rounded-lg">
                <p className="text-green-500 font-mono text-lg">No active scans</p>
                <p className="text-green-600 font-mono text-sm mt-2">Run a scan to see results here</p>
              </div>
            )}
            
            {/* Deleted Scans Info */}
            {deletedScans.size > 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <p className="text-yellow-400 font-mono text-xs text-center">
                  🗑️ {deletedScans.size} scan(s) deleted • Refresh page to clear this message
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}