// components/ReportCard.jsx
"use client";

import { useState } from "react";

export default function ReportCard({ report, onDelete, isDarkMode }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(report.id, report.filename);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getToolIcon = (toolType) => {
    switch (toolType) {
      case 'nmap': return '🌐';
      case 'nikto': return '🕸️';
      case 'wireshark': return '📡';
      case 'dvwa': return '🎯';
      default: return '🔍';
    }
  };

  // Always use hacker-style black background with green accents
  const hackerTheme = {
    background: 'bg-black',
    border: 'border-green-700',
    hoverBorder: 'hover:border-green-400',
    text: {
      primary: 'text-green-300',
      secondary: 'text-green-400',
      muted: 'text-green-500',
      accent: 'text-green-200'
    },
    status: {
      verified: 'bg-green-900 text-green-300 border-green-700',
      sample: 'bg-yellow-900 text-yellow-300 border-yellow-700',
      pending: 'bg-blue-900 text-blue-300 border-blue-700'
    }
  };

  const getStatusColor = () => {
    if (report.isVerified) return hackerTheme.status.verified;
    if (report.isSample) return hackerTheme.status.sample;
    return hackerTheme.status.pending;
  };

  const getStatusText = () => {
    if (report.isVerified) return 'BLOCKCHAIN VERIFIED';
    if (report.isSample) return 'DEMO DATA';
    return 'PENDING VERIFICATION';
  };

  const getStatusDot = () => {
    if (report.isVerified) return 'bg-green-500';
    if (report.isSample) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`${hackerTheme.background} border-2 ${hackerTheme.border} rounded-xl p-4 sm:p-6 ${hackerTheme.hoverBorder} hover:shadow-2xl hover:shadow-green-500/20 transform hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm relative`}>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-6 text-center max-w-xs w-full shadow-2xl shadow-red-500/20">
            <div className="text-red-400 text-lg font-bold mb-3 font-mono">
              ⚠️ DELETE REPORT?
            </div>
            <p className="text-green-300 text-sm mb-6 leading-relaxed">
              This action cannot be undone. The report will be permanently removed from the system.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-mono text-sm transition-all duration-300 border border-gray-600"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono text-sm transition-all duration-300 flex items-center space-x-2 border border-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-green-800">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-2xl sm:text-3xl flex-shrink-0">{getToolIcon(report.toolType)}</div>
          <div className="min-w-0 flex-1">
            <h2 className={`font-bold ${hackerTheme.text.accent} font-mono text-base sm:text-lg truncate`}>
              {report.tool}
            </h2>
            <p className={`${hackerTheme.text.muted} font-mono text-xs sm:text-sm truncate`}>
              {report.target || report.uploader}
            </p>
          </div>
        </div>
        
        {/* Verification Badge */}
        {report.isVerified && (
          <div className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1 rounded-full border flex-shrink-0 ml-2 ${hackerTheme.status.verified}`}>
            <span className="text-xs">✅</span>
            <span className="font-mono text-xs font-bold">VERIFIED</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <span className={`${hackerTheme.text.muted} text-sm`}>⌚</span>
            <span className={`${hackerTheme.text.muted} font-mono text-xs`}>Time:</span>
          </div>
          <span className={`${hackerTheme.text.secondary} font-mono text-xs text-right flex-1 truncate pl-2`}>
            {report.timestamp}
          </span>
        </div>

        {/* Target */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <span className={`${hackerTheme.text.muted} text-sm`}>🎯</span>
            <span className={`${hackerTheme.text.muted} font-mono text-xs`}>Target:</span>
          </div>
          <span className={`${hackerTheme.text.secondary} font-mono text-xs text-right flex-1 truncate pl-2`}>
            {report.target || 'Unknown'}
          </span>
        </div>

        {/* Results Preview */}
        <div className="flex items-start space-x-2">
          <span className={`${hackerTheme.text.muted} text-sm mt-1 flex-shrink-0`}>📊</span>
          <div className="flex-1 min-w-0">
            <span className={`${hackerTheme.text.muted} font-mono text-xs`}>Results:</span>
            <div className="bg-gray-900/50 rounded-lg px-3 py-2 mt-1 max-h-16 overflow-y-auto">
              <p className={`${hackerTheme.text.secondary} font-mono text-xs leading-relaxed`}>
                {report.results.length > 120 
                  ? `${report.results.substring(0, 120)}...` 
                  : report.results
                }
              </p>
            </div>
          </div>
        </div>

        {/* Hash */}
        <div className="flex items-start space-x-2">
          <span className={`${hackerTheme.text.muted} text-sm mt-1 flex-shrink-0`}>🔐</span>
          <div className="flex-1 min-w-0">
            <span className={`${hackerTheme.text.muted} font-mono text-xs`}>Hash:</span>
            <code className="bg-gray-900/50 text-green-300 font-mono text-xs rounded-lg px-3 py-2 mt-1 block break-all max-h-16 overflow-y-auto">
              {report.hash}
            </code>
          </div>
        </div>

        {/* Filename */}
        {report.filename && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className={`${hackerTheme.text.muted} text-sm`}>📄</span>
              <span className={`${hackerTheme.text.muted} font-mono text-xs`}>File:</span>
            </div>
            <span className={`${hackerTheme.text.secondary} font-mono text-xs text-right flex-1 truncate pl-2`}>
              {report.filename}
            </span>
          </div>
        )}

        {/* Ledger Info */}
        {report.ledgerEntry && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className={`${hackerTheme.text.muted} text-sm`}>⛓️</span>
              <span className={`${hackerTheme.text.muted} font-mono text-xs`}>Blockchain:</span>
            </div>
            <span className={`${hackerTheme.text.secondary} font-mono text-xs text-right flex-1 truncate pl-2`}>
              Entry #{report.ledgerEntry.id}
            </span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-3 border-t border-green-800">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full ${getStatusDot()} ${report.isVerified ? 'animate-pulse' : ''}`}></div>
          <span className={`font-mono text-xs ${hackerTheme.text.secondary} truncate`}>
            {getStatusText()}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* View Button */}
          <button className="px-2 sm:px-3 py-1 rounded-lg font-mono text-xs transition-all duration-300 bg-blue-900/30 text-blue-400 border border-blue-700/50 hover:bg-blue-900/50 hover:border-blue-600">
            👁️ View
          </button>

          {/* Verify Button - Only show if not verified */}
          {!report.isVerified && report.filename && (
            <button className="px-2 sm:px-3 py-1 rounded-lg font-mono text-xs transition-all duration-300 bg-green-900/30 text-green-400 border border-green-700/50 hover:bg-green-900/50 hover:border-green-600">
              ✅ Verify
            </button>
          )}

          {/* Delete Button */}
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-2 sm:px-3 py-1 rounded-lg font-mono text-xs transition-all duration-300 flex items-center space-x-1 bg-red-900/30 text-red-400 border border-red-700/50 hover:bg-red-900/50 hover:border-red-600"
            disabled={isDeleting}
          >
            <span>🗑️</span>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Sample Badge - Positioned absolutely if both verified and sample */}
      {report.isSample && !report.isVerified && (
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 px-2 sm:px-3 py-1 rounded-full border bg-yellow-900/50 border-yellow-700 text-yellow-400">
          <span className="text-xs">🧪</span>
          <span className="font-mono text-xs font-bold">SAMPLE</span>
        </div>
      )}
    </div>
  );
}