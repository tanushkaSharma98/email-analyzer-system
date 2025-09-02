import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, BarChart3, Home } from 'lucide-react';
import { emailAPI } from '../services/api';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const [health, setHealth] = useState({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const res = await emailAPI.getHealth();
        if (mounted) setHealth(res);
      } catch (e) {
        if (mounted) setHealth({ status: 'down' });
      }
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const badge = (() => {
    if (health.status === 'loading') return { text: 'Checking…', cls: 'bg-gray-200 text-gray-700' };
    if (health.status === 'ok') return { text: 'Healthy', cls: 'bg-green-100 text-green-700' };
    if (health.status === 'degraded') return { text: 'Degraded', cls: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Down', cls: 'bg-red-100 text-red-700' };
  })();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Email Analyzer</span>
          </Link>

          {/* Navigation Links + Health */}
          <div className="flex items-center space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
              {badge.text}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
