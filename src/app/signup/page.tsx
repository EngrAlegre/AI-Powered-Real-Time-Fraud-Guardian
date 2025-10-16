import { SignupForm } from "@/components/auth/signup-form";
import { Gem } from "lucide-react";

export default function SignupPage() {
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
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Get started with Fraud Guardian
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
