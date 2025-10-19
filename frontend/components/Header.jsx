import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header({ onThemeToggle, isDarkMode }) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gray-900 border-gray-700' 
      : 'bg-white border-gray-200',
    text: {
      primary: isDarkMode ? 'text-green-400' : 'text-emerald-600',
      secondary: isDarkMode ? 'text-green-300' : 'text-emerald-500',
      accent: isDarkMode ? 'text-green-200' : 'text-emerald-700',
      muted: isDarkMode ? 'text-gray-300' : 'text-gray-600'
    },
    button: {
      background: isDarkMode 
        ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
        : 'bg-gray-100 hover:bg-gray-200 border-gray-300',
      primary: isDarkMode 
        ? 'bg-green-900 hover:bg-green-800 border-green-600' 
        : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400'
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/upload", label: "Upload", icon: "📁" },
    { href: "/verify", label: "Verify", icon: "✅" },
    { href: "/login", label: "Login", icon: "🔐" }
  ];

  return (
    <header className={`${themeClasses.background} border-b transition-all duration-300 sticky top-0 z-50 shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
            <div className="flex flex-col">
              <h1 className={`text-xl font-bold ${themeClasses.text.primary} font-mono tracking-tight`}>
                FORENCHAIN
              </h1>
              <p className={`${themeClasses.text.muted} font-mono text-xs`}>
                Security Dashboard
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 border ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:border-green-500 hover:text-green-300' 
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-emerald-500 hover:text-emerald-600'
                } hover:scale-105 hover:shadow-lg`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Section - Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-3 rounded-xl border transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-green-500 text-yellow-400' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-emerald-500 text-gray-700'
              } hover:shadow-lg flex items-center justify-center`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mounted && (
                <div className="w-5 h-5 flex items-center justify-center">
                  {isDarkMode ? (
                    // Sun icon for light mode
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    // Moon icon for dark mode
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </div>
              )}
            </button>

            {/* User Info / Status */}
            <div className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-green-400' 
                : 'bg-gray-100 border-gray-300 text-emerald-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span className="font-mono text-sm">Online</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-3 rounded-xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-green-500' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-emerald-500'
              } ${isMobileMenuOpen ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <span className={`block w-5 h-0.5 transition-all duration-300 ${isDarkMode ? 'bg-green-400' : 'bg-emerald-600'} ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${isDarkMode ? 'bg-green-400' : 'bg-emerald-600'} ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${isDarkMode ? 'bg-green-400' : 'bg-emerald-600'} ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}>
          <div className={`rounded-xl border p-4 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-gray-100 border-gray-300'
          }`}>
            <nav className="grid grid-cols-2 gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-mono text-sm transition-all duration-300 border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600 hover:border-green-500 hover:text-green-300' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-emerald-500 hover:text-emerald-600'
                  } hover:scale-105`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Mobile Status */}
            <div className={`mt-4 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-500 text-green-400' 
                : 'bg-white border-gray-300 text-emerald-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span className="font-mono text-sm">System Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`border-t py-1 ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`font-mono text-xs ${themeClasses.text.muted}`}>
                <span className={isDarkMode ? 'text-green-500' : 'text-emerald-500'}>▶</span> Secure Session Active
              </span>
              <span className={`font-mono text-xs ${themeClasses.text.muted} hidden sm:inline`}>
                <span className={isDarkMode ? 'text-green-500' : 'text-emerald-500'}>▶</span> Blockchain Verified
              </span>
            </div>
            <div className={`font-mono text-xs ${themeClasses.text.muted}`}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}