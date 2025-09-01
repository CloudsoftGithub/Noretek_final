import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import db from "@/lib/mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const client = await db;
        const users = client.db().collection("users");
        const user = await users.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Invalid password");

        return { id: user._id, email: user.email };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
