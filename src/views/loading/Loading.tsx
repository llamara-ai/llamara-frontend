import { Card } from "@/components/ui/card";
import { useLogo } from "@/hooks/useLogo";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/views/overlays/Footer.tsx";
import { Spinner } from "@/components/ui/spinner";

interface LoadingViewProps {
  error?: string;
}

// If error string is provided then show error message
// Otherwise show loading progress bar
export default function LoadingView({ error }: Readonly<LoadingViewProps>) {
  const { t } = useTranslation();
  const logoSrc = useLogo();

  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="p-10 max-w-[400px] w-full">
          <div className="flex flex-col items-center">
            <img src={logoSrc} alt="Logo" className="mb-5" />
            {error ? (
              <h1 className="text-2xl font-semibold mb-4">{error}</h1>
            ) : (
              <>
                <h1 className="text-2xl font-semibold mb-4">
                  {t("loading.title")}
                </h1>
                <Spinner size="large" className="mt-5" />
              </>
            )}
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
