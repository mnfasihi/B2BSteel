import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ConcreteRequestForm from './components/ConcreteRequestForm';
import SteelRequestForm from './components/SteelRequestForm';
import AdminPanel from './components/AdminPanel';  // ✅ import درست

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/concrete-request" element={<ConcreteRequestForm />} />
          <Route path="/steel-request" element={<SteelRequestForm />} />
          <Route path="/admin" element={<AdminPanel />} />  {/* ✅ Route جدید */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;