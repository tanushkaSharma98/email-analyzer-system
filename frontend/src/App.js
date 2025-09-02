import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EmailProvider } from './contexts/EmailContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EmailDetails from './pages/EmailDetails';

function App() {
  return (
    <EmailProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/email/:id" element={<EmailDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </EmailProvider>
  );
}

export default App;
