import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import Missions from './pages/farmer/Missions';
import MissionDetail from './pages/farmer/MissionDetail';
import AICropDoctor from './pages/farmer/AICropDoctor';
import SocialWall from './pages/farmer/SocialWall';
import Leaderboard from './pages/farmer/Leaderboard';
import RewardStore from './pages/farmer/RewardStore';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import ManageMissions from './pages/authority/ManageMissions';
import ManageUsers from './pages/authority/ManageUsers';
import Analytics from './pages/authority/Analytics';
import ManageRewards from './pages/authority/ManageRewards';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Farmer Routes */}
              <Route
                path="/farmer/dashboard"
                element={
                  <PrivateRoute role="farmer">
                    <FarmerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/missions"
                element={
                  <PrivateRoute role="farmer">
                    <Missions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/missions/:id"
                element={
                  <PrivateRoute role="farmer">
                    <MissionDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/ai-doctor"
                element={
                  <PrivateRoute role="farmer">
                    <AICropDoctor />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/social"
                element={
                  <PrivateRoute role="farmer">
                    <SocialWall />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/leaderboard"
                element={
                  <PrivateRoute role="farmer">
                    <Leaderboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/rewards"
                element={
                  <PrivateRoute role="farmer">
                    <RewardStore />
                  </PrivateRoute>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <PrivateRoute role="farmer">
                    <FarmerProfile />
                  </PrivateRoute>
                }
              />

              {/* Authority Routes */}
              <Route
                path="/authority/dashboard"
                element={
                  <PrivateRoute role="authority">
                    <AuthorityDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/authority/missions"
                element={
                  <PrivateRoute role="authority">
                    <ManageMissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/authority/users"
                element={
                  <PrivateRoute role="authority">
                    <ManageUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/authority/analytics"
                element={
                  <PrivateRoute role="authority">
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/authority/rewards"
                element={
                  <PrivateRoute role="authority">
                    <ManageRewards />
                  </PrivateRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
