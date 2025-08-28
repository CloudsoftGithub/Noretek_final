import NextAuth from "next-auth";

export const authOptions = {
  providers: [], // Empty providers for now
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    // You can keep this empty or remove it
  },
};

export default NextAuth(authOptions);