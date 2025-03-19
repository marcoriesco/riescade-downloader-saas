import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

export default function DownloadSection() {
  const { isActive } = useSubscription();

  // Function to handle app download
  const handleDownload = () => {
    // In a real app, this would download the actual application or redirect to a download page
    window.location.href = "/download/RIESCADE_Downloader.zip";
  };

  return (
    <Card className={`${!isActive ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle>RIESCADE Downloader</CardTitle>
        <CardDescription>
          Baixe a versão mais recente do RIESCADE Downloader.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <Download className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">
            RIESCADE Downloader v1.0.0
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            O aplicativo oficial para baixar e gerenciar seu conteúdo RIESCADE.
          </p>
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={!isActive}
            className="w-full sm:w-auto gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Aplicativo
          </Button>

          {!isActive && (
            <p className="text-amber-600 dark:text-amber-400 mt-4 text-center">
              Por favor, assine para baixar o aplicativo.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
