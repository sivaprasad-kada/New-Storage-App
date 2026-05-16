import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ThemeProvider } from './context/ThemeContext';
import GitHubCallback from './pages/GitHubCallback';
// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Storage from './pages/Storage';
import SecureVault from './pages/SecureVault';
import Settings from './pages/Settings';
import Shared from './pages/Shared';
import MyFiles from './pages/MyFiles';
import SharedLink from './pages/SharedLink';
import Payment from './pages/Payment';
import LandingPage from './pages/Landing/LandingPage';

// Placeholder for missing components
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>Under Construction</p>
  </div>
);

import WarningBanner from './components/WarningBanner';

const AppLayout = ({ children }) => {
  return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <Header />
        <WarningBanner />
        <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            {/*   <Route path="/signin" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} /> */}
            <Route path="/user/github/callback" element={<GitHubCallback />} />
            <Route path="/s/:token" element={<SharedLink />} />
            {/* Protected Routes Wrapper */}
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/directory/:dirId" element={<Dashboard />} />
                  <Route path="/storage" element={<Storage />} />
                  <Route path="/vault" element={<SecureVault />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/shared" element={<Shared />} />
                  <Route path="/my-files" element={<MyFiles />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/search" element={<Placeholder title="Search" />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
