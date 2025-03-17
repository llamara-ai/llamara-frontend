export default function useCurrentPage() {
  const path = window.location.pathname;

  if (path === "/") {
    return "chatbot";
  } else if (path === "/knowledge") {
    return "knowledge";
  } else {
    return "unknown";
  }
}
