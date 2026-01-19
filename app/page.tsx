"use client";

import { useEffect, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { authStore } from "@/stores/AuthStore";

const LoginPage = observer(function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    if (!authStore.isLoading && authStore.isAuthenticated) {
      router.push(redirectTo || "/boards");
    }
  }, [authStore.isLoading, authStore.isAuthenticated, router, redirectTo]);

  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Squares Board Inc.</h1>
      <LoginForm redirectTo={redirectTo || undefined} />
    </div>
  );
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
