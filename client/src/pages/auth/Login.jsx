import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const redirectPath = result.user.role === 'farmer' 
        ? '/farmer/dashboard' 
        : '/authority/dashboard';
      navigate(redirectPath);
    } else {
      setError(result.message || t('auth.loginError'));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Toggle - Top Right */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 px-4 py-2 rounded-md text-sm font-medium bg-white shadow-md hover:shadow-lg transition-all"
      >
        {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
      </button>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <span className="text-6xl">🌾</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input mt-1"
                value={formData.email}
                onChange={handleChange}
                placeholder="farmer@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input mt-1"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('common.login')}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Farmer: farmer@demo.com / password123</p>
          <p>Authority: admin@demo.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
