import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import useCurrentPage from "@/hooks/useCurrentPage";
import { t } from "i18next";
import { Bot, HardDriveUpload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RedirectButton() {
  const activePage = useCurrentPage();
  const isKnowledgePage = activePage === "knowledge";

  const ButtonLabel = !isKnowledgePage
    ? t("sidebar.knowledge")
    : t("sidebar.chatbot");
  const buttonIcon = !isKnowledgePage ? <HardDriveUpload /> : <Bot />;

  const { open } = useSidebar();
  const navigate = useNavigate();

  const redirect = () => {
    if (!isKnowledgePage) {
      void navigate(`/knowledge`);
    } else {
      void navigate(`/`);
    }
  };

  return (
    <Button
      onClick={redirect}
      className="bg-secondary border-primary border-1 text-primary hover:text-secondary"
    >
      {open ? <>{ButtonLabel}</> : <>{buttonIcon}</>}
    </Button>
  );
}
