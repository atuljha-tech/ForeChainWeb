"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from "/components/Header";
import Footer from "/components/Footer";
import ReportCard from "/components/ReportCard";

export default function Dashboard() {
  // ALL HOOKS MUST BE AT THE TOP - no conditionals before this
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Move ALL state hooks to the top
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    verifiedToday: 0,
    activeUsers: 8
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categoryStats, setCategoryStats] = useState({});

  // Scan categories with icons and colors
  const scanCategories = [
    { id: "all", name: "All Scans", icon: "🔍", color: "green", description: "View all security scans" },
    { id: "nmap", name: "Network Scans", icon: "🌐", color: "blue", description: "Network discovery & port scanning" },
    { id: "nikto", name: "Web Scans", icon: "🕸️", color: "purple", description: "Web application security testing" },
    { id: "wireshark", name: "Traffic Analysis", icon: "📡", color: "cyan", description: "Network traffic capture & analysis" },
    { id: "dvwa", name: "Vulnerability Assessment", icon: "🎯", color: "orange", description: "Security vulnerability testing" }
  ];

  // Authentication effect
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // SINGLE Data fetching effect
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

        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response format: expected object with reports and ledger");
        }

        const apiReports = data.reports || [];
        const ledger = data.ledger || [];

        // Updated data formatting with tool detection
        const formattedReports = apiReports.map((report, index) => {
          const content = report.content || "";
          
          // Extract data from the report content
          const toolMatch = content.match(/Tool\s*:\s*([^\n]+)/i) || 
                          content.match(/Scanner:\s*([^\n]+)/i) ||
                          content.match(/NMAP|NIKTO|WIRESHARK|DVWA/i);
          
          const timestampMatch = content.match(/Timestamp\s*:\s*([^\n]+)/i) ||
                                content.match(/Scan ID:\s*([A-Z]+-\d+)/i);
          
          const targetMatch = content.match(/Target\s*:\s*([^\n]+)/i) ||
                            content.match(/Host:\s*([^\n]+)/i);
          
          const resultsMatch = content.match(/Results:([\s\S]*?)(?=Notes:|$)/i) ||
                              content.match(/FINDINGS:([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);

          // Determine tool type from filename or content
          let detectedTool = report.tool || "unknown";
          if (!detectedTool || detectedTool === "unknown") {
            if (report.name.includes('nmap')) detectedTool = "nmap";
            else if (report.name.includes('nikto')) detectedTool = "nikto";
            else if (report.name.includes('wireshark')) detectedTool = "wireshark";
            else if (report.name.includes('dvwa')) detectedTool = "dvwa";
          }

          const tool = toolMatch && toolMatch[1] ? toolMatch[1].trim() : 
                      detectedTool !== "unknown" ? detectedTool.toUpperCase() + " Scan" :
                      report.name ? report.name.replace(/_/g, ' ').replace(/\.[^/.]+$/, '') : 
                      `Scan-${index + 1}`;
          
          const timestamp = timestampMatch && timestampMatch[1] ? 
                          new Date(timestampMatch[1].replace(/_/g, ':').replace(/-/g, ':')) : 
                          report.modified ? new Date(report.modified) : new Date();
          
          const target = targetMatch && targetMatch[1] ? targetMatch[1].trim() : "Unknown";
          const results = resultsMatch && resultsMatch[1] ? resultsMatch[1].trim() : "Scan completed successfully";

          // Check if this report is verified in the ledger
          const ledgerEntry = ledger.find(entry => entry.filename === report.name);
          const isVerified = !!ledgerEntry;
          const ledgerHash = ledgerEntry ? ledgerEntry.hash : null;

          return {
            id: report.id || index + 1,
            tool: tool,
            toolType: detectedTool,
            timestamp: timestamp.toLocaleString(),
            uploader: `Target: ${target}`,
            hash: ledgerHash || report.hash || `0x${Math.random().toString(16).slice(2, 42)}`,
            isSample: report.isSample || false,
            results: results,
            target: target,
            isVerified: isVerified,
            ledgerEntry: ledgerEntry,
            filename: report.name
          };
        });

        setReports(formattedReports);
        
        // Calculate category statistics
        const categoryCounts = formattedReports.reduce((acc, report) => {
          const toolType = report.toolType || "unknown";
          acc[toolType] = (acc[toolType] || 0) + 1;
          return acc;
        }, {});

        setCategoryStats(categoryCounts);
        
        setStats({
          totalReports: apiReports.length,
          verifiedToday: ledger.length,
          activeUsers: 8 + Math.floor(apiReports.length)
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
        // Fallback to mock data
        const mockReports = [
          { 
            id: 1, 
            tool: "Nmap Network Scan", 
            toolType: "nmap",
            timestamp: new Date().toLocaleString(), 
            uploader: "Target: 192.168.1.0/24", 
            hash: "0xa1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcd",
            isSample: true,
            isVerified: false,
            filename: "nmap_scan_1.txt"
          },
          { 
            id: 2, 
            tool: "Nikto Web Assessment", 
            toolType: "nikto",
            timestamp: new Date().toLocaleString(), 
            uploader: "Target: http://192.168.1.100", 
            hash: "0xfedcba9876543210abcdef1234567890fedcba9876543210abcdef1234567890",
            isSample: true,
            isVerified: false,
            filename: "nikto_scan_2.txt"
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

    if (session) {
      fetchReports();
      const interval = setInterval(fetchReports, 10000);
      return () => clearInterval(interval);
    }
  }, [session]); // Add session as dependency

  // Filter reports by selected category
  const filteredReports = selectedCategory === "all" 
    ? reports 
    : reports.filter(report => report.toolType === selectedCategory);

  // Function to handle "New Report" button click
  const handleNewReport = async () => {
    try {
      const res = await fetch("/api/run-scan", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        alert(`New demo scan created: ${data.entry.filename}`);
        window.location.reload();
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
      
      if (filename && !filename.includes('sample_scan')) {
        const res = await fetch(`/api/reports?filename=${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete report');
        }
      }
      
      const reportToDelete = reports.find(report => report.id === reportId);
      const wasVerified = reportToDelete?.isVerified || false;
      
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      setStats(prevStats => ({
        ...prevStats,
        totalReports: prevStats.totalReports - 1,
        verifiedToday: wasVerified ? prevStats.verifiedToday - 1 : prevStats.verifiedToday
      }));
      
      console.log('Report deleted successfully');
      
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report: ' + error.message);
      throw error;
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = scanCategories.find(cat => cat.id === categoryId);
    return category?.color || "green";
  };

  // ✅ NOW you can have conditional returns - AFTER all hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 font-mono text-xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span>Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 font-mono text-xl">
          Redirecting to login...
        </div>
      </div>
    );
  }

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

        {/* Scan Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-300 font-mono mb-4">
            &gt; Scan Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {scanCategories.map((category) => {
              const count = category.id === "all" 
                ? stats.totalReports 
                : categoryStats[category.id] || 0;
              
              const isActive = selectedCategory === category.id;
              const borderColor = isActive ? `border-${category.color}-400` : `border-${category.color}-700`;
              const textColor = isActive ? `text-${category.color}-300` : `text-${category.color}-400`;
              
              return (
                <div
                  key={category.id}
                  className={`bg-black border-2 ${borderColor} rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                    isActive ? 'ring-2 ring-' + category.color + '-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">{category.icon}</div>
                    <div className={`text-lg font-bold ${textColor} font-mono`}>
                      {count}
                    </div>
                  </div>
                  <h3 className={`font-bold ${textColor} font-mono text-sm mb-1`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-300 font-mono">
            &gt; {selectedCategory === "all" ? "All" : scanCategories.find(c => c.id === selectedCategory)?.name} Reports
          </h2>
          <div className="flex items-center space-x-4">
            {reports.some(report => report.isSample) && (
              <span className="text-yellow-500 font-mono text-sm bg-yellow-900/30 px-3 py-1 rounded border border-yellow-700">
                Sample Data
              </span>
            )}
            <button 
              onClick={handleNewReport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-mono rounded border border-green-500 transition-all duration-300 hover:shadow-glow text-sm"
            >
              + New Report
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-green-800 rounded-lg">
            <p className="text-green-500 font-mono text-lg">No {selectedCategory !== "all" ? selectedCategory : ""} reports found</p>
            <p className="text-green-600 font-mono text-sm mt-2">
              {selectedCategory === "all" 
                ? "Run scans to see reports here" 
                : `Run ${scanCategories.find(c => c.id === selectedCategory)?.name} to see reports`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}