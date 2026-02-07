import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { isLoggedIn as getIsLoggedIn, getUser } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
  isLoggedIn?: boolean;
  userName?: string;
  hideChat?: boolean;
}

export function Layout({ children, isLoggedIn: isLoggedInProp, userName: userNameProp, hideChat = false }: LayoutProps) {
  const storedAuth = getIsLoggedIn();
  const storedUser = getUser();
  const isLoggedIn = isLoggedInProp ?? storedAuth;
  const userName = userNameProp ?? storedUser?.email?.split('@')[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main className="flex-1">{children}</main>
      <Footer />
      {!hideChat && <ChatWidget />}
    </div>
  );
}
