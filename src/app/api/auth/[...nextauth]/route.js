import NextAuth from "@/lib/next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };