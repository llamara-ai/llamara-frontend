import { Knowledge } from "@/api";
import { formatDate } from "date-fns";

interface TableAccordionProps {
  knowledge: Knowledge;
}

export default function TableAccordion({
  knowledge,
}: Readonly<TableAccordionProps>) {
  if (!knowledge.createdAt || !knowledge.lastUpdatedAt) {
    return;
  }
  const createdAt = formatDate(knowledge.createdAt, "dd.MM yyyy HH:mm z");
  const updatedAt = formatDate(knowledge.lastUpdatedAt, "dd.MM yyyy HH:mm z");
  return (
    <div>
      <p>Created at: {createdAt}</p>
      <p>Last Updated: {updatedAt}</p>
      <p>Source: {knowledge.source}</p>
      <p>Tags: {knowledge.tags}</p>
    </div>
  );
}
