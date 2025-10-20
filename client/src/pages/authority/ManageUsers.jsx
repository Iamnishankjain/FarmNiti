import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const ManageUsers = () => {
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await userAPI.getAllFarmers();
      setFarmers(response.data.farmers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.village?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !filterState || farmer.state === filterState;
    return matchesSearch && matchesState;
  });

  const uniqueStates = [...new Set(farmers.map(f => f.state).filter(Boolean))];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('authority.manageUsers')}</h1>
        <p className="mt-2 text-gray-600">View and manage all registered farmers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-gray-600">Total Farmers</p>
          <p className="text-3xl font-bold text-blue-700">{farmers.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-3xl font-bold text-green-700">
            {farmers.filter(f => f.completedMissions?.length > 0).length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-gray-600">States Covered</p>
          <p className="text-3xl font-bold text-yellow-700">{uniqueStates.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-gray-600">Total XP Earned</p>
          <p className="text-3xl font-bold text-purple-700">
            {farmers.reduce((sum, f) => sum + (f.xp || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name, email, or village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div className="min-w-[200px]">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="input"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          {(searchTerm || filterState) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterState('');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Farmers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coins
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Missions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No farmers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                            {farmer.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{farmer.email}</div>
                      <div className="text-sm text-gray-500">{farmer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {farmer.village && farmer.district 
                          ? `${farmer.village}, ${farmer.district}`
                          : '-'
                        }
                      </div>
                      <div className="text-sm text-gray-500">{farmer.state || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="badge badge-secondary">
                        Lv {farmer.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-primary-700">
                      {farmer.xp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-green-700">
                      {farmer.greenCoins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {farmer.completedMissions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Showing {filteredFarmers.length} of {farmers.length} farmers
      </div>
    </div>
  );
};

export default ManageUsers;
