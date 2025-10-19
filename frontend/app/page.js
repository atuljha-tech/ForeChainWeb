"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from "/components/Header";
import Footer from "/components/Footer";
import ReportCard from "/components/ReportCard";
import { getAllReportsFromChain } from "/utils/blockchain";

const chainReports = await getAllReportsFromChain();
console.log(chainReports);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
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
  const [isDarkMode, setIsDarkMode] = useState(true);

  const scanCategories = [
    { 
      id: "all", 
      name: "All Scans", 
      icon: "🔍", 
      darkColor: "green", 
      lightColor: "emerald",
      description: "View all security scans" 
    },
    { 
      id: "nmap", 
      name: "Network Scans", 
      icon: "🌐", 
      darkColor: "blue", 
      lightColor: "blue",
      description: "Network discovery & port scanning" 
    },
    { 
      id: "nikto", 
      name: "Web Scans", 
      icon: "🕸️", 
      darkColor: "purple", 
      lightColor: "violet",
      description: "Web application security testing" 
    },
    { 
      id: "wireshark", 
      name: "Traffic Analysis", 
      icon: "📡", 
      darkColor: "cyan", 
      lightColor: "cyan",
      description: "Network traffic capture & analysis" 
    },
    { 
      id: "dvwa", 
      name: "Vulnerability Assessment", 
      icon: "🎯", 
      darkColor: "orange", 
      lightColor: "amber",
      description: "Security vulnerability testing" 
    }
  ];

  const getColorClass = (category, type = 'border') => {
    const color = isDarkMode ? category.darkColor : category.lightColor;
    const isActive = selectedCategory === category.id;
    
    if (type === 'text') {
      return isActive ? `text-${color}-600` : `text-${color}-500`;
    }
    
    if (type === 'bg') {
      return isActive ? `bg-${color}-100` : `bg-${color}-50`;
    }
    
    return isActive ? `border-${color}-500` : `border-${color}-300`;
  };

  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    text: {
      primary: isDarkMode ? 'text-green-300' : 'text-emerald-700',
      secondary: isDarkMode ? 'text-green-500' : 'text-emerald-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      inverse: isDarkMode ? 'text-gray-900' : 'text-white'
    },
    card: {
      background: isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
      border: isDarkMode ? 'border-green-700/50' : 'border-emerald-200/50',
      hover: isDarkMode ? 'hover:border-green-400' : 'hover:border-emerald-400'
    },
    status: {
      background: isDarkMode ? 'bg-gray-800/80' : 'bg-gray-50/80',
      border: isDarkMode ? 'border-green-800/50' : 'border-emerald-200/50'
    }
  };

  const hoverEffects = {
    card: isDarkMode 
      ? 'hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 transform hover:-translate-y-2 transition-all duration-500' 
      : 'hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 transform hover:-translate-y-2 transition-all duration-500',
    category: isDarkMode
      ? 'hover:shadow-lg hover:shadow-green-500/10 hover:scale-105 hover:bg-gray-700/50'
      : 'hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 hover:bg-white',
    stat: isDarkMode
      ? 'hover:shadow-lg hover:shadow-green-500/10 hover:bg-gray-800'
      : 'hover:shadow-lg hover:shadow-emerald-500/10 hover:bg-white'
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

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

        const formattedReports = apiReports.map((report, index) => {
          const content = report.content || "";
          
          const toolMatch = content.match(/Tool\s*:\s*([^\n]+)/i) || 
                          content.match(/Scanner:\s*([^\n]+)/i) ||
                          content.match(/NMAP|NIKTO|WIRESHARK|DVWA/i);
          
          const timestampMatch = content.match(/Timestamp\s*:\s*([^\n]+)/i) ||
                                content.match(/Scan ID:\s*([A-Z]+-\d+)/i);
          
          const targetMatch = content.match(/Target\s*:\s*([^\n]+)/i) ||
                            content.match(/Host:\s*([^\n]+)/i);
          
          const resultsMatch = content.match(/Results:([\s\S]*?)(?=Notes:|$)/i) ||
                              content.match(/FINDINGS:([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);

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
        const mockReports = [
          { 
            id: 1, 
            tool: "Nmap Network Scan", 
            toolType: "nmap",
            timestamp: new Date().toLocaleString(), 
            uploader: "Target: 192.168.1.0/24", 
            hash: "0xa1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcd",
            isSample: true,
            isVerified: true,
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
          verifiedToday: 1,
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
  }, [session]);

  const filteredReports = selectedCategory === "all" 
    ? reports 
    : reports.filter(report => report.toolType === selectedCategory);

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

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`${isDarkMode ? 'text-green-400' : 'text-emerald-600'} font-mono text-xl`}>
          <div className="flex items-center space-x-4">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-green-500' : 'border-emerald-500'}`}></div>
            <span>Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`${isDarkMode ? 'text-green-400' : 'text-emerald-600'} font-mono text-xl`}>
          Redirecting to login...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses.background}`}>
        <Header onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
        <main className="flex-grow flex items-center justify-center">
          <div className={`${themeClasses.text.primary} font-mono text-xl`}>
            <div className="flex items-center space-x-4">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-green-500' : 'border-emerald-500'}`}></div>
              <span>Loading dashboard data...</span>
            </div>
          </div>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.background} transition-colors duration-300`}>
      <Header onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} />
      
      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-2xl sm:text-4xl font-bold ${themeClasses.text.primary} mb-2 font-mono ${isDarkMode ? 'glow-text' : ''}`}>
                &gt; System Dashboard
              </h1>
              <p className={`${themeClasses.text.secondary} font-mono text-sm sm:text-lg`}>
                // Digital Forensics & Evidence Management
              </p>
            </div>
            {error && (
              <div className={`${isDarkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-100 border-red-300'} border rounded-lg px-3 py-2 sm:px-4 sm:py-2`}>
                <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} font-mono text-xs sm:text-sm`}>
                  ⚠️ Using fallback data: {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: "Total Reports", value: stats.totalReports, color: "green" },
            { label: "Verified Reports", value: stats.verifiedToday, color: "green" },
            { label: "Active Users", value: stats.activeUsers, color: "green" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`${themeClasses.card.background} border-2 ${isDarkMode ? 'border-green-700/50' : 'border-emerald-200/50'} rounded-xl p-4 sm:p-6 ${hoverEffects.stat} transition-all duration-300 cursor-pointer backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`${isDarkMode ? 'text-green-400' : 'text-emerald-600'} font-mono text-xs sm:text-sm uppercase tracking-wider`}>
                  {stat.label}
                </h3>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-green-200' : 'text-emerald-700'} mt-2 font-mono`}>
                {stat.value}
              </p>
              <div className={`w-full ${isDarkMode ? 'bg-green-900/50' : 'bg-emerald-100'} h-1.5 mt-3 rounded-full`}>
                <div 
                  className={`${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} h-1.5 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(100, (stat.value / (index === 2 ? 15 : 10)) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Scan Categories */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`text-xl sm:text-2xl font-bold ${themeClasses.text.primary} font-mono mb-4`}>
            &gt; Scan Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {scanCategories.map((category) => {
              const count = category.id === "all" 
                ? stats.totalReports 
                : categoryStats[category.id] || 0;
              
              const isActive = selectedCategory === category.id;
              const colorClass = getColorClass(category);
              const textColorClass = getColorClass(category, 'text');
              
              return (
                <div
                  key={category.id}
                  className={`${themeClasses.card.background} border-2 ${colorClass} rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 ${hoverEffects.category} backdrop-blur-sm ${
                    isActive ? (isDarkMode ? 'ring-2 ring-green-500' : 'ring-2 ring-emerald-500') : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl sm:text-2xl">{category.icon}</div>
                    <div className={`text-base sm:text-lg font-bold ${textColorClass} font-mono`}>
                      {count}
                    </div>
                  </div>
                  <h3 className={`font-bold ${textColorClass} font-mono text-xs sm:text-sm mb-1`}>
                    {category.name}
                  </h3>
                  <p className={`${themeClasses.text.muted} text-xs leading-tight`}>
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className={`text-xl sm:text-2xl font-bold ${themeClasses.text.primary} font-mono`}>
            &gt; {selectedCategory === "all" ? "All" : scanCategories.find(c => c.id === selectedCategory)?.name} Reports
          </h2>
          <div className="flex items-center space-x-3">
            {reports.some(report => report.isSample) && (
              <span className={`${isDarkMode ? 'text-yellow-500 bg-yellow-900/30 border-yellow-700' : 'text-yellow-600 bg-yellow-100 border-yellow-300'} font-mono text-xs px-2 py-1 rounded-lg border`}>
                Sample Data
              </span>
            )}
            <div className={`text-sm ${themeClasses.text.secondary} font-mono`}>
              Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className={`text-center py-12 border-2 border-dashed ${isDarkMode ? 'border-green-800/50' : 'border-emerald-200/50'} rounded-xl backdrop-blur-sm`}>
            <p className={`${themeClasses.text.secondary} font-mono text-lg mb-2`}>
              No {selectedCategory !== "all" ? selectedCategory : ""} reports found
            </p>
            <p className={`${isDarkMode ? 'text-green-600' : 'text-emerald-500'} font-mono text-sm`}>
              {selectedCategory === "all" 
                ? "Run scans to see reports here" 
                : `Run ${scanCategories.find(c => c.id === selectedCategory)?.name} to see reports`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredReports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onDelete={handleDeleteReport}
                isDarkMode={isDarkMode}
                // Remove themeClasses and hoverEffects props to maintain black hacker theme
              />
            ))}
          </div>
        )}

        {/* System Status Footer */}
        <div className={`mt-6 sm:mt-8 p-3 sm:p-4 ${themeClasses.status.background} border ${themeClasses.status.border} rounded-xl font-mono text-xs sm:text-sm ${themeClasses.text.secondary} backdrop-blur-sm`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span>
              System Status: <span className={themeClasses.text.primary}>
                {error ? 'DEGRADED' : reports.some(r => r.isSample) ? 'DEMO MODE' : 'OPERATIONAL'}
              </span>
            </span>
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
            <span>
              Verified: <span className={themeClasses.text.primary}>{stats.verifiedToday}</span> / 
              Total: <span className={themeClasses.text.primary}>{stats.totalReports}</span>
            </span>
          </div>
          {error && (
            <div className={`mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'} text-xs text-center sm:text-left`}>
              API Connection: Failed - Using local data
            </div>
          )}
        </div>
      </main>
      
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}