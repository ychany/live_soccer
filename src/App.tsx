import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { LiveMatches } from './pages/LiveMatches';
import { Schedule } from './pages/Schedule';
import { Leagues } from './pages/Leagues';
import { Standings } from './pages/Standings';
import { MatchDetail } from './pages/MatchDetail';
import { TeamDetail } from './pages/TeamDetail';
import { PlayerDetail } from './pages/PlayerDetail';
import { LeagueDetail } from './pages/LeagueDetail';
import { BottomNav } from './components/BottomNav';
import { ToastProvider } from './components/common';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveMatches />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/player/:id" element={<PlayerDetail />} />
          <Route path="/league/:id" element={<LeagueDetail />} />
        </Routes>
        <BottomNav />
        <ToastProvider />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
