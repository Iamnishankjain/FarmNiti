import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'farmer',
    village: '',
    district: '',
    state: ''
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      const redirectPath = result.user.role === 'farmer' 
        ? '/farmer/dashboard' 
        : '/authority/dashboard';
      navigate(redirectPath);
    } else {
      setError(result.message || t('auth.registerError'));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 px-4 py-2 rounded-md text-sm font-medium bg-white shadow-md hover:shadow-lg transition-all"
      >
        {language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
      </button>

      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <span className="text-6xl">🌾</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.registerTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t('auth.loginHere')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('auth.fullName')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input mt-1"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

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
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input mt-1"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input mt-1"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                {t('auth.selectRole')}
              </label>
              <select
                id="role"
                name="role"
                required
                className="input mt-1"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="farmer">{t('auth.farmer')}</option>
                <option value="authority">{t('auth.authority')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="village" className="block text-sm font-medium text-gray-700">
                {t('auth.village')}
              </label>
              <input
                id="village"
                name="village"
                type="text"
                className="input mt-1"
                value={formData.village}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                {t('auth.district')}
              </label>
              <input
                id="district"
                name="district"
                type="text"
                className="input mt-1"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                {t('auth.state')}
              </label>
              <input
                id="state"
                name="state"
                type="text"
                className="input mt-1"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('common.register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
