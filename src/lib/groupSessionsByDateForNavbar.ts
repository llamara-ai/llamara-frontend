import { Session } from '@/api';
import { NavMainGroup, SingleNavItem } from '@/views/sidebar/SidebarSessionList';
import { subDays, isAfter, parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';


export function groupSessionsByDateForNavbar(sessions: Session[]): NavMainGroup[] {
  const { t } = useTranslation();
  const now = new Date();
  const last7Days = subDays(now, 7);
  const last30Days = subDays(now, 30);

  const last7DaysLabel = t("chatbot.sidebar.recent7days");
  const last30DaysLabel = t("chatbot.sidebar.recent30days");

  const groups: Record<string, SingleNavItem[]> = {};
  groups[last7DaysLabel] = [];
  groups[last30DaysLabel] = [];


  sessions.forEach(session => {
    if (session.createdAt) {
      const createdAt = parseISO(session.createdAt);
      const sessionItem : SingleNavItem = {
        title: session.label ?? formatDate(session.createdAt),
        uid: session.id ?? ''
      }
      if (isAfter(createdAt, last7Days)) {
        groups[last7DaysLabel].push(sessionItem);
      } else if (isAfter(createdAt, last30Days)) {
        groups[last30DaysLabel].push(sessionItem);
      } else {
        const year = createdAt.getFullYear().toString();
        const name = t("chatbot.sidebar.recentYear") + " " + year;
        if (!groups[name]) {
          groups[name] = [];
        }
        groups[name].push(sessionItem);
      }
    }
  });

  if (groups[last7DaysLabel].length === 0) {
    groups[last7DaysLabel] = [{ title: t("chatbot.sidebar.noSessions"), uid: '' }];
  }
  if (groups[last30DaysLabel].length === 0) {
    groups[last30DaysLabel] = [{ title: t("chatbot.sidebar.noSessions"), uid: '' }];
  }


  const groupedSessions: NavMainGroup[] = [];

  Object.entries(groups)
    .sort(([a], [b]) => { // Sort by year, with the newest year first
      const yearA = parseInt(a.split(' ').pop() ?? '0', 10);
      const yearB = parseInt(b.split(' ').pop() ?? '0', 10);
      return yearB - yearA;
    })
    .forEach(([title, items]) => {
      groupedSessions.push({
        title,
        items
      });
    });

  return groupedSessions;
}


export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'dd.MM.yyyy HH:mm');
}