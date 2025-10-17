export default function ReportCard({ report }) {
  return (
    <div className="border-2 border-green-700 rounded-lg p-4 bg-black text-green-300 font-mono hover:border-green-400 hover:shadow-glow transition-all duration-300 relative">
      
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
          </div>
        </div>
      </div>
    </div>
  );
}