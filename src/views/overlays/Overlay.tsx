import { useTranslation } from "react-i18next";
import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { useRef } from "react";
import useElementSize from "@/hooks/useElementSize.ts";

interface OverlayProps {
  children: React.ReactNode;
}

export function Overlay({ children }: Readonly<OverlayProps>) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const headerSize = useElementSize(headerRef);
  const footerSize = useElementSize(footerRef);

  const onClickNewSession = async () => {
    await navigate("/", { replace: true }); // Remove session id from URL
    toast({
      variant: "default",
      title: t("chatbot.newSessionCreate"),
    });
  };

  return (
    <Sidebar>
      <div ref={headerRef} className="sticky top-0 z-40 ">
        <Header onClickNewSession={() => void onClickNewSession()} />
      </div>
      <div
        className="mx-4"
        style={{
          height: `calc(100dvh - ${headerSize.height.toString()}px - ${footerSize.height.toString()}px)`,
        }}
      >
        {children}
      </div>
      <div ref={footerRef} className="sticky bottom-0 z-40">
        <Footer />
      </div>
    </Sidebar>
  );
}
