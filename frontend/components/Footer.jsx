export default function Footer({ isDarkMode }) {
  const themeClasses = {
    background: isDarkMode ? 'bg-black' : 'bg-white',
    border: isDarkMode ? 'border-green-700' : 'border-emerald-300',
    text: {
      primary: isDarkMode ? 'text-green-400' : 'text-emerald-600',
      secondary: isDarkMode ? 'text-green-600' : 'text-emerald-500'
    }
  };

  return (
    <footer className={`${themeClasses.background} border-t-2 ${themeClasses.border} ${themeClasses.text.primary} p-4 text-center font-mono text-sm transition-colors duration-300`}>
      <div className="terminal-line">
        &gt; Copyright 2025 ForenChain Web. All Rights Reserved.
      </div>
      <div className={`${themeClasses.text.secondary} text-xs mt-2`}>
        [ Secure • Encrypted • Trusted ]
      </div>
    </footer>
  );
}