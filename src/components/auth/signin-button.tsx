"use client"
import { signIn } from "next-auth/react"

export type SignInProps = {
    redirectUri: string;
    type: SignInType;
};

export enum SignInType {
    Google = "google"
}

export function SignIn(
    {redirectUri, type}: SignInProps,
) {
    return <button onClick={() => signIn(type, { redirectTo: redirectUri })}>Sign In</button>
}