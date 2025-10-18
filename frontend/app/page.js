"use client";
import { useEffect, useState } from "react";
import Header from "/components/Header";
import Footer from "/components/Footer";
import ReportCard from "/components/ReportCard";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    verifiedToday: 0,
    activeUsers: 8
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // NEW: Handle the new response format { reports: [], ledger: [] }
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response format: expected object with reports and ledger");
        }

        const apiReports = data.reports || [];
        const ledger = data.ledger || [];

        // Updated data formatting to match the ACTUAL API response
        const formattedReports = apiReports.map((report, index) => {
          // Parse the actual scan report content
          const content = report.content || "";
          
          // Extract data from the report content
          const toolMatch = content.match(/Tool\s*:\s*([^\n]+)/i);
          const timestampMatch = content.match(/Timestamp\s*:\s*([^\n]+)/i);
          const targetMatch = content.match(/Target\s*:\s*([^\n]+)/i);
          const resultsMatch = content.match(/Results:([\s\S]*?)(?=Notes:|$)/i);
          
          // Use parsed data or fallbacks
          const tool = toolMatch ? toolMatch[1].trim() : 
                       report.name ? report.name.replace(/_/g, ' ').replace(/\.[^/.]+$/, '') : 
                       `Scan-${index + 1}`;
          
          const timestamp = timestampMatch ? 
                            new Date(timestampMatch[1].replace(/_/g, ':').replace(/-/g, ':')) : 
                            report.modified ? new Date(report.modified) : new Date();
          
          const target = targetMatch ? targetMatch[1].trim() : "Unknown";
          const results = resultsMatch ? resultsMatch[1].trim() : "No results available";

          // NEW: Check if this report is verified in the ledger
          const ledgerEntry = ledger.find(entry => entry.filename === report.name);
          const isVerified = !!ledgerEntry;
          const ledgerHash = ledgerEntry ? ledgerEntry.hash : null;

          return {
            id: report.id || index + 1,
            tool: tool,
            timestamp: timestamp.toLocaleString(),
            uploader: `Target: ${target}`, // Using target as uploader for now
            hash: ledgerHash || report.hash || `0x${Math.random().toString(16).slice(2, 42)}`,
            isSample: report.isSample || false,
            // Add the actual results for display
            results: results,
            target: target,
            // NEW: Verification status from ledger
            isVerified: isVerified,
            ledgerEntry: ledgerEntry,
            filename: report.name
          };
        });

        setReports(formattedReports);
        setStats({
          totalReports: apiReports.length,
          verifiedToday: ledger.length, // Now shows actual verified count from ledger
          activeUsers: 8 + Math.floor(apiReports.length)
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
        // Fallback to mock data that matches API format
        const mockReports = [
          { 
            id: 1, 
            tool: "nmap scan", 
            timestamp: new Date().toLocaleString(), 
            uploader: "analyst_01", 
            hash: "0xa1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcd",
            isSample: true,
            isVerified: false,
            filename: "sample_scan_1.txt"
          },
          { 
            id: 2, 
            tool: "nikto audit", 
            timestamp: new Date().toLocaleString(), 
            uploader: "sec_engineer_42", 
            hash: "0xfedcba9876543210abcdef1234567890fedcba9876543210abcdef1234567890",
            isSample: true,
            isVerified: false,
            filename: "sample_scan_2.txt"
          },
        ];
        setReports(mockReports);
        setStats({
          totalReports: mockReports.length,
          verifiedToday: 0,
          activeUsers: 8
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReports();

    // Poll every 10 seconds for real-time updates (optional)
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Function to handle "New Report" button click
  const handleNewReport = async () => {
    try {
      const res = await fetch("/api/run-scan", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        alert(`New demo scan created: ${data.entry.filename}`);
        // Refresh the reports to show the new scan
        window.location.reload(); // Simple refresh for now
      } else {
        alert(`Scan failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to create new report:", error);
      alert("Failed to create new report");
    }
  };

  // DELETE handler for reports
  const handleDeleteReport = async (reportId, filename) => {
    try {
      console.log('Delete called for:', reportId, filename);
      
      // If it's a real report with filename, call API to delete
      if (filename && !filename.includes('sample_scan')) {
        const res = await fetch(`/api/reports?filename=${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete report');
        }
      }
      
      // Get the report before deleting to check if it was verified
      const reportToDelete = reports.find(report => report.id === reportId);
      const wasVerified = reportToDelete?.isVerified || false;
      
      // Remove from local state
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      // Update stats - only decrement verifiedToday if the report was verified
      setStats(prevStats => ({
        ...prevStats,
        totalReports: prevStats.totalReports - 1,
        verifiedToday: wasVerified ? prevStats.verifiedToday - 1 : prevStats.verifiedToday
      }));
      
      console.log('Report deleted successfully');
      
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report: ' + error.message);
      throw error; // Re-throw to handle in ReportCard
    }
  };

  // Debug effect
  useEffect(() => {
    console.log('Reports updated:', reports.length);
    console.log('Stats updated:', stats);
  }, [reports, stats]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-green-400 font-mono text-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span>Loading dashboard data...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black">
      <Header />
      
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-300 mb-2 font-mono glow-text">
                &gt; System Dashboard
              </h1>
              <p className="text-green-500 font-mono text-lg">
                // Digital Forensics & Evidence Management
              </p>
            </div>
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-2">
                <p className="text-red-400 font-mono text-sm">
                  ⚠️ Using fallback data: {error}
                </p>
              </div>
            )}
            {reports.some(report => report.isSample) && !error && (
              <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg px-4 py-2">
                <p className="text-yellow-400 font-mono text-sm">
                  📁 Displaying sample report data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border-2 border-green-700 rounded-lg p-6 hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider">Total Reports</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-green-200 mt-2 font-mono">{stats.totalReports}</p>
            <div className="w-full bg-green-900 h-1 mt-3 rounded-full">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.totalReports / 10) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-black border-2 border-green-700 rounded-lg p-6 hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider">Verified Today</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-green-200 mt-2 font-mono">{stats.verifiedToday}</p>
            <div className="w-full bg-green-900 h-1 mt-3 rounded-full">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.verifiedToday / 5) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-black border-2 border-green-700 rounded-lg p-6 hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider">Active Users</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-green-200 mt-2 font-mono">{stats.activeUsers}</p>
            <div className="w-full bg-green-900 h-1 mt-3 rounded-full">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.activeUsers / 15) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Activity Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-300 font-mono">
            &gt; Recent Evidence Reports
          </h2>
          <div className="flex items-center space-x-4">
            {reports.some(report => report.isSample) && (
              <span className="text-yellow-500 font-mono text-sm bg-yellow-900/30 px-3 py-1 rounded border border-yellow-700">
                Sample Data
              </span>
            )}
            {/* UPDATED: Connect New Report button to API */}
            <button 
              onClick={handleNewReport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-mono rounded border border-green-500 transition-all duration-300 hover:shadow-glow text-sm"
            >
              + New Report
            </button>
            <button className="px-4 py-2 bg-black hover:bg-gray-800 text-green-400 font-mono rounded border border-green-700 transition-all duration-300 text-sm">
              Filter Results
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-green-800 rounded-lg">
            <p className="text-green-500 font-mono text-lg">No reports found</p>
            <p className="text-green-600 font-mono text-sm mt-2">Upload or generate your first report to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onDelete={handleDeleteReport}  
              />
            ))}
          </div>
        )}

        {/* System Status Footer */}
        <div className="mt-8 p-4 bg-black border border-green-800 rounded font-mono text-sm text-green-400">
          <div className="flex justify-between items-center">
            <span>
              System Status: <span className="text-green-300">
                {error ? 'DEGRADED' : reports.some(r => r.isSample) ? 'DEMO MODE' : 'OPERATIONAL'}
              </span>
            </span>
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
            <span>
              Verified: <span className="text-green-300">{stats.verifiedToday}</span> / 
              Total: <span className="text-green-300">{stats.totalReports}</span>
            </span>
          </div>
          {error && (
            <div className="mt-2 text-red-400 text-xs">
              API Connection: Failed - Using local data
            </div>
          )}
          {reports.some(report => report.isSample) && !error && (
            <div className="mt-2 text-yellow-400 text-xs">
              Displaying sample report data from kali-simulation/reports
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}