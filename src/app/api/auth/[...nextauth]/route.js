import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Warning: NEXTAUTH_SECRET is not set. This is required for production.');
}

const authOptions = {
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
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Only try to connect if we have a MongoDB URI
        if (process.env.MONGODB_URI) {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'VISITOR',
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // Always allow sign-in even if DB fails (for development/testing)
        return true;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Handle relative URLs
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }

        // Handle absolute URLs: Allow if same origin, else fallback to baseUrl
        try {
          const urlObj = new URL(url, baseUrl);
          if (urlObj.origin === baseUrl) {
            // Clean: Remove callbackUrl param if present (prevents nesting)
            if (urlObj.searchParams.has('callbackUrl')) {
              urlObj.searchParams.delete('callbackUrl');
            }
            // For homepage fallback (post-auth), use env if set
            if (urlObj.pathname === '/' && process.env.NEXTAUTH_CALLBACK_URL) {
              const callbackPath = process.env.NEXTAUTH_CALLBACK_URL.startsWith('/') 
                ? process.env.NEXTAUTH_CALLBACK_URL 
                : `/${process.env.NEXTAUTH_CALLBACK_URL}`;
              urlObj.pathname = callbackPath;
              urlObj.search = '';
              return urlObj.href;
            }
            return urlObj.href;
          }
        } catch (e) {
          // Parsing failed: fallback to baseUrl
          console.error('Error parsing URL in redirect callback:', e);
        }

        // Default fallback
        return baseUrl;
      } catch (error) {
        console.error('Error in redirect callback:', error);
        // Always return baseUrl as fallback
        return baseUrl;
      }
    },
    async session({ session }) {
      try {
        // Only try to connect if we have a MongoDB URI
        if (process.env.MONGODB_URI && session?.user?.email) {
          await connectDB();
          
          const user = await User.findOne({ email: session.user.email });
          
          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role;
            session.user.category = user.category;
            session.user.semester = user.semester;
            session.user.availabilityStatus = user.availabilityStatus;
          } else {
            // Set default role if user not found in DB
            session.user.role = session.user.role || 'VISITOR';
          }
        } else {
          // Set default role if no MongoDB URI
          session.user.role = session.user.role || 'VISITOR';
        }
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        // Always return session even if DB fails (for development/testing)
        session.user.role = session.user.role || 'VISITOR';
        return session;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { authOptions };

// Standard NextAuth v4 export pattern for App Router
// Wrap to ensure they're functions and handle Next.js 15+ params
export async function GET(request, context) {
  // Await params if it's a Promise (Next.js 15+)
  if (context?.params && typeof context.params.then === 'function') {
    context.params = await context.params;
  }
  // Call the handler's GET method
  if (typeof handler.GET === 'function') {
    return handler.GET(request, context);
  }
  // Fallback: if handler is a function itself, call it
  if (typeof handler === 'function') {
    return handler(request, context);
  }
  throw new Error('NextAuth handler is not properly configured');
}

export async function POST(request, context) {
  // Await params if it's a Promise (Next.js 15+)
  if (context?.params && typeof context.params.then === 'function') {
    context.params = await context.params;
  }
  // Call the handler's POST method
  if (typeof handler.POST === 'function') {
    return handler.POST(request, context);
  }
  // Fallback: if handler is a function itself, call it
  if (typeof handler === 'function') {
    return handler(request, context);
  }
  throw new Error('NextAuth handler is not properly configured');
}