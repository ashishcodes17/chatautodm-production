// Server component (metadata here)
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ChatAutoDM vs Manychat — Free Instagram DM Automation Tool',
  description:
    'Compare ChatAutoDM with Manychat — a free Instagram DM automation tool for creators and businesses. Automate comments-to-DM, story replies, and lead collection effortlessly. Start growing your audience today!',
  generator: 'Team ChatAutoDM',
};

export default function ManychatLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
