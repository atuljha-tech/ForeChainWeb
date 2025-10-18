// app/login/page.js
'use client';

import { signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Matrix-like falling code */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-0.5 h-20 bg-green-400 animate-pulse"></div>
          <div className="absolute top-10 right-1/3 w-0.5 h-16 bg-cyan-400 animate-pulse delay-300"></div>
          <div className="absolute top-20 left-1/2 w-0.5 h-24 bg-purple-400 animate-pulse delay-700"></div>
          <div className="absolute top-40 right-1/4 w-0.5 h-20 bg-blue-400 animate-pulse delay-500"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scan h-1"></div>
      </div>

      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Terminal-style Login Box */}
          <div className="bg-black border-2 border-green-400 rounded-lg shadow-2xl shadow-green-500/20 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="border-b border-green-400 px-6 py-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-green-400 font-mono text-sm font-bold tracking-wider">
                  TERMINAL_AUTH://login
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-mono font-bold text-green-400 mb-2 tracking-wider">
                  SYSTEM ACCESS
                </h1>
                <div className="text-gray-400 font-mono text-sm">
                  <span className="text-green-400 animate-pulse">▶</span> SELECT_AUTH_PROTOCOL
                </div>
              </div>

              <div className="space-y-4">
                {/* Google Button - Cyber Style */}
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full group relative overflow-hidden border-2 border-blue-400 bg-black/80 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-sm flex items-center justify-center">
                      <span className="text-black font-bold text-xs">G</span>
                    </div>
                    <span className="font-mono font-bold text-blue-300 tracking-wider group-hover:text-blue-200 transition-colors duration-300">
                      [GOOGLE_OAUTH]
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-500"></div>
                </button>

                {/* GitHub Button - Cyber Style */}
                <button
                  onClick={() => signIn('github', { callbackUrl: '/' })}
                  className="w-full group relative overflow-hidden border-2 border-purple-400 bg-black/80 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-300 rounded-sm flex items-center justify-center">
                      <span className="text-black font-bold text-xs">GH</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300 tracking-wider group-hover:text-purple-200 transition-colors duration-300">
                      [GITHUB_OAUTH]
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-500"></div>
                </button>
              </div>

              {/* Status Line */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">STATUS:</span>
                  <span className="text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                    READY_FOR_AUTH
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="text-center">
            <div className="font-mono text-gray-500 text-xs space-y-1">
              <div>SECURE_CONNECTION_ESTABLISHED</div>
              <div className="text-green-400/60">ENCRYPTION: AES-256-GCM</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}