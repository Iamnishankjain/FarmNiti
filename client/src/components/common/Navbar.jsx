import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, isFarmer, isAuthority } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const farmerLinks = [
    { path: '/farmer/dashboard', label: t('common.dashboard') },
    { path: '/farmer/missions', label: t('farmer.missions') },
    { path: '/farmer/weather', label: t('weather.title') },
    { path: '/farmer/ai-doctor', label: t('farmer.aiDoctor') },
    { path: '/farmer/social', label: t('farmer.social') },
    { path: '/farmer/leaderboard', label: t('farmer.leaderboard') },
    { path: '/farmer/rewards', label: t('farmer.rewards') }
  ];

  const authorityLinks = [
    { path: '/authority/dashboard', label: t('common.dashboard') },
    { path: '/authority/missions', label: t('authority.manageMissions') },
    { path: '/authority/users', label: t('authority.manageUsers') },
    { path: '/authority/analytics', label: t('authority.analytics') },
    { path: '/authority/rewards', label: t('authority.manageRewards') }
  ];

  const links = isFarmer ? farmerLinks : isAuthority ? authorityLinks : [];

  return (
    <nav className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isFarmer ? '/farmer/dashboard' : '/authority/dashboard'} className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold">FarmNiti</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary-700'
                      : 'hover:bg-primary-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-md text-sm font-medium bg-primary-700 hover:bg-primary-800 transition-colors"
            >
              {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>

            {isAuthenticated && (
              <>
                {/* Profile */}
                <Link
                  to={isFarmer ? '/farmer/profile' : '/authority/dashboard'}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm">{user?.name}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-primary-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-700'
                    : 'hover:bg-primary-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
