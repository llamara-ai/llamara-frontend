import { useAppContext } from "@/services/AppContextService";
import { useTranslation } from "react-i18next";
import useCurrentPage from "@/hooks/useCurrentPage";

export default function Footer() {
  const { imprintUrl, privacyPolicyUrl } = useAppContext();
  const { t } = useTranslation();

  const activePage = useCurrentPage();

  return (
    <footer className="pb-1 text-center">
      {activePage === "chatbot" && (
        <small className="block mt-2 text-xs text-muted-foreground text-center w-full pb-2">
          {t("footer.hint")}
        </small>
      )}
      {(imprintUrl ?? privacyPolicyUrl) && (
        <nav className="flex flex-row justify-center gap-4">
          {imprintUrl && (
            <a
              href={imprintUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              {t("footer.imprint")}
            </a>
          )}
          {privacyPolicyUrl && (
            <a
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              {t("footer.privacyPolicy")}
            </a>
          )}
        </nav>
      )}
    </footer>
  );
}
