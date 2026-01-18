"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { authStore } from "@/stores/AuthStore";

const LoginPage = observer(function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    authStore.checkSession();
  }, []);

  useEffect(() => {
    if (!authStore.isLoading && authStore.isAuthenticated) {
      router.push("/board");
    }
  }, [authStore.isLoading, authStore.isAuthenticated, router]);

  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Super Bowl Squares</h1>
      <LoginForm />
    </div>
  );
});

export default LoginPage;
