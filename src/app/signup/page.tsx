import { SignupForm } from "~/components/SignupForm";

export function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0" />
      <SignupForm />
    </div>
  );
}

export default SignupPage;
