import DashboardClient from "./DashboardClient";
import { Suspense } from "react";
import { Header } from "@/components/Header";

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-gamer-dark">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
              <p className="text-lg text-gray-300">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
