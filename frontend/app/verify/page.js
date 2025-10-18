'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState, useEffect } from "react";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync with theme from Header
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    updateTheme();

    // Set up observer to watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleVerify = async () => {
    if (!file) {
      setResult("❌ Please select a report file first!");
      return;
    }

    setIsVerifying(true);
    setResult("⏳ Verifying report authenticity...");
    
    try {
      const res = await fetch("/api/verify", { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name
        })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setVerificationData(data);
        setResult(data.matches ? 
          "✅ Report verified successfully! File matches blockchain record." : 
          "❌ Verification failed! File does not match blockchain record."
        );
      } else {
        setResult(`❌ Verification error: ${data.error}`);
      }
    } catch (error) {
      setResult("❌ Failed to verify report");
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
  };

  // Theme-based styles
  const themeStyles = {
    background: isDarkMode 
      ? "bg-gradient-to-br from-gray-900 to-black"
      : "bg-gradient-to-br from-gray-50 to-gray-100",
    
    cardBackground: isDarkMode ? "bg-black" : "bg-white",
    cardBorder: isDarkMode ? "border-yellow-700" : "border-yellow-400",
    cardHoverBorder: isDarkMode ? "hover:border-yellow-500" : "hover:border-yellow-600",
    
    textPrimary: isDarkMode ? "text-yellow-300" : "text-yellow-600",
    textSecondary: isDarkMode ? "text-yellow-500" : "text-yellow-700",
    textMuted: isDarkMode ? "text-yellow-600" : "text-yellow-500",
    
    buttonPrimary: isDarkMode 
      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 text-white"
      : "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 text-white",
    
    buttonHover: isDarkMode
      ? "hover:from-yellow-700 hover:to-yellow-800"
      : "hover:from-yellow-600 hover:to-yellow-700",
    
    buttonSecondary: isDarkMode
      ? "bg-black hover:bg-gray-900 text-yellow-400 border-yellow-700 hover:border-yellow-500"
      : "bg-white hover:bg-gray-50 text-yellow-600 border-yellow-400 hover:border-yellow-600",
    
    uploadArea: isDarkMode 
      ? "border-yellow-700 bg-gray-900 hover:border-yellow-500" 
      : "border-yellow-400 bg-gray-50 hover:border-yellow-600",
    
    fileInfo: isDarkMode ? "bg-gray-900 border-yellow-800" : "bg-gray-100 border-yellow-300",
    detailsPanel: isDarkMode ? "bg-gray-900 border-yellow-800" : "bg-gray-100 border-yellow-300",
    
    disabledButton: isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-400"
      : "bg-gray-300 border-gray-400 text-gray-500"
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeStyles.background}`}>
      <Header />
      
      <main className="flex-grow p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-mono ${themeStyles.textPrimary} glow-text`}>
            🔍 INTEGRITY_VERIFICATION
          </h1>
          <p className={`font-mono text-sm sm:text-lg ${themeStyles.textSecondary}`}>
            // Validate Evidence Authenticity & Blockchain Consistency
          </p>
        </div>

        {/* Main Verification Card */}
        <div className={`${themeStyles.cardBackground} border-2 ${themeStyles.cardBorder} rounded-xl p-4 sm:p-6 md:p-8 ${themeStyles.cardHoverBorder} transition-all duration-300 hover:shadow-glow`}>
          {/* Terminal Header */}
          <div className="flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="flex space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className={`font-mono text-xs sm:text-sm flex-1 text-center ${themeStyles.textSecondary}`}>
              verification_control.terminal
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-4 sm:mb-6">
            <label className={`block font-mono text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-wider ${themeStyles.textSecondary}`}>
              SELECT_REPORT_FILE:
            </label>
            
            <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-300 ${themeStyles.uploadArea}`}>
              <div className={`mb-3 sm:mb-4 ${themeStyles.textMuted}`}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`inline-block px-4 py-2 sm:px-6 sm:py-3 font-mono rounded border transition-all duration-300 cursor-pointer hover:shadow-glow mb-3 sm:mb-4 text-sm sm:text-base ${
                  themeStyles.buttonPrimary
                }`}
              >
                {file ? 'CHANGE_FILE' : 'SELECT_FILE'}
              </label>
              
              <p className={`font-mono text-xs sm:text-sm mb-2 ${themeStyles.textPrimary}`}>
                {file ? `Selected: ${file.name}` : 'Drag & Drop or click to select'}
              </p>
              <p className={`font-mono text-xs ${themeStyles.textMuted}`}>
                Supports: .txt, .json, .xml, .html, .pdf, .csv
              </p>
            </div>

            {/* File Info */}
            {file && (
              <div className={`mt-3 sm:mt-4 rounded-lg p-3 sm:p-4 border ${themeStyles.fileInfo}`}>
                <h4 className={`font-mono text-xs sm:text-sm mb-2 uppercase tracking-wider ${themeStyles.textSecondary}`}>
                  FILE_DETAILS
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Name:</span>
                    <p className={`truncate font-mono text-xs ${themeStyles.textPrimary}`}>{file.name}</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Size:</span>
                    <p className={`font-mono text-xs ${themeStyles.textPrimary}`}>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Type:</span>
                    <p className={`font-mono text-xs ${themeStyles.textPrimary}`}>{file.type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className={`${themeStyles.textMuted} font-mono text-xs`}>Modified:</span>
                    <p className={`font-mono text-xs ${themeStyles.textPrimary}`}>{new Date(file.lastModified).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Controls */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button 
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className={`py-2 sm:py-3 px-4 sm:px-6 font-mono rounded border transition-all duration-300 text-sm sm:text-base ${
                !file || isVerifying
                  ? themeStyles.disabledButton
                  : `${themeStyles.buttonPrimary} ${themeStyles.buttonHover} hover:shadow-glow`
              }`}
            >
              {isVerifying ? '🔄 VERIFYING...' : '🚀 VERIFY_FILE'}
            </button>

            <button 
              onClick={handleClear}
              className={`py-2 sm:py-3 px-4 sm:px-6 font-mono rounded border transition-all duration-300 text-sm sm:text-base ${themeStyles.buttonSecondary}`}
            >
              🗑️ CLEAR
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`border-2 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ${
              result.includes('✅') ? 'border-green-700 bg-green-900/20' : 
              result.includes('❌') ? 'border-red-700 bg-red-900/20' :
              isDarkMode ? 'border-yellow-700 bg-yellow-900/20' : 'border-yellow-400 bg-yellow-100'
            }`}>
              <p className={`font-mono text-xs sm:text-sm text-center ${
                result.includes('✅') ? 'text-green-300' : 
                result.includes('❌') ? 'text-red-300' : 
                isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                {result}
              </p>
            </div>
          )}

          {/* Verification Details */}
          {verificationData && (
            <div className={`rounded-lg p-3 sm:p-4 border mb-4 sm:mb-6 ${themeStyles.detailsPanel}`}>
              <h4 className={`font-mono text-xs sm:text-sm mb-3 uppercase tracking-wider ${themeStyles.textSecondary}`}>
                VERIFICATION_DETAILS
              </h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className={themeStyles.textMuted}>Status:</span>
                  <span className={verificationData.matches ? 'text-green-300' : 'text-red-300'}>
                    {verificationData.matches ? 'MATCH_CONFIRMED' : 'NO_MATCH'}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                  <span className={themeStyles.textMuted}>Computed Hash:</span>
                  <code className={`break-all text-right ${themeStyles.textPrimary}`}>
                    {verificationData.hash}
                  </code>
                </div>
                {verificationData.ledgerEntry && (
                  <>
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                      <span className={themeStyles.textMuted}>Blockchain Entry:</span>
                      <span className={themeStyles.textPrimary}>#{verificationData.ledgerEntry.id}</span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1">
                      <span className={themeStyles.textMuted}>Stored Hash:</span>
                      <code className={`break-all text-right ${themeStyles.textPrimary}`}>
                        {verificationData.ledgerEntry.hash}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="pt-3 sm:pt-4 border-t border-yellow-800">
            <div className="flex items-center justify-center space-x-2 font-mono text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={themeStyles.textSecondary}>
                System: Online | Blockchain: Synced | Ready for Verification
              </span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}