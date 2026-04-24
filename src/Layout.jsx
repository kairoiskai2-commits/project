import React from 'react';
import { LanguageProvider } from './components/LanguageContext';
import Header from './components/Header';
import AIPopup from './components/AIPopup';
import AnnouncementBanner from './components/AnnouncementBanner';
import Footer from './components/Footer';

export default function Layout({ children }) {
  return (
    <LanguageProvider>
      <div className="app-shell bg-background text-foreground">

        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 starfield" />
          <div className="absolute inset-x-0 top-0 h-72"
            style={{ background: 'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(240,192,96,0.14), transparent 50%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-64"
            style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(168,85,247,0.08), transparent 45%)' }} />
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(240,192,96,0.12), transparent)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-18"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(240,192,96,0.35) 30%, #f0c060 50%, rgba(240,192,96,0.35) 70%, transparent)' }} />
        </div>

        <Header />

        <main className="app-content">
          <div className="page-wrapper">
            {children}
          </div>
        </main>

        <AnnouncementBanner />
        <AIPopup />
        <Footer />
      </div>
    </LanguageProvider>
  );
}