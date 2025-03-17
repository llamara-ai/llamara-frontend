import SidebarContent from "../sidebar/SidebarContent";
import Sidebar from "../sidebar/Sidebar";
import useGetSessionsApi from "@/hooks/api/useGetSessionsApi";

export default function Upload() {
  const useSessionsApiInstance = useGetSessionsApi();

  return (
    <Sidebar
      sideBarContent={
        <SidebarContent useSessionsApiInstance={useSessionsApiInstance} />
      }
    >
      <div className="h-full text-center justify-center items-center">
        <h1>Upload Page</h1>
      </div>
    </Sidebar>
  );
}
