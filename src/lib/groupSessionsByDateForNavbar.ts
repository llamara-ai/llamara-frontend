import { Session } from "@/api";
import {
  SidebarSessionsGroup,
  SessionSidebarItem,
} from "@/views/overlays/sidebar/SidebarSessionList";
import { subDays, isAfter, parseISO, format } from "date-fns";

interface Item {
  title: string;
  uid: string;
  timestamp: string;
  formattedTimestamp: string;
  isNotAvailableMessage: boolean;
}

interface GroupSessionsByDateForNavbarProps {
  sessions: Session[];
  last7DaysLabel: string;
  last30DaysLabel: string;
  recentYearLabel: string;
  noSessionsLabel: string;
}

export function groupSessionsByDateForNavbar({
  sessions,
  last7DaysLabel,
  last30DaysLabel,
  recentYearLabel,
  noSessionsLabel,
}: GroupSessionsByDateForNavbarProps): SidebarSessionsGroup[] {
  const now = new Date();
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);

  const groups: Record<string, Item[]> = {};
  groups[last7DaysLabel] = [];
  groups[last30DaysLabel] = [];

  sessions.forEach((session) => {
    if (session.createdAt) {
      const createdAt = parseISO(session.createdAt);
      const sessionItem: Item = {
        title: session.label ?? formatDate(session.createdAt),
        uid: session.id ?? "",
        timestamp: session.createdAt,
        formattedTimestamp: formatDate(session.createdAt),
        isNotAvailableMessage: false,
      };
      if (isAfter(createdAt, last7Days)) {
        groups[last7DaysLabel].push(sessionItem);
      } else if (isAfter(createdAt, last30Days)) {
        groups[last30DaysLabel].push(sessionItem);
      } else {
        const year = createdAt.getFullYear().toString();
        const name = recentYearLabel + " " + year;
        groups[name].push(sessionItem);
      }
    }
  });

  if (groups[last7DaysLabel].length === 0) {
    groups[last7DaysLabel] = [
      {
        title: noSessionsLabel,
        uid: "",
        timestamp: "",
        formattedTimestamp: "",
        isNotAvailableMessage: true,
      },
    ];
  }
  if (groups[last30DaysLabel].length === 0) {
    groups[last30DaysLabel] = [
      {
        title: noSessionsLabel,
        uid: "",
        timestamp: "",
        formattedTimestamp: "",
        isNotAvailableMessage: true,
      },
    ];
  }

  const groupedSessions: SidebarSessionsGroup[] = [];

  Object.entries(groups)
    .sort(([a], [b]) => {
      // Sort by year, with the newest year first
      const yearA = parseInt(a.split(" ").pop() ?? "0", 10);
      const yearB = parseInt(b.split(" ").pop() ?? "0", 10);
      return yearB - yearA;
    })
    .forEach(([title, items]) => {
      // Sort items within each group
      items.sort((itemA, itemB) => {
        // Assuming items have a date property to sort by
        const dateA = new Date(itemA.timestamp);
        const dateB = new Date(itemB.timestamp);
        return dateB.getTime() - dateA.getTime(); // Newest first
      });

      groupedSessions.push({
        title,
        items,
      });
    });
  return groupedSessions;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "dd.MM.yyyy HH:mm");
}

export function convertSessionToSessionSidebarItem(
  session: Session,
): SessionSidebarItem | null {
  if (!session.createdAt) return null;
  return {
    title: session.label ?? formatDate(session.createdAt),
    uid: session.id ?? "",
    formattedTimestamp: formatDate(session.createdAt),
    isNotAvailableMessage: false,
  };
}
