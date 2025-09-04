"use client"

import { SignIn, useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function Page() {
    const { user } = useUser()

    if (!user) {
        return <SignIn
            withSignUp={true}
            path="/sign-in"
            routing="path"
            afterSignInUrl={'/dashboard'}
            afterSignUpUrl={'/dashboard'}
        />
    }

    return redirect('/dashboard')
}