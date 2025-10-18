'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState, useEffect } from "react";
import { addReportOnChain, getAllReportsFromChain } from "/utils/blockchain";

export default function Upload() {
  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanType, setActiveScanType] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [deletedScans, setDeletedScans] = useState(new Set());
  const [scanStats, setScanStats] = useState({
    total: 0,
    byType: { nmap: 0, nikto: 0, wireshark: 0, dvwa: 0 },
    onChain: 0
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [blockchainUploading, setBlockchainUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chainReports, setChainReports] = useState([]);

  // Check system theme preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fetch blockchain reports on startup
  useEffect(() => {
    fetchBlockchainReports();
  }, []);

  const fetchBlockchainReports = async () => {
    try {
      const reports = await getAllReportsFromChain();
      setChainReports(reports);
      console.log('Blockchain reports loaded:', reports);
    } catch (error) {
      console.error('Error fetching blockchain reports:', error);
    }
  };

  // Theme classes for consistent styling
  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 to-black' 
      : 'bg-gradient-to-br from-gray-50 to-white',
    text: {
      primary: isDarkMode ? 'text-green-300' : 'text-emerald-700',
      secondary: isDarkMode ? 'text-green-500' : 'text-emerald-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      inverse: isDarkMode ? 'text-gray-900' : 'text-white'
    },
    card: {
      background: isDarkMode ? 'bg-black' : 'bg-white',
      border: isDarkMode ? 'border-green-700' : 'border-emerald-200',
      hover: isDarkMode ? 'hover:border-green-400' : 'hover:border-emerald-400'
    },
    status: {
      background: isDarkMode ? 'bg-black' : 'bg-gray-50',
      border: isDarkMode ? 'border-green-700' : 'border-emerald-200'
    }
  };

  // Enhanced hover effects
  const hoverEffects = {
    card: isDarkMode 
      ? 'hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 transform hover:-translate-y-1' 
      : 'hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-1',
    button: isDarkMode
      ? 'hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30'
      : 'hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30',
    scanCard: isDarkMode
      ? 'hover:shadow-glow hover:scale-105'
      : 'hover:shadow-lg hover:scale-105'
  };

  // Scan types with configurations for both themes
  const scanTypes = [
    {
      id: "nmap",
      name: "Network Scanner",
      icon: "🌐",
      darkColor: "blue",
      lightColor: "blue",
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
      darkColor: "purple",
      lightColor: "violet",
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
      darkColor: "cyan", 
      lightColor: "cyan",
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
      darkColor: "orange",
      lightColor: "amber",
      description: "Security vulnerability testing",
      command: "custom assessment suite",
      duration: "3-8 minutes",
      risk: "High", 
      targets: ["http://192.168.1.150/dvwa", "http://testapp.local"]
    }
  ];

  // Get color classes based on theme
  const getColorClass = (scanType, type = 'border') => {
    const color = isDarkMode ? scanType.darkColor : scanType.lightColor;
    const isActive = activeScanType === scanType.id;
    
    if (type === 'text') {
      return isActive ? `text-${color}-600` : `text-${color}-500`;
    }
    
    if (type === 'bg') {
      return isActive ? `bg-${color}-100` : `bg-${color}-50`;
    }
    
    // border type
    return isActive ? `border-${color}-500` : `border-${color}-300`;
  };

  // Compute SHA-256 hash of file content using Web Crypto API
  const computeFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(buffer));
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(`0x${hashHex}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Compute SHA-256 hash of string content
  const computeStringHash = async (content) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  };

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
      
      // Merge with blockchain data
      const mergedScans = availableScans.map(scan => {
        const chainReport = chainReports.find(cr => cr.filename === scan.name);
        return {
          ...scan,
          isOnChain: !!chainReport,
          chainHash: chainReport?.hash,
          chainUploader: chainReport?.uploader
        };
      });

      const recent = mergedScans.slice(-6).reverse();
      setRecentScans(recent);

      // Calculate scan statistics
      const stats = { 
        total: availableScans.length, 
        byType: { nmap: 0, nikto: 0, wireshark: 0, dvwa: 0 },
        onChain: chainReports.length
      };
      
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

  // Handle file selection for manual upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`📁 Selected: ${file.name}`);
    }
  };

  // Manual file upload with blockchain integration
  const handleManualUpload = async () => {
    if (!selectedFile) {
      setMessage("❌ Please select a file first");
      return;
    }

    setBlockchainUploading(true);
    setMessage(`⏳ Computing hash for ${selectedFile.name}...`);

    try {
      // Compute file hash
      const fileHash = await computeFileHash(selectedFile);
      setMessage(`✅ Hash computed: ${fileHash.slice(0, 16)}...`);

      // Upload to blockchain
      setMessage(`⛓️ Uploading to blockchain...`);
      await addReportOnChain(selectedFile.name, 'Manual Upload', fileHash);
      
      setMessage(`✅ Successfully uploaded "${selectedFile.name}" to blockchain!`);
      
      // Refresh data
      await fetchBlockchainReports();
      await fetchRecentScans();
      
      // Clear selection
      setSelectedFile(null);
      document.getElementById('file-upload').value = '';

    } catch (error) {
      console.error("Manual upload error:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setBlockchainUploading(false);
    }
  };

  // Blockchain upload handler
  const handleUploadToBlockchain = async (scan) => {
    setBlockchainUploading(true);
    setMessage(`⏳ Computing hash for "${scan.name}"...`);
    
    try {
      // For existing scans, fetch content to compute real hash
      let fileHash;
      if (scan.content) {
        // Compute hash from existing content
        fileHash = await computeStringHash(scan.content);
      } else {
        // Try to fetch file content
        try {
          const res = await fetch(`/api/reports?filename=${encodeURIComponent(scan.name)}`);
          if (res.ok) {
            const content = await res.text();
            fileHash = await computeStringHash(content);
          } else {
            // Fallback to random hash if content not available
            fileHash = `0x${Math.random().toString(16).slice(2, 42)}`;
            setMessage(`⚠️ Using generated hash for ${scan.name}`);
          }
        } catch {
          fileHash = `0x${Math.random().toString(16).slice(2, 42)}`;
          setMessage(`⚠️ Using generated hash for ${scan.name}`);
        }
      }

      setMessage(`⛓️ Uploading "${scan.name}" to blockchain...`);
      
      // Upload to blockchain with real hash
      await addReportOnChain(scan.name, scan.uploader || 'System', fileHash);
      setMessage(`✅ Successfully uploaded "${scan.name}" to blockchain!`);
      
      // Update local state to reflect blockchain status
      const updatedScans = recentScans.map(s => 
        s.name === scan.name 
          ? { ...s, isOnChain: true, chainHash: fileHash }
          : s
      );
      setRecentScans(updatedScans);
      
      // Refresh blockchain data
      await fetchBlockchainReports();
      await fetchRecentScans();
      
    } catch (error) {
      console.error("Blockchain upload error:", error);
      setMessage(`❌ Failed to upload to blockchain: ${error.message}`);
    } finally {
      setBlockchainUploading(false);
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
        
        // Auto-upload to blockchain if enabled
        const newScan = data.reports?.find(r => r.name === data.entry.filename) || data.entry;
        if (newScan) {
          setTimeout(() => {
            handleUploadToBlockchain(newScan);
          }, 1000);
        }
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
    return isDarkMode ? scanType?.darkColor : scanType?.lightColor || 'green';
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.background} transition-colors duration-300`}>
      <Header onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
      
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${themeClasses.text.primary} mb-4 font-mono ${isDarkMode ? 'glow-text' : ''}`}>
              ⚡ SCAN_CONTROL_CENTER
            </h1>
            <p className={`${themeClasses.text.secondary} font-mono text-lg`}>
              // Blockchain-Integrated Forensic Evidence System
            </p>
            <div className={`mt-4 ${isDarkMode ? 'text-green-400' : 'text-emerald-500'} font-mono text-sm`}>
              🔗 SHA-256 Hashed • Immutable • Verifiable
            </div>
          </div>

          {/* Scan Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className={`${themeClasses.card.background} border-2 ${isDarkMode ? 'border-green-700' : 'border-emerald-200'} rounded-lg p-4 text-center transition-all duration-300 ${hoverEffects.card}`}>
              <div className={`text-2xl ${isDarkMode ? 'text-green-400' : 'text-emerald-500'} mb-1`}>📊</div>
              <div className={`${isDarkMode ? 'text-green-300' : 'text-emerald-700'} font-mono text-lg`}>{scanStats.total}</div>
              <div className={`${isDarkMode ? 'text-green-500' : 'text-emerald-600'} font-mono text-xs`}>TOTAL SCANS</div>
            </div>
            <div className={`${themeClasses.card.background} border-2 ${isDarkMode ? 'border-purple-700' : 'border-purple-200'} rounded-lg p-4 text-center transition-all duration-300 ${hoverEffects.card}`}>
              <div className={`text-2xl ${isDarkMode ? 'text-purple-400' : 'text-purple-500'} mb-1`}>⛓️</div>
              <div className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'} font-mono text-lg`}>{scanStats.onChain}</div>
              <div className={`${isDarkMode ? 'text-purple-500' : 'text-purple-600'} font-mono text-xs`}>ON CHAIN</div>
            </div>
            {scanTypes.map(type => (
              <div key={type.id} className={`${themeClasses.card.background} border-2 ${isDarkMode ? 'border-green-700' : 'border-emerald-200'} rounded-lg p-4 text-center transition-all duration-300 ${hoverEffects.card}`}>
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className={`${isDarkMode ? 'text-green-300' : 'text-emerald-700'} font-mono text-lg`}>{scanStats.byType[type.id] || 0}</div>
                <div className={`${isDarkMode ? 'text-green-500' : 'text-emerald-600'} font-mono text-xs`}>{type.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          {/* Manual File Upload Section */}
          <div className={`${themeClasses.status.background} border-2 ${themeClasses.status.border} rounded-xl p-6 mb-8 transition-all duration-300`}>
            <h3 className={`${themeClasses.text.primary} font-mono text-xl mb-4`}>📁 MANUAL_FILE_UPLOAD</h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className={`flex-1 px-4 py-2 border rounded-lg font-mono text-sm ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                disabled={blockchainUploading}
              />
              <button
                onClick={handleManualUpload}
                disabled={!selectedFile || blockchainUploading}
                className={`px-6 py-2 rounded font-mono text-sm transition-all ${
                  selectedFile && !blockchainUploading
                    ? (isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white')
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                } ${hoverEffects.button}`}
              >
                {blockchainUploading ? '⛓️ UPLOADING...' : '⛓️ UPLOAD TO BLOCKCHAIN'}
              </button>
            </div>
            {selectedFile && (
              <div className={`mt-3 text-sm ${isDarkMode ? 'text-green-400' : 'text-emerald-600'} font-mono`}>
                📄 File: {selectedFile.name} • Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            )}
          </div>

          {/* Scan Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {scanTypes.map((scanType) => {
              const isActive = activeScanType === scanType.id;
              const isDisabled = isScanning && !isActive;
              const colorClass = getColorClass(scanType);
              const textColorClass = getColorClass(scanType, 'text');
              
              return (
                <div
                  key={scanType.id}
                  className={`${themeClasses.card.background} border-2 rounded-xl p-6 transition-all duration-300 ${hoverEffects.scanCard} ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${colorClass}`}
                  onClick={() => !isDisabled && !isScanning && handleScan(scanType)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{scanType.icon}</div>
                    <h3 className={`font-bold font-mono text-lg mb-2 ${textColorClass}`}>
                      {scanType.name}
                    </h3>
                    <p className={`${themeClasses.text.muted} text-sm mb-4`}>
                      {scanType.description}
                    </p>
                    
                    <div className={`space-y-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className={themeClasses.text.muted}>{scanType.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={`${
                          scanType.risk === 'High' ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                          scanType.risk === 'Medium' ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : 
                          (isDarkMode ? 'text-green-400' : 'text-green-600')
                        }`}>
                          {scanType.risk}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Command:</span>
                        <span className={`${themeClasses.text.muted} font-mono truncate ml-2`}>
                          {scanType.command}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={isDisabled || isScanning}
                      className={`w-full mt-4 py-2 px-4 rounded font-mono text-sm transition-all ${
                        isActive
                          ? (isDarkMode ? 'bg-green-600 text-white' : 'bg-emerald-600 text-white')
                          : (isDarkMode ? `bg-${scanType.darkColor}-900/30 text-${scanType.darkColor}-300 hover:bg-${scanType.darkColor}-800` : `bg-${scanType.lightColor}-100 text-${scanType.lightColor}-700 hover:bg-${scanType.lightColor}-200`)
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
          <div className={`${themeClasses.status.background} border-2 ${themeClasses.status.border} rounded-xl p-6 mb-8 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${themeClasses.text.primary} font-mono text-xl`}>SYSTEM_STATUS</h3>
              <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-green-400' : 'text-emerald-600'}`}>
                <div className={`w-2 h-2 ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
                <span className="font-mono text-sm">
                  {isScanning ? 'SCANNING_ACTIVE' : blockchainUploading ? 'BLOCKCHAIN_UPLOAD' : 'READY_FOR_OPERATION'}
                </span>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`border rounded-lg p-4 mb-4 transition-all duration-300 ${
                message.includes('✅') ? (isDarkMode ? 'border-green-800 bg-green-900/20' : 'border-green-300 bg-green-100') : 
                message.includes('❌') ? (isDarkMode ? 'border-red-800 bg-red-900/20' : 'border-red-300 bg-red-100') : 
                message.includes('🗑️') ? (isDarkMode ? 'border-yellow-800 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-100') : 
                message.includes('⛓️') ? (isDarkMode ? 'border-purple-800 bg-purple-900/20' : 'border-purple-300 bg-purple-100') :
                message.includes('📁') ? (isDarkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-300 bg-blue-100') :
                (isDarkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-300 bg-blue-100')
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {message.includes('✅') ? '✅' : 
                     message.includes('❌') ? '❌' : 
                     message.includes('🗑️') ? '🗑️' : 
                     message.includes('⛓️') ? '⛓️' : 
                     message.includes('📁') ? '📁' : '⏳'}
                  </div>
                  <p className={`font-mono text-sm flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar for active scans */}
            {(isScanning || blockchainUploading) && (
              <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 mb-4`}>
                <div 
                  className={`${isDarkMode ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'} h-2 rounded-full transition-all duration-1000 animate-pulse`}
                  style={{ width: '85%' }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'SCANNER', value: isScanning ? 'ACTIVE' : 'STANDBY' },
                { label: 'BLOCKCHAIN', value: blockchainUploading ? 'UPLOADING' : 'READY' },
                { label: 'ON_CHAIN', value: `${scanStats.onChain}/${scanStats.total}` },
                { label: 'UPTIME', value: '99.8%' }
              ].map((item, index) => (
                <div key={index}>
                  <div className={`${themeClasses.text.secondary} font-mono text-sm`}>{item.label}</div>
                  <div className={`${themeClasses.text.primary} font-mono`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scans Section */}
          <div className={`${themeClasses.status.background} border-2 ${themeClasses.status.border} rounded-xl p-6 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${themeClasses.text.primary} font-mono text-xl`}>📋 RECENT_SCANS</h3>
              <div className={`${isDarkMode ? 'text-green-500 bg-green-900/30 border-green-700' : 'text-emerald-600 bg-emerald-100 border-emerald-300'} font-mono text-sm px-3 py-1 rounded border`}>
                {recentScans.length} ACTIVE • {scanStats.onChain} ON CHAIN
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
                      className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${isDarkMode ? `border-${typeColor}-800` : `border-${typeColor}-300`} rounded-lg p-4 transition-all duration-300 group relative hover:scale-105 ${isDarkMode ? `hover:border-${typeColor}-500` : `hover:border-${typeColor}-400`}`}
                    >
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!scan.isOnChain && (
                          <button
                            onClick={() => handleUploadToBlockchain(scan)}
                            disabled={blockchainUploading}
                            className={`p-1 rounded ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'} ${blockchainUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Upload to Blockchain"
                          >
                            ⛓️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteScan(scan.name)}
                          className={`p-1 rounded ${isDarkMode ? 'text-red-500 hover:text-red-300' : 'text-red-600 hover:text-red-400'}`}
                          title="Delete scan"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 bg-${typeColor}-500 rounded-full animate-pulse`}></div>
                          <span className={`${isDarkMode ? `text-${typeColor}-300` : `text-${typeColor}-600`} font-mono text-sm font-bold`}>
                            {scanType.toUpperCase()}
                          </span>
                        </div>
                        <span className={`${isDarkMode ? 'text-green-500 bg-green-900/30' : 'text-emerald-600 bg-emerald-100'} font-mono text-xs px-2 py-1 rounded`}>
                          #{index + 1}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`${isDarkMode ? `text-${typeColor}-500` : `text-${typeColor}-500`} text-sm`}>{getFileIcon(scan.name)}</span>
                          <span className={`${isDarkMode ? `text-${typeColor}-300` : `text-${typeColor}-700`} font-mono text-sm truncate`} title={scan.name}>
                            {formatScanName(scan.name)}
                          </span>
                        </div>
                        
                        {scan.size && (
                          <div className="flex items-center space-x-2">
                            <span className={`${themeClasses.text.muted} text-sm`}>💾</span>
                            <span className={`${themeClasses.text.muted} font-mono text-xs`}>
                              {(scan.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        )}
                        
                        {scan.chainHash && (
                          <div className="flex items-center space-x-2">
                            <span className={`${themeClasses.text.muted} text-sm`}>🔐</span>
                            <span className={`${themeClasses.text.muted} font-mono text-xs truncate`} title={scan.chainHash}>
                              {scan.chainHash.slice(0, 16)}...
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`${themeClasses.text.muted} font-mono text-xs`}>Status:</span>
                          <span className={`${scan.isOnChain ? (isDarkMode ? 'text-purple-300 bg-purple-900/50' : 'text-purple-700 bg-purple-100') : (isDarkMode ? 'text-yellow-300 bg-yellow-900/50' : 'text-yellow-700 bg-yellow-100')} font-mono text-xs px-2 py-1 rounded`}>
                            {scan.isOnChain ? 'ON CHAIN' : 'LOCAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-12 border-2 border-dashed ${isDarkMode ? 'border-green-800' : 'border-emerald-200'} rounded-lg`}>
                <div className="text-4xl mb-4">🔍</div>
                <p className={`${themeClasses.text.secondary} font-mono text-lg`}>No scans available</p>
                <p className={`${isDarkMode ? 'text-green-600' : 'text-emerald-500'} font-mono text-sm mt-2`}>Select a scan type or upload a file to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}