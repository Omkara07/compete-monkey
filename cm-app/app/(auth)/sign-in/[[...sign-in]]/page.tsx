import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return <SignIn
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        signUpUrl={null as any}
        withSignUp={true}
    />
}