import SidebarContent from "../sidebar/SidebarContent";
import Sidebar from "../sidebar/Sidebar";

export default function Upload() {
  return (
    <Sidebar sideBarContent={<SidebarContent />}>
      <div className="h-full text-center justify-center items-center">
        <h1>Upload Page</h1>
      </div>
    </Sidebar>
  );
}
