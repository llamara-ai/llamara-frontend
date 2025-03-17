import { useTranslation } from "react-i18next";
import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

interface OverlayProps {
  children: React.ReactNode;
  disableAddSession?: boolean;
}

export function Overlay({
  children,
  disableAddSession,
}: Readonly<OverlayProps>) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const onClickNewSession = async () => {
    await navigate("/", { replace: true }); // Remove session id from URL
    toast({
      variant: "default",
      title: t("chatbot.newSessionCreate"),
    });
  };

  return (
    <Sidebar>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-40 ">
          {disableAddSession ? (
            <Header />
          ) : (
            <Header onClickNewSession={() => void onClickNewSession()} />
          )}
        </div>
        <div className="mx-4 h-full">{children}</div>
      </div>
      <Footer />
    </Sidebar>
  );
}
