// lib/auth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const userCredentials = process.env.USER_CREDENTIALS;
        
        if (!userCredentials) {
          console.error('USER_CREDENTIALS not found in environment');
          return null;
        }

        const users = userCredentials.split(',').map(pair => {
          const [username, password] = pair.split(':');
          return { username, password };
        });

        const user = users.find(u => 
          u.username === credentials.username && u.password === credentials.password
        );

        if (user) {
          return {
            id: user.username,
            name: user.username,
            email: `${user.username}@forenchain.com`,
            role: 'user'
          };
        }

        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.sub;
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);