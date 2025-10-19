export default function Footer({ isDarkMode }) {
  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm',
    border: isDarkMode ? 'border-green-800/50' : 'border-emerald-200/50',
    text: {
      primary: isDarkMode ? 'text-green-300' : 'text-emerald-700',
      secondary: isDarkMode ? 'text-green-600/80' : 'text-emerald-500/80',
      muted: isDarkMode ? 'text-gray-500' : 'text-gray-400'
    }
  };

  return (
    <footer className={`${themeClasses.background} border-t ${themeClasses.border} transition-all duration-500`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Primary Text */}
          <div className={`${themeClasses.text.primary} font-mono text-sm text-center mb-2 flex items-center justify-center space-x-2`}>
            <span className="opacity-80">&gt;</span>
            <span>Copyright 2025 ForenChain Web</span>
            <span className="opacity-80">•</span>
            <span>All Rights Reserved</span>
          </div>
          
          {/* Secondary Tagline */}
          <div className={`${themeClasses.text.secondary} font-mono text-xs text-center flex items-center justify-center space-x-4`}>
            <span className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span>Secure</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span>Encrypted</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span>Trusted</span>
            </span>
          </div>

          {/* Bottom Status Bar */}
          <div className={`${themeClasses.text.muted} font-mono text-xs text-center mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center space-x-1">
                <span>🟢</span>
                <span>System Online</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center space-x-1">
                <span>🔒</span>
                <span>Blockchain Secured</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className={`h-px bg-gradient-to-r from-transparent via-${isDarkMode ? 'green' : 'emerald'}-500 to-transparent opacity-30`}></div>
    </footer>
  );
}