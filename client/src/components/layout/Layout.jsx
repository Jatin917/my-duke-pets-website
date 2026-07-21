import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TopAnnouncementBar from './TopAnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContactButtons from './FloatingContactButtons';
import BackToTop from './BackToTop';
import MobileQuickFooter from './MobileQuickFooter';
import CompareBar from '../pets/CompareBar';
import ClickEffects from '../effects/ClickEffects';
import DonatePrompt from '../donate/DonatePrompt';

const Layout = () => {
  const [topBarVisible, setTopBarVisible] = useState(true);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100%] overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <ClickEffects />

      <div className="fixed top-0 inset-x-0 z-50 flex flex-col">
        <TopAnnouncementBar onDismiss={() => setTopBarVisible(false)} />
        <Navbar />
      </div>

      <main
        className={`flex-1 w-full min-w-0 transition-[padding] duration-300 ${
          topBarVisible ? 'pt-[92px] sm:pt-[108px]' : 'pt-[64px] sm:pt-[72px]'
        } pb-24 sm:pb-0`}
      >
        <Outlet />
      </main>
      <Footer />
      <FloatingContactButtons />
      <BackToTop />
      <MobileQuickFooter />
      <CompareBar />
      <DonatePrompt />
    </div>
  );
};

export default Layout;
