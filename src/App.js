// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import TemplateDashboard from './components/TemplateDashboard';
import LogDashboard from './components/LogDashboard';
import FamilyDashboard from './components/FamilyDashboard';
import Login from './components/Login';
import ProductsPage from './components/ProductPage';
import { DarkModeProvider } from './context/DarkModeContext';
import SendMailDashboard from './components/SendMailDashboard';
import ClientProductsPage from './components/ClientProductsPage';
import { isTokenValid } from './utils/auth';

const AuthRedirector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoginPage = location.pathname === '/login';

    if (!isTokenValid() && !isLoginPage) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [location, navigate]);

  return null;
};

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <AuthRedirector />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clients" element={<ClientDashboard />} />
          <Route path="/family" element={<FamilyDashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/clientproducts" element={<ClientProductsPage />} />
          <Route path="/sendmail" element={<SendMailDashboard />} />
          <Route path="/templates" element={<TemplateDashboard />} />
          <Route path="/logs" element={<LogDashboard />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
