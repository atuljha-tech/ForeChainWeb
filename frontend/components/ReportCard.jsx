// components/ReportCard.jsx
"use client";

import { useState } from "react";

export default function ReportCard({ report, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call the onDelete function passed from parent
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

  return (
    <div className="border-2 border-green-700 rounded-lg p-4 bg-black text-green-300 font-mono hover:border-green-400 hover:shadow-glow transition-all duration-300 relative">
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-4 text-center max-w-xs">
            <div className="text-red-400 text-lg mb-2">⚠️ DELETE REPORT?</div>
            <p className="text-green-300 text-sm mb-4">
              This action cannot be undone. The report will be permanently removed.
            </p>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

      {/* Verification Badge */}
      {report.isVerified && (
        <div className="absolute top-3 right-3 bg-green-900 text-green-300 text-xs px-2 py-1 rounded border border-green-700 flex items-center space-x-1">
          <span>✅</span>
          <span>VERIFIED</span>
        </div>
      )}
      
      {/* Sample Data Badge */}
      {report.isSample && (
        <div className="absolute top-3 right-3 bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded border border-yellow-700 flex items-center space-x-1">
          <span>🧪</span>
          <span>SAMPLE</span>
        </div>
      )}

      <h2 className="font-bold mb-3 text-green-200 text-lg border-b border-green-800 pb-2 pr-20">
        ⚡ {report.tool}
      </h2>
      
      <div className="space-y-2 text-sm">
        {/* Timestamp */}
        <p className="flex items-center">
          <span className="text-green-500 mr-2">⌚</span>
          <strong>Timestamp:</strong> 
          <span className="text-green-200 ml-2">{report.timestamp}</span>
        </p>

        {/* Target */}
        <p className="flex items-center">
          <span className="text-green-500 mr-2">🎯</span>
          <strong>Target:</strong> 
          <span className="text-green-200 ml-2">{report.target}</span>
        </p>

        {/* Uploader */}
        <p className="flex items-center">
          <span className="text-green-500 mr-2">👤</span>
          <strong>Uploader:</strong> 
          <span className="text-green-200 ml-2">{report.uploader}</span>
        </p>

        {/* Results */}
        <p className="flex items-start">
          <span className="text-green-500 mr-2 mt-1">📊</span>
          <div className="flex-1">
            <strong>Results:</strong> 
            <div className="text-green-200 ml-2 text-xs bg-gray-900 px-2 py-1 rounded mt-1 max-h-20 overflow-y-auto">
              {report.results}
            </div>
          </div>
        </p>

        {/* Hash */}
        <p className="flex items-start">
          <span className="text-green-500 mr-2 mt-1">🔐</span>
          <div className="flex-1">
            <strong>Hash:</strong> 
            <code className="text-green-200 ml-2 text-xs bg-gray-900 px-2 py-1 rounded break-all block">
              {report.hash}
            </code>
          </div>
        </p>

        {/* Filename (if available) */}
        {report.filename && (
          <p className="flex items-center">
            <span className="text-green-500 mr-2">📄</span>
            <strong>File:</strong> 
            <span className="text-green-200 ml-2 text-xs">{report.filename}</span>
          </p>
        )}

        {/* Ledger Info (if verified) */}
        {report.ledgerEntry && (
          <p className="flex items-center">
            <span className="text-green-500 mr-2">⛓️</span>
            <strong>Blockchain:</strong> 
            <span className="text-green-200 ml-2 text-xs">Entry #{report.ledgerEntry.id}</span>
          </p>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-green-800">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              report.isVerified ? 'bg-green-500 animate-pulse' : 
              report.isSample ? 'bg-yellow-500' : 'bg-blue-500'
            }`}></div>
            <span className="text-green-400 font-mono text-xs">
              {report.isVerified ? 'BLOCKCHAIN_VERIFIED' : 
               report.isSample ? 'DEMO_DATA' : 'PENDING_VERIFICATION'}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-2">
            {!report.isVerified && report.filename && (
              <button className="text-green-500 hover:text-green-300 text-xs transition-colors">
                VERIFY
              </button>
            )}
            <button className="text-green-500 hover:text-green-300 text-xs transition-colors">
              VIEW
            </button>
            {/* Delete Button */}
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-300 text-xs transition-colors flex items-center space-x-1"
              disabled={isDeleting}
            >
              <span>🗑️</span>
              <span>DELETE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}