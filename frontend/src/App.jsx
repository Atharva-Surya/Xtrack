import { ArrowUpRight, CircleHelp, TicketCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import ProfilePanel from './components/ProfilePanel.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';
import RsvpPage from './pages/RsvpPage.jsx';
import { AppDataProvider } from './state/AppDataProvider.jsx';
import { useAppData } from './state/useAppData.js';
import './App.css';

function XtrackApp() {
  const [activePage, setActivePage] = useState('discover');
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile, profileLoading, actionError, saveProfile } = useAppData();

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#discover" onClick={() => setActivePage('discover')} aria-label="Xtrack home">
          <span className="wordmark-symbol">X</span><span>TRACK</span><i />
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={`nav-item${activePage === 'discover' ? ' is-active' : ''}`} type="button" onClick={() => setActivePage('discover')}>Discover</button>
          <button className={`nav-item${activePage === 'going' ? ' is-active' : ''}`} type="button" onClick={() => setActivePage('going')}><TicketCheck size={14} /> Going</button>
        </nav>
        <div className="topbar-right">
          <span className="city-status"><i /> Your next plan starts here</span>
          <button className="profile-button" type="button" title="Profile" aria-label="Open profile" onClick={() => setProfileOpen(true)}><UserRound size={17} /></button>
          <a className="help-link" href="https://www.ticketmaster.com/" target="_blank" rel="noreferrer" aria-label="Ticketmaster"><CircleHelp size={17} /></a>
        </div>
      </header>
      {activePage === 'discover' && <DiscoverPage />}
      {activePage === 'going' && <RsvpPage />}
      <footer className="app-footer"><span>GOOD PLANS, MADE TOGETHER.</span><a href="https://www.ticketmaster.com/" target="_blank" rel="noreferrer">Event listings by Ticketmaster <ArrowUpRight size={13} /></a></footer>
      {profileOpen && <ProfilePanel profile={profile} profileLoading={profileLoading} error={actionError} onSave={saveProfile} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

export default function App() {
  return <AppDataProvider><XtrackApp /></AppDataProvider>;
}