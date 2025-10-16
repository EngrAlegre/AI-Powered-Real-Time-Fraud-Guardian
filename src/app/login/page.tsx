import { LoginForm } from "@/components/auth/login-form";
import { Gem } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary p-3 rounded-lg">
              <Gem className="text-primary-foreground h-8 w-8" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Welcome back to Fraud Guardian
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
