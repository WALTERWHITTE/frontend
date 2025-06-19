import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import TemplateDashboard from './components/TemplateDashboard';
import LogDashboard from './components/LogDashboard';
import FamilyDashboard from './components/FamilyDashboard';
import Login from './components/Login';
import { DarkModeProvider } from './context/DarkModeContext'; 
import SendMailDashboard from './components/SendMailDashboard';
import './utils/jwtInterceptor';
import ClientProductsPage from './components/ClientProductsPage';

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clients" element={<ClientDashboard />} />
          <Route path="/family" element={<FamilyDashboard />} />
          <Route path="/clientproducts" element={<ClientProductsPage />} />
          <Route path="/sendmail" element={<SendMailDashboard/>} />
          <Route path="/templates" element={<TemplateDashboard />} />
          <Route path="/logs" element={<LogDashboard />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
