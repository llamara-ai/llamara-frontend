import { Card, CardContent } from "@/components/ui/card";
import { useLogo } from "@/hooks/useLogo";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    <div className="flex w-screen h-screen ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-white text-black'}">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
