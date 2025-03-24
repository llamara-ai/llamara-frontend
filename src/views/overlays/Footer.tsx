import { useAppContext } from "@/services/AppContextService";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { imprintUrl, privacyPolicyUrl } = useAppContext();
  const { t } = useTranslation();

  return (
    <footer
      className="text-center"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0.25rem)",
        marginLeft: "env(safe-area-inset-left, 0)",
        marginRight: "env(safe-area-inset-right, 0)",
      }}
    >
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
