'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState, useEffect } from "react";
import { getAllReportsFromChain, computeFileHash } from "/utils/blockchain";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [blockchainReports, setBlockchainReports] = useState([]);

  // Fetch blockchain reports on load
  useEffect(() => {
    fetchBlockchainReports();
  }, []);

  const fetchBlockchainReports = async () => {
    try {
      const reports = await getAllReportsFromChain();
      setBlockchainReports(reports);
    } catch (error) {
      console.error('Error fetching blockchain reports:', error);
    }
  };

  // Theme detection
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);
const handleVerify = async () => {
    if (!file) {
        setResult("❌ Please select a report file first!");
        return;
    }

    setIsVerifying(true);
    setResult("⏳ Computing SHA-256 hash and checking REAL blockchain...");
    
    try {
        // 1. Compute REAL hash
        const currentHash = await computeFileHash(file);
        console.log('🔐 Computed file hash:', currentHash);
        
        // 2. Check against REAL blockchain data
        const blockchainRecord = blockchainReports.find(report => 
            report.filename === file.name || report.hash === currentHash
        );

        console.log('🔍 Blockchain search result:', blockchainRecord);

        if (blockchainRecord) {
            const matches = blockchainRecord.hash === currentHash;
            
            setVerificationData({
                matches,
                currentHash,
                blockchainHash: blockchainRecord.hash,
                filename: blockchainRecord.filename,
                uploader: blockchainRecord.uploader,
                uploaderAddress: blockchainRecord.uploaderAddress,
                isOnChain: true
            });

            if (matches) {
                setResult("✅ CRYPTOGRAPHIC VERIFICATION PASSED! File matches REAL blockchain record.");
            } else {
                setResult("❌ CRYPTOGRAPHIC VERIFICATION FAILED! File has been tampered with.");
            }
        } else {
            setVerificationData({
                matches: false,
                currentHash,
                blockchainHash: null,
                filename: file.name,
                isOnChain: false
            });
            setResult("⚠️ File not found on REAL blockchain. No verification record exists.");
        }
    } catch (error) {
        console.error("Verification error:", error);
        setResult("❌ Verification failed: " + error.message);
    } finally {
        setIsVerifying(false);
    }
};
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult("");
      setVerificationData(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult("");
    setVerificationData(null);
    document.getElementById('file-upload').value = '';
  };

  // Enhanced theme system
  const themeStyles = {
    background: isDarkMode 
      ? "bg-gradient-to-br from-gray-900 to-black"
      : "bg-gradient-to-br from-blue-50 to-indigo-100",
    
    cardBackground: isDarkMode ? "bg-black" : "bg-white",
    cardBorder: isDarkMode ? "border-blue-700" : "border-blue-400",
    cardHoverBorder: isDarkMode ? "hover:border-blue-500" : "hover:border-blue-600",
    
    textPrimary: isDarkMode ? "text-blue-300" : "text-blue-700",
    textSecondary: isDarkMode ? "text-blue-400" : "text-blue-600",
    textMuted: isDarkMode ? "text-blue-500" : "text-blue-500",
    
    buttonPrimary: isDarkMode 
      ? "bg-gradient-to-r from-blue-600 to-purple-700 border-blue-500 text-white"
      : "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white",
    
    buttonHover: isDarkMode
      ? "hover:from-blue-700 hover:to-purple-800"
      : "hover:from-blue-600 hover:to-purple-700",
    
    buttonSecondary: isDarkMode
      ? "bg-black hover:bg-gray-900 text-blue-400 border-blue-700 hover:border-blue-500"
      : "bg-white hover:bg-gray-50 text-blue-600 border-blue-400 hover:border-blue-600",
    
    uploadArea: isDarkMode 
      ? "border-blue-700 bg-gray-900 hover:border-blue-500" 
      : "border-blue-300 bg-blue-50 hover:border-blue-500",
    
    fileInfo: isDarkMode ? "bg-gray-900 border-blue-800" : "bg-blue-50 border-blue-200",
    detailsPanel: isDarkMode ? "bg-gray-900 border-blue-800" : "bg-blue-50 border-blue-200",
    
    disabledButton: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-400"
      : "bg-gray-300 border-gray-400 text-gray-500",
    
    success: isDarkMode ? "text-green-300" : "text-green-600",
    error: isDarkMode ? "text-red-300" : "text-red-600",
    warning: isDarkMode ? "text-yellow-300" : "text-yellow-600"
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.background} transition-colors duration-300`}>
      <Header onThemeToggle={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />
      
      <main className="flex-grow p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-mono ${themeStyles.textPrimary} ${isDarkMode ? 'glow-text' : ''}`}>
            🔍 CRYPTOGRAPHIC_VERIFICATION
          </h1>
          <p className={`font-mono text-sm sm:text-lg ${themeStyles.textSecondary}`}>
            // SHA-256 Hash Validation • Blockchain Integrity Check
          </p>
          <div className={`mt-2 font-mono text-xs ${themeStyles.textMuted}`}>
            🔗 Real Blockchain Verification • Immutable Proof
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`${themeStyles.cardBackground} border ${isDarkMode ? 'border-blue-700' : 'border-blue-300'} rounded-lg p-3 text-center`}>
            <div className={`text-lg ${themeStyles.textPrimary}`}>📊</div>
            <div className={`font-mono text-sm ${themeStyles.textPrimary}`}>{blockchainReports.length}</div>
            <div className={`font-mono text-xs ${themeStyles.textMuted}`}>ON CHAIN</div>
          </div>
          <div className={`${themeStyles.cardBackground} border ${isDarkMode ? 'border-green-700' : 'border-green-300'} rounded-lg p-3 text-center`}>
            <div className={`text-lg ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>✅</div>
            <div className={`font-mono text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
              {blockchainReports.filter(r => r.isOnChain).length}
            </div>
            <div className={`font-mono text-xs ${isDarkMode ? 'text-green-500' : 'text-green-500'}`}>VERIFIED</div>
          </div>
          <div className={`${themeStyles.cardBackground} border ${isDarkMode ? 'border-purple-700' : 'border-purple-300'} rounded-lg p-3 text-center`}>
            <div className={`text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>⛓️</div>
            <div className={`font-mono text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Ethereum</div>
            <div className={`font-mono text-xs ${isDarkMode ? 'text-purple-500' : 'text-purple-500'}`}>NETWORK</div>
          </div>
          <div className={`${themeStyles.cardBackground} border ${isDarkMode ? 'border-cyan-700' : 'border-cyan-300'} rounded-lg p-3 text-center`}>
            <div className={`text-lg ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>🔐</div>
            <div className={`font-mono text-sm ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>SHA-256</div>
            <div className={`font-mono text-xs ${isDarkMode ? 'text-cyan-500' : 'text-cyan-500'}`}>ALGORITHM</div>
          </div>
        </div>

        {/* Main Verification Card */}
        <div className={`${themeStyles.cardBackground} border-2 ${themeStyles.cardBorder} rounded-xl p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'hover:shadow-blue-500/20' : 'hover:shadow-blue-500/10'}`}>
          
          {/* Terminal Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className={`font-mono text-sm flex-1 text-center ${themeStyles.textSecondary}`}>
              cryptographic_verification.terminal
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className={`block font-mono text-sm mb-4 uppercase tracking-wider ${themeStyles.textSecondary}`}>
              SELECT_FILE_FOR_VERIFICATION:
            </label>
            
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${themeStyles.uploadArea}`}>
              <div className={`mb-4 ${themeStyles.textMuted}`}>
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <input 
                type="file" 
                onChange={handleFileChange}
                className="hidden" 
                id="file-upload"
                accept=".txt,.json,.xml,.html,.pdf,.csv"
              />
              <label 
                htmlFor="file-upload"
                className={`inline-block px-6 py-3 font-mono rounded border transition-all duration-300 cursor-pointer ${
                  themeStyles.buttonPrimary
                } ${themeStyles.buttonHover} hover:shadow-lg mb-4`}
              >
                {file ? 'CHANGE_FILE' : 'SELECT_FILE'}
              </label>
              
              <p className={`font-mono text-sm mb-2 ${themeStyles.textPrimary}`}>
                {file ? `Selected: ${file.name}` : 'Drag & Drop or click to select'}
              </p>
              <p className={`font-mono text-xs ${themeStyles.textMuted}`}>
                Supports: .txt, .json, .xml, .html, .pdf, .csv
              </p>
            </div>

            {/* File Info */}
            {file && (
              <div className={`mt-4 rounded-lg p-4 border ${themeStyles.fileInfo}`}>
                <h4 className={`font-mono text-sm mb-3 uppercase tracking-wider ${themeStyles.textSecondary}`}>
                  FILE_DETAILS
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Name:</span>
                    <p className={`truncate font-mono text-sm ${themeStyles.textPrimary}`}>{file.name}</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Size:</span>
                    <p className={`font-mono text-sm ${themeStyles.textPrimary}`}>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Type:</span>
                    <p className={`font-mono text-sm ${themeStyles.textPrimary}`}>{file.type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Modified:</span>
                    <p className={`font-mono text-sm ${themeStyles.textPrimary}`}>{new Date(file.lastModified).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Controls */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className={`py-3 px-6 font-mono rounded border transition-all duration-300 ${
                !file || isVerifying
                  ? themeStyles.disabledButton
                  : `${themeStyles.buttonPrimary} ${themeStyles.buttonHover} hover:shadow-lg`
              }`}
            >
              {isVerifying ? '🔐 COMPUTING_HASH...' : '🚀 VERIFY_ON_BLOCKCHAIN'}
            </button>

            <button 
              onClick={handleClear}
              className={`py-3 px-6 font-mono rounded border transition-all duration-300 ${themeStyles.buttonSecondary}`}
            >
              🗑️ CLEAR
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`border-2 rounded-lg p-4 mb-6 ${
              result.includes('✅') ? (isDarkMode ? 'border-green-700 bg-green-900/20' : 'border-green-300 bg-green-100') : 
              result.includes('❌') ? (isDarkMode ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-100') :
              result.includes('⚠️') ? (isDarkMode ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-100') :
              (isDarkMode ? 'border-blue-700 bg-blue-900/20' : 'border-blue-300 bg-blue-100')
            }`}>
              <p className={`font-mono text-sm text-center ${
                result.includes('✅') ? themeStyles.success : 
                result.includes('❌') ? themeStyles.error : 
                result.includes('⚠️') ? themeStyles.warning : 
                themeStyles.textPrimary
              }`}>
                {result}
              </p>
            </div>
          )}

          {/* Enhanced Verification Details */}
          {verificationData && (
            <div className={`rounded-lg p-4 border mb-6 ${themeStyles.detailsPanel}`}>
              <h4 className={`font-mono text-sm mb-4 uppercase tracking-wider ${themeStyles.textSecondary}`}>
                CRYPTOGRAPHIC_VERIFICATION_REPORT
              </h4>
              
              <div className="space-y-3 font-mono text-sm">
                {/* Verification Status */}
                <div className="flex justify-between items-center p-3 rounded border bg-opacity-20">
                  <span className={themeStyles.textMuted}>Verification Status:</span>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    verificationData.matches 
                      ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                      : (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700')
                  }`}>
                    {verificationData.matches ? 'CRYPTOGRAPHIC_MATCH' : 'HASH_MISMATCH'}
                  </span>
                </div>

                {/* Hash Comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className={themeStyles.textMuted}>Current File Hash:</span>
                    <div className={`mt-1 p-2 rounded border font-mono text-xs break-all ${themeStyles.textPrimary}`}>
                      {verificationData.currentHash}
                    </div>
                  </div>
                  <div>
                    <span className={themeStyles.textMuted}>
                      {verificationData.isOnChain ? 'Blockchain Hash:' : 'No Blockchain Record'}
                    </span>
                    <div className={`mt-1 p-2 rounded border font-mono text-xs break-all ${
                      verificationData.blockchainHash ? themeStyles.textPrimary : themeStyles.warning
                    }`}>
                      {verificationData.blockchainHash || 'Not found on blockchain'}
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                {verificationData.isOnChain && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-opacity-30">
                    <div>
                      <span className={themeStyles.textMuted}>Uploaded By:</span>
                      <p className={themeStyles.textPrimary}>{verificationData.uploader}</p>
                    </div>
                    <div>
                      <span className={themeStyles.textMuted}>Filename:</span>
                      <p className={`truncate ${themeStyles.textPrimary}`}>{verificationData.filename}</p>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className={`mt-4 p-3 rounded border text-center ${
                  verificationData.matches 
                    ? (isDarkMode ? 'border-green-700 bg-green-900/30' : 'border-green-300 bg-green-100')
                    : (isDarkMode ? 'border-red-700 bg-red-900/30' : 'border-red-300 bg-red-100')
                }`}>
                  <div className="text-2xl mb-2">
                    {verificationData.matches ? '🔐' : '🚫'}
                  </div>
                  <p className={`text-xs ${verificationData.matches ? themeStyles.success : themeStyles.error}`}>
                    {verificationData.matches 
                      ? 'FILE INTEGRITY VERIFIED - No tampering detected'
                      : 'INTEGRITY CHECK FAILED - File may have been modified'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="pt-4 border-t border-opacity-30">
            <div className="flex items-center justify-center space-x-2 font-mono text-sm">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                blockchainReports.length > 0 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className={themeStyles.textSecondary}>
                {blockchainReports.length > 0 
  ? `Blockchain: Synced (${blockchainReports.length} REAL records) | Ready for Verification`
  : 'Blockchain: Connecting... | Loading REAL blockchain data'
}
              </span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}