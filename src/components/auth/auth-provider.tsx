"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col flex-1 min-h-screen p-8">
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex flex-1 gap-4">
                <Skeleton className="h-full w-64" />
                <Skeleton className="h-full flex-1" />
            </div>
        </div>
    )
  }

  return <>{children}</>;
}
