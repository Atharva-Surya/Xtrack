import { ArrowUpRight, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import DiscoverPage from './pages/DiscoverPage.jsx';
import { AppDataProvider } from './state/AppDataProvider.jsx';
import './App.css';

function XtrackApp() {
  const [activePage, setActivePage] = useState('discover');

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#discover" onClick={() => setActivePage('discover')} aria-label="Xtrack home">
          <span className="wordmark-symbol">X</span><span>TRACK</span><i />
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={`nav-item${activePage === 'discover' ? ' is-active' : ''}`} type="button" onClick={() => setActivePage('discover')}>Discover</button>
        </nav>
        <div className="topbar-right">
          <span className="city-status"><i /> Your next plan starts here</span>
          <a className="help-link" href="https://www.ticketmaster.com/" target="_blank" rel="noreferrer" aria-label="Ticketmaster"><CircleHelp size={17} /></a>
        </div>
      </header>
      {activePage === 'discover' && <DiscoverPage />}
      <footer className="app-footer"><span>GOOD PLANS, MADE TOGETHER.</span><a href="https://www.ticketmaster.com/" target="_blank" rel="noreferrer">Event listings by Ticketmaster <ArrowUpRight size={13} /></a></footer>
    </div>
  );
}

export default function App() {
  return <AppDataProvider><XtrackApp /></AppDataProvider>;
}