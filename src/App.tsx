import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileSidebar from '@/components/layout/MobileSidebar';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/ui/PageTransition';
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/research" element={<PageTransition><Research /></PageTransition>} />
            <Route path="/secure-browse" element={<PageTransition><SecureBrowse /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}