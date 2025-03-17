import { useAppContext } from "@/services/AppContextService";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { imprintUrl, privacyPolicyUrl } = useAppContext();
  const { t } = useTranslation();

  if (!imprintUrl && !privacyPolicyUrl) {
    return null;
  }

  return (
    <footer className="pb-1 text-center">
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
    </footer>
  );
}
