import DashboardClient from "./DashboardClient";
import { Suspense } from "react";
import { Header } from "@/components/Header";

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex site-page min-h-screen flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-primary border-opacity-50 mx-auto"></div>
              <p className="text-lg text-foreground/80">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
