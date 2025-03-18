import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";
import Footer from "./Footer";
import { useRef } from "react";
import useElementSize from "@/hooks/useElementSize.ts";
import { useGetSessions } from "@/services/GetSessionsService";

interface OverlayProps {
  children: React.ReactNode;
}

export function Overlay({ children }: Readonly<OverlayProps>) {
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
      <div ref={headerRef} className="sticky top-0 z-40 ">
        <Header
          onClickNewSession={() => {
            onClickNewSession();
          }}
        />
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
