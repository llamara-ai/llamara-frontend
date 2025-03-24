import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";
import Footer from "./Footer";
import { CSSProperties, useRef } from "react";
import useElementSize from "@/hooks/useElementSize.ts";
import { useGetSessions } from "@/services/GetSessionsService";

interface OverlayProps {
  children: React.ReactNode;
  contentToTop?: boolean;
}

export function Overlay({ children, contentToTop }: Readonly<OverlayProps>) {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const headerSize = useElementSize(headerRef);
  const footerSize = useElementSize(footerRef);
  const { setActiveSessionId } = useGetSessions();

  const onClickNewSession = () => {
    setActiveSessionId(null);
  };

  return (
    <Sidebar>
      <div
        ref={headerRef}
        className={`fixed top-0 w-full z-40 ${contentToTop ? "bg-background xl:bg-transparent" : ""}`}
      >
        <Header
          onClickNewSession={() => {
            onClickNewSession();
          }}
        />
      </div>
      <div
        className="px-4 overflow-y-auto"
        style={
          {
            "--header-height": `${headerSize.height.toString()}px`,
            "--footer-height": `${footerSize.height.toString()}px`,
            height: contentToTop
              ? "calc(100dvh - var(--footer-height))"
              : "calc(100dvh - var(--header-height) - var(--footer-height))",
            marginTop: contentToTop ? "0" : "var(--header-height)",
            marginLeft: "env(safe-area-inset-left, 0)",
            marginRight: "env(safe-area-inset-right, 0)",
          } as CSSProperties
        }
      >
        {children}
      </div>
      <div ref={footerRef} className="bottom-0 z-40">
        <Footer />
      </div>
    </Sidebar>
  );
}
