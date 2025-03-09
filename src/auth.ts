import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import type { DefaultSession } from "next-auth";

// セッションの型定義を拡張
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

const providers: Provider[] = [Google];

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider();
            return { id: providerData.id, name: providerData.name };
        } else {
            return { id: provider.id, name: provider.name };
        }
    })
    .filter((provider) => provider.id !== "credentials");

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true,
    providers: providers,
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth;
        },
        async session({ session, token }) {
            if (session.user) {
                // セッションにユーザーIDを追加
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                // JWTにproviderAccountIdを保存
                token.sub = account.providerAccountId;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
});
