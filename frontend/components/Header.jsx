import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black border-b-2 border-green-500 text-green-400 p-4 flex justify-between items-center font-mono">
      <h1 className="text-xl font-bold text-green-300 glow-text">
        &gt; ForenChain_
      </h1>
      <nav className="space-x-6">
        <Link 
          href="/" 
          className="hover:text-green-200 hover:underline transition-all duration-300 terminal-link"
        >
          [Dashboard]
        </Link>
        <Link 
          href="/upload" 
          className="hover:text-green-200 hover:underline transition-all duration-300 terminal-link"
        >
          [Upload]
        </Link>
        <Link 
          href="/verify" 
          className="hover:text-green-200 hover:underline transition-all duration-300 terminal-link"
        >
          [Verify]
        </Link>
        <Link 
          href="/login" 
          className="hover:text-green-200 hover:underline transition-all duration-300 terminal-link"
        >
          [Login]
        </Link>
      </nav>
    </header>
  );
}