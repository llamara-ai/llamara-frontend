import { useLocation } from "react-router-dom";

export default function useCurrentPage() {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/") {
    return "chatbot";
  } else if (path === "/knowledge") {
    return "knowledge";
  } else {
    return "unknown";
  }
}
