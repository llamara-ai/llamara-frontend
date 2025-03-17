import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLogo } from "@/hooks/useLogo";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    <div className="flex flex-col items-center justify-center h-screen bg-background">
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
              <Progress value={33} className="w-[80%] mt-5" />
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
