import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Header from '@/components/layout/Header';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Research from '@/pages/Research';
import SecureBrowse from '@/pages/SecureBrowse';
import Privacy from '@/pages/Privacy';
import Settings from '@/pages/Settings';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/auth';
import { historyService } from '@/services/history';

const TITLES: Record<string, string> = {
  '/': 'Workspace',
  '/search': 'Search',
  '/secure-browse': 'Secure Browse',
  '/research': 'Research',
  '/privacy': 'Privacy Center',
  '/settings': 'Settings',
};

export default function App() {
  const setUser = useAppStore((s) => s.setUser);
  const setConversations = useAppStore((s) => s.setConversations);
  const conversations = useAppStore((s) => s.conversations);
  const settings = useAppStore((s) => s.settings);
  const location = useLocation();

  useEffect(() => {
    authService.continueAsGuest().then(setUser);
    historyService.list().then(setConversations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings.conversationStorage === 'local') {
      historyService.save(conversations);
    }
  }, [conversations, settings.conversationStorage]);

  const title = TITLES[location.pathname] ?? 'Workspace';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-void-950">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/research" element={<Research />} />
          <Route path="/secure-browse" element={<SecureBrowse />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}