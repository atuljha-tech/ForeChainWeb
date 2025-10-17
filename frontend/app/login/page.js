'use client';
import Header from "/components/Header";
import Footer from "/components/Footer";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  console.log('🔐 Login component rendering...');
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  // Test if signIn is available
  console.log('✅ signIn function available:', typeof signIn);
  
  const demoCredentials = [
    { username: 'demo_user', password: 'demo123', role: 'user' },
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'security_analyst', password: 'analyst123', role: 'analyst' }
  ];

  const handleCredentialLogin = async (e) => {
    console.log('🔑 Handling credential login...');
    e.preventDefault();
    setIsLoading(true);
    setActiveProvider('credentials');
    setError('');

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    console.log('📝 Login attempt:', { username, password });

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      console.log('🔐 Credential signIn result:', result);

      if (result?.error) {
        console.log('❌ Credential login failed:', result.error);
        setError('Invalid credentials. Try: demo_user / demo123');
      } else {
        console.log('✅ Credential login successful, redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('💥 Credential login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      console.log('🏁 Credential login process completed');
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const handleOAuthLogin = async (provider) => {
    console.log(`🌐 Starting OAuth login with: ${provider}`);
    console.log('📊 Current loading state:', isLoading);
    console.log('🎯 Active provider:', activeProvider);
    
    setIsLoading(true);
    setActiveProvider(provider);
    setError('');

    try {
      console.log(`🚀 Calling signIn for ${provider}...`);
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false 
      });
      
      console.log(`📨 ${provider} signIn result:`, result);
      
      if (result?.error) {
        console.log(`❌ ${provider} login failed:`, result.error);
        setError(`${provider} login failed: ${result.error}`);
      } else if (result?.url) {
        console.log(`✅ ${provider} login successful, redirecting to:`, result.url);
        router.push(result.url);
      } else {
        console.log(`⚠️ ${provider} login returned no result`);
        setError(`${provider} login failed. No response received.`);
      }
    } catch (error) {
      console.error(`💥 ${provider} login error:`, error);
      setError(`${provider} login failed. Please try again.`);
    } finally {
      console.log(`🏁 ${provider} login process completed`);
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const handleDemoLogin = (demoUser) => {
    console.log('👤 Filling demo credentials:', demoUser.username);
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (usernameInput && passwordInput) {
      usernameInput.value = demoUser.username;
      passwordInput.value = demoUser.password;
      console.log('✅ Demo credentials filled');
    } else {
      console.log('❌ Could not find input fields');
    }
  };

  console.log('🎨 Rendering login UI...');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Enhanced Animated Background - FIXED with pointer-events-none */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-purple-600 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-1500"></div>
          
          {/* Scanning lines animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scan h-1"></div>
        </div>

        {/* Login Container */}
        <div className="bg-black border-2 border-green-700 rounded-xl p-8 w-full max-w-md relative z-10 hover:border-green-500 transition-all duration-500 hover:shadow-glow group">
          
          {/* Terminal Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full group-hover:bg-red-400 transition-colors"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full group-hover:bg-yellow-400 transition-colors"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full group-hover:bg-green-400 transition-colors"></div>
            </div>
            <div className="text-green-400 font-mono text-sm flex-1 text-center glow-text">
              {isLoading ? 'AUTHENTICATING...' : 'FORENCHAIN_AUTH'}
            </div>
          </div>

          {/* Login Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-300 mb-2 font-mono glow-text animate-pulse">
              {isLoading ? 'PROCESSING...' : 'ACCESS_CONTROL'}
            </h1>
            <p className="text-green-500 font-mono text-sm">
              {isLoading ? 'Verifying credentials...' : 'Secure Authentication Required'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg animate-shake">
              <p className="text-red-300 font-mono text-sm text-center">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleCredentialLogin} className="space-y-6">
            <div>
              <label className="block text-green-400 font-mono text-sm mb-2">
                USER_ID:
              </label>
              <input 
                name="username"
                type="text" 
                className="w-full bg-gray-900 border border-green-700 rounded px-4 py-3 text-green-300 font-mono focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-600"
                placeholder="Enter username..."
                defaultValue="demo_user"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-green-400 font-mono text-sm mb-2">
                AUTH_KEY:
              </label>
              <input 
                name="password"
                type="password" 
                className="w-full bg-gray-900 border border-green-700 rounded px-4 py-3 text-green-300 font-mono focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-600"
                placeholder="••••••••••••••"
                defaultValue="demo123"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="mr-2 bg-gray-900 border-green-700 text-green-500 focus:ring-green-500"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="text-green-400 font-mono text-sm">
                Maintain secure session
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full font-mono py-3 px-4 rounded border transition-all duration-300 transform hover:-translate-y-0.5 ${
                isLoading && activeProvider === 'credentials'
                  ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-500 text-white hover:shadow-glow'
              }`}
            >
              {isLoading && activeProvider === 'credentials' ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AUTHENTICATING...
                </span>
              ) : (
                '🔐 INITIATE_AUTHENTICATION'
              )}
            </button>
          </form>

          {/* Demo Accounts Quick Select */}
          <div className="mt-6">
            <p className="text-green-500 font-mono text-sm text-center mb-3">
              QUICK_DEMO_ACCOUNTS:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoCredentials.map((user, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(user)}
                  disabled={isLoading}
                  className="text-green-400 font-mono text-xs bg-gray-900 hover:bg-gray-800 border border-green-800 rounded px-2 py-1 transition-all duration-300 hover:border-green-500 hover:text-green-300 disabled:opacity-50"
                >
                  {user.username}
                </button>
              ))}
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="mt-6 pt-6 border-t border-green-800">
            <p className="text-green-500 font-mono text-sm text-center mb-4">
              --- EXTERNAL_AUTH_PROVIDERS ---
            </p>
            
            <div className="space-y-3">
              {/* Google OAuth */}
              <button
                onClick={() => {
                  console.log('🖱️ Google button clicked');
                  handleOAuthLogin('google');
                }}
                disabled={isLoading}
                className={`w-full font-mono py-3 px-4 rounded border transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 ${
                  isLoading && activeProvider === 'google'
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800 hover:shadow-lg'
                }`}
              >
                {isLoading && activeProvider === 'google' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>SIGN_IN_WITH_GOOGLE</span>
                  </>
                )}
              </button>

              {/* GitHub OAuth */}
              <button
                onClick={() => {
                  console.log('🖱️ GitHub button clicked');
                  handleOAuthLogin('github');
                }}
                disabled={isLoading}
                className={`w-full font-mono py-3 px-4 rounded border transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 ${
                  isLoading && activeProvider === 'github'
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-white hover:shadow-glow'
                }`}
              >
                {isLoading && activeProvider === 'github' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>SIGN_IN_WITH_GITHUB</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-gray-900 rounded border border-green-800">
            <p className="text-green-400 font-mono text-xs text-center">
              🔒 All access attempts are logged and monitored
            </p>
          </div>
        </div>

        {/* Enhanced System Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-black px-4 py-2 rounded border border-green-800 group hover:border-green-500 transition-all duration-300">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            <span className="text-green-400 font-mono text-sm">
              {isLoading ? 'AUTH_IN_PROGRESS' : 'SYSTEM_SECURE'}
            </span>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}