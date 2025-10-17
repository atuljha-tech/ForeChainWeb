'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { useState } from "react";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const handleVerify = async () => {
  if (!file) {
    setResult("❌ Please select a report file first!");
    return;
  }

  setIsVerifying(true);
  setResult("⏳ Verifying report authenticity...");
  
  try {
    // Send as JSON instead of FormData
    const res = await fetch("/api/verify", { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name  // Just send the filename
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <Header />
      
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-yellow-300 mb-3 font-mono glow-text">
            🔍 INTEGRITY_VERIFICATION
          </h1>
          <p className="text-yellow-500 font-mono text-lg">
            // Validate Evidence Authenticity & Blockchain Consistency
          </p>
        </div>

        {/* Main Verification Card */}
        <div className="bg-black border-2 border-yellow-700 rounded-xl p-8 hover:border-yellow-500 transition-all duration-300 hover:shadow-glow">
          {/* Terminal Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-yellow-400 font-mono text-sm flex-1 text-center">
              verification_control.terminal
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-yellow-400 font-mono text-sm mb-4 uppercase tracking-wider">
              SELECT_REPORT_FILE:
            </label>
            
            <div className="border-2 border-dashed border-yellow-700 rounded-lg p-6 text-center bg-gray-900 hover:border-yellow-500 transition-all duration-300">
              <div className="text-yellow-500 mb-4">
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
                className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-mono rounded border border-yellow-500 transition-all duration-300 cursor-pointer hover:shadow-glow mb-4"
              >
                {file ? 'CHANGE_FILE' : 'SELECT_FILE'}
              </label>
              
              <p className="text-yellow-300 font-mono text-sm mb-2">
                {file ? `Selected: ${file.name}` : 'Drag & Drop or click to select'}
              </p>
              <p className="text-yellow-600 font-mono text-xs">
                Supports: .txt, .json, .xml, .html, .pdf, .csv
              </p>
            </div>

            {/* File Info */}
            {file && (
              <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-yellow-800">
                <h4 className="text-yellow-400 font-mono text-sm mb-2 uppercase tracking-wider">
                  FILE_DETAILS
                </h4>
                <div className="grid grid-cols-2 gap-4 text-yellow-300 font-mono text-xs">
                  <div>
                    <span className="text-yellow-500">Name:</span>
                    <p className="truncate">{file.name}</p>
                  </div>
                  <div>
                    <span className="text-yellow-500">Size:</span>
                    <p>{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <span className="text-yellow-500">Type:</span>
                    <p>{file.type || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-yellow-500">Modified:</span>
                    <p>{new Date(file.lastModified).toLocaleDateString()}</p>
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
                  ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 border-yellow-500 text-white hover:shadow-glow'
              }`}
            >
              {isVerifying ? '🔄 VERIFYING...' : '🚀 VERIFY_FILE'}
            </button>

            <button 
              onClick={handleClear}
              className="py-3 px-6 bg-black hover:bg-gray-900 text-yellow-400 font-mono rounded border border-yellow-700 transition-all duration-300 hover:border-yellow-500"
            >
              🗑️ CLEAR
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`border-2 rounded-lg p-4 ${
              result.includes('✅') ? 'border-green-700 bg-green-900/20' : 
              result.includes('❌') ? 'border-red-700 bg-red-900/20' :
              'border-yellow-700 bg-yellow-900/20'
            }`}>
              <p className={`font-mono text-sm text-center ${
                result.includes('✅') ? 'text-green-300' : 
                result.includes('❌') ? 'text-red-300' : 'text-yellow-300'
              }`}>
                {result}
              </p>
            </div>
          )}

          {/* Verification Details */}
          {verificationData && (
            <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-yellow-800">
              <h4 className="text-yellow-400 font-mono text-sm mb-3 uppercase tracking-wider">
                VERIFICATION_DETAILS
              </h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-yellow-500">Status:</span>
                  <span className={verificationData.matches ? 'text-green-300' : 'text-red-300'}>
                    {verificationData.matches ? 'MATCH_CONFIRMED' : 'NO_MATCH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500">Computed Hash:</span>
                  <code className="text-yellow-300 break-all text-right">
                    {verificationData.hash}
                  </code>
                </div>
                {verificationData.ledgerEntry && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-yellow-500">Blockchain Entry:</span>
                      <span className="text-yellow-300">#{verificationData.ledgerEntry.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-500">Stored Hash:</span>
                      <code className="text-yellow-300 break-all text-right">
                        {verificationData.ledgerEntry.hash}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="mt-6 pt-4 border-t border-yellow-800">
            <div className="flex items-center justify-center space-x-2 text-yellow-400 font-mono text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System: Online | Blockchain: Synced | Ready for Verification</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}