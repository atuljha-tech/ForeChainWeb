// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Exists' : 'Missing')
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Exists' : 'Missing')

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  debug: true, // Add this to see more details
})

export { handler as GET, handler as POST }