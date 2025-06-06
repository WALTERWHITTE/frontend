import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import Login from './components/Login';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logs" element={<ClientDashboard />} />
        <Route path="/clients" element={<ClientDashboard />} />
        <Route path="/client-details" element={<ClientDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
