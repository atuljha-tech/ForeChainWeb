import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header({ onThemeToggle, isDarkMode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const themeClasses = {
    background: isDarkMode ? 'bg-black' : 'bg-white',
    border: isDarkMode ? 'border-green-500' : 'border-emerald-500',
    text: {
      primary: isDarkMode ? 'text-green-300' : 'text-emerald-700',
      secondary: isDarkMode ? 'text-green-400' : 'text-emerald-600',
      hover: isDarkMode ? 'text-green-200' : 'text-emerald-500'
    }
  };

  return (
    <header className={`${themeClasses.background} border-b-2 ${themeClasses.border} ${themeClasses.text.secondary} p-4 flex justify-between items-center font-mono transition-colors duration-300`}>
      <h1 className={`text-xl font-bold ${themeClasses.text.primary} ${isDarkMode ? 'glow-text' : ''}`}>
        &gt; ForenChain_
      </h1>
      
      <div className="flex items-center space-x-6">
        <nav className="flex space-x-6">
          <Link 
            href="/" 
            className={`hover:${themeClasses.text.hover} hover:underline transition-all duration-300 terminal-link`}
          >
            [Dashboard]
          </Link>
          <Link 
            href="/upload" 
            className={`hover:${themeClasses.text.hover} hover:underline transition-all duration-300 terminal-link`}
          >
            [Upload]
          </Link>
          <Link 
            href="/verify" 
            className={`hover:${themeClasses.text.hover} hover:underline transition-all duration-300 terminal-link`}
          >
            [Verify]
          </Link>
          <Link 
            href="/login" 
            className={`hover:${themeClasses.text.hover} hover:underline transition-all duration-300 terminal-link`}
          >
            [Login]
          </Link>
        </nav>

        {/* Theme Toggle Button */}
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-lg border ${
            isDarkMode 
              ? 'border-green-600 hover:border-green-400 bg-green-900/20' 
              : 'border-emerald-400 hover:border-emerald-600 bg-emerald-100'
          } transition-all duration-300 hover:scale-110 focus:outline-none`}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted && (
            <div className="w-5 h-5 flex items-center justify-center">
              {isDarkMode ? (
                // Sun icon for light mode
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}