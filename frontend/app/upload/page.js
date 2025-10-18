'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState, useEffect } from "react";

export default function Upload() {
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanType, setActiveScanType] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [deletedScans, setDeletedScans] = useState(new Set());
  const [scanStats, setScanStats] = useState({
    total: 0,
    byType: { nmap: 0, nikto: 0, wireshark: 0, dvwa: 0 }
  });

  // Scan types with configurations
  const scanTypes = [
    {
      id: "nmap",
      name: "Network Scanner",
      icon: "🌐",
      color: "blue",
      description: "Network discovery & port scanning",
      command: "nmap -sS -sV -O -A",
      duration: "2-5 minutes",
      risk: "Low",
      targets: ["192.168.1.0/24", "10.0.0.1/24", "172.16.0.1/16"]
    },
    {
      id: "nikto",
      name: "Web Scanner", 
      icon: "🕸️",
      color: "purple",
      description: "Web application security testing",
      command: "nikto -h target -output",
      duration: "5-10 minutes", 
      risk: "Medium",
      targets: ["http://192.168.1.100", "https://webapp.local", "http://10.0.0.50"]
    },
    {
      id: "wireshark",
      name: "Traffic Analyzer",
      icon: "📡",
      color: "cyan", 
      description: "Network traffic capture & analysis",
      command: "tshark -i eth0 -w capture",
      duration: "1-15 minutes",
      risk: "Low",
      targets: ["eth0", "wlan0", "any"]
    },
    {
      id: "dvwa",
      name: "Vulnerability Assessment",
      icon: "🎯",
      color: "orange",
      description: "Security vulnerability testing",
      command: "custom assessment suite",
      duration: "3-8 minutes",
      risk: "High", 
      targets: ["http://192.168.1.150/dvwa", "http://testapp.local"]
    }
  ];

  // Fetch recent scans when page loads
  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      
      const availableScans = data.reports?.filter(scan => 
        !deletedScans.has(scan.name)
      ) || [];
      
      const recent = availableScans.slice(-6).reverse();
      setRecentScans(recent);

      // Calculate scan statistics
      const stats = { total: availableScans.length, byType: { nmap: 0, nikto: 0, wireshark: 0, dvwa: 0 } };
      availableScans.forEach(scan => {
        const toolType = scan.tool?.toLowerCase() || "unknown";
        if (stats.byType.hasOwnProperty(toolType)) {
          stats.byType[toolType]++;
        }
      });
      setScanStats(stats);
    } catch (error) {
      console.error("Error fetching scans:", error);
    }
  };

  const handleScan = async (scanType) => {
    setIsScanning(true);
    setActiveScanType(scanType.id);
    setMessage(`⏳ Initializing ${scanType.name}...`);
    
    try {
      // Simulate different scan durations
      const scanDuration = {
        nmap: 3000,
        nikto: 4000, 
        wireshark: 2500,
        dvwa: 3500
      }[scanType.id] || 3000;

      // Phase simulation
      const phases = [
        `🔍 Starting ${scanType.name}`,
        `📡 Scanning target network...`,
        `🛡️  Analyzing security posture...`,
        `📊 Generating forensic report...`
      ];

      for (let i = 0; i < phases.length; i++) {
        setMessage(phases[i]);
        await new Promise(resolve => setTimeout(resolve, scanDuration / phases.length));
      }

      const res = await fetch("/api/run-scan", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scanType: scanType.id })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${scanType.name} completed! ${data.entry.filename} created`);
        await fetchRecentScans();
      } else {
        setMessage(`❌ ${scanType.name} failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ ${scanType.name} execution failed`);
      console.error("Scan error:", error);
    } finally {
      setIsScanning(false);
      setActiveScanType(null);
    }
  };

  const handleDeleteScan = async (scanName) => {
    try {
      const res = await fetch(`/api/reports?filename=${encodeURIComponent(scanName)}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setDeletedScans(prev => new Set([...prev, scanName]));
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

  const formatScanName = (filename) => {
    return filename
      .replace(/_/g, ' ')
      .replace('.txt', '')
      .replace('.xml', '')
      .replace('.json', '')
      .replace(/(nmap|nikto|wireshark|dvwa)_?/gi, '')
      .replace('scan', '')
      .replace('report', '')
      .trim() || 'Security Scan';
  };

  const getFileIcon = (filename) => {
    if (filename.includes('nmap')) return '🌐';
    if (filename.includes('nikto')) return '🕸️';
    if (filename.includes('wireshark')) return '📡';
    if (filename.includes('dvwa')) return '🎯';
    if (filename.includes('.xml')) return '📊';
    if (filename.includes('.json')) return '📋';
    return '📄';
  };

  const getScanType = (filename) => {
    if (filename.includes('nmap')) return 'nmap';
    if (filename.includes('nikto')) return 'nikto';
    if (filename.includes('wireshark')) return 'wireshark';
    if (filename.includes('dvwa')) return 'dvwa';
    return 'unknown';
  };

  const getTypeColor = (type) => {
    const scanType = scanTypes.find(st => st.id === type);
    return scanType?.color || 'green';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <Header />
      
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-300 mb-4 font-mono glow-text">
              ⚡ SCAN_CONTROL_CENTER
            </h1>
            <p className="text-green-500 font-mono text-lg">
              // Multi-Tool Security Assessment Platform
            </p>
          </div>

          {/* Scan Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-black border-2 border-green-700 rounded-lg p-4 text-center">
              <div className="text-2xl text-green-400 mb-1">📊</div>
              <div className="text-green-300 font-mono text-lg">{scanStats.total}</div>
              <div className="text-green-500 font-mono text-xs">TOTAL SCANS</div>
            </div>
            {scanTypes.map(type => (
              <div key={type.id} className="bg-black border-2 border-green-700 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-green-300 font-mono text-lg">{scanStats.byType[type.id] || 0}</div>
                <div className="text-green-500 font-mono text-xs">{type.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          {/* Scan Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {scanTypes.map((scanType) => {
              const isActive = activeScanType === scanType.id;
              const isDisabled = isScanning && !isActive;
              
              return (
                <div
                  key={scanType.id}
                  className={`bg-black border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                    isActive 
                      ? `border-${scanType.color}-400 ring-2 ring-${scanType.color}-500` 
                      : `border-${scanType.color}-700 hover:border-${scanType.color}-500`
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isDisabled && !isScanning && handleScan(scanType)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{scanType.icon}</div>
                    <h3 className={`font-bold font-mono text-lg mb-2 ${
                      isActive ? `text-${scanType.color}-300` : `text-${scanType.color}-400`
                    }`}>
                      {scanType.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {scanType.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-gray-400">{scanType.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={`${
                          scanType.risk === 'High' ? 'text-red-400' : 
                          scanType.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {scanType.risk}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Command:</span>
                        <span className="text-gray-400 font-mono truncate ml-2">
                          {scanType.command}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={isDisabled || isScanning}
                      className={`w-full mt-4 py-2 px-4 rounded font-mono text-sm transition-all ${
                        isActive
                          ? 'bg-green-600 text-white'
                          : `bg-${scanType.color}-900/30 text-${scanType.color}-300 hover:bg-${scanType.color}-800`
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActive ? '🔄 RUNNING...' : '🚀 START SCAN'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Panel */}
          <div className="bg-black border-2 border-green-700 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 font-mono text-xl">SYSTEM_STATUS</h3>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">
                  {isScanning ? 'SCANNING_ACTIVE' : 'READY_FOR_OPERATION'}
                </span>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`border rounded-lg p-4 mb-4 ${
                message.includes('✅') ? 'border-green-800 bg-green-900/20' : 
                message.includes('❌') ? 'border-red-800 bg-red-900/20' : 
                message.includes('🗑️') ? 'border-yellow-800 bg-yellow-900/20' : 
                'border-blue-800 bg-blue-900/20'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {message.includes('✅') ? '✅' : 
                     message.includes('❌') ? '❌' : 
                     message.includes('🗑️') ? '🗑️' : '⏳'}
                  </div>
                  <p className="font-mono text-sm flex-1">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar for active scans */}
            {isScanning && (
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: '85%' }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-green-400 font-mono text-sm">SCANNER</div>
                <div className="text-green-300 font-mono">{isScanning ? 'ACTIVE' : 'STANDBY'}</div>
              </div>
              <div>
                <div className="text-green-400 font-mono text-sm">QUEUE</div>
                <div className="text-green-300 font-mono">0</div>
              </div>
              <div>
                <div className="text-green-400 font-mono text-sm">MEMORY</div>
                <div className="text-green-300 font-mono">64%</div>
              </div>
              <div>
                <div className="text-green-400 font-mono text-sm">UPTIME</div>
                <div className="text-green-300 font-mono">99.8%</div>
              </div>
            </div>
          </div>

          {/* Recent Scans Section */}
          <div className="bg-black border-2 border-green-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-green-300 font-mono text-xl">📋 RECENT_SCANS</h3>
              <div className="text-green-500 font-mono text-sm bg-green-900/30 px-3 py-1 rounded border border-green-700">
                {recentScans.length} ACTIVE • {deletedScans.size} DELETED
              </div>
            </div>
            
            {recentScans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentScans.map((scan, index) => {
                  const scanType = getScanType(scan.name);
                  const typeColor = getTypeColor(scanType);
                  
                  return (
                    <div 
                      key={scan.name} 
                      className={`bg-gray-900 border border-${typeColor}-800 rounded-lg p-4 hover:border-${typeColor}-500 transition-all duration-300 group relative`}
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
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 bg-${typeColor}-500 rounded-full animate-pulse`}></div>
                          <span className={`text-${typeColor}-300 font-mono text-sm font-bold`}>
                            {scanType.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-green-500 font-mono text-xs bg-green-900/30 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-${typeColor}-500 text-sm`}>{getFileIcon(scan.name)}</span>
                          <span className={`text-${typeColor}-300 font-mono text-sm truncate`} title={scan.name}>
                            {formatScanName(scan.name)}
                          </span>
                        </div>
                        
                        {scan.size && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-sm">💾</span>
                            <span className="text-gray-400 font-mono text-xs">
                              {(scan.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        )}
                        
                        {scan.modified && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-sm">🕒</span>
                            <span className="text-gray-400 font-mono text-xs">
                              {new Date(scan.modified).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-mono text-xs">Status:</span>
                          <span className="text-green-300 font-mono text-xs bg-green-900/50 px-2 py-1 rounded">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-green-800 rounded-lg">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-green-500 font-mono text-lg">No scans available</p>
                <p className="text-green-600 font-mono text-sm mt-2">Select a scan type to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}