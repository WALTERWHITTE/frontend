import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // In a real app, this would call an authentication API
    console.log('Login attempt:', { username, password, role });
    
    // Redirect to logs page after successful login
    navigate('/logs');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">VB Abundance CRM App</h1>
        <p className="mt-1 text-xs text-gray-500">
          <span className="float-right mr-4 italic">- developed by Sinister Six</span>
        </p>
        
        <div className="relative p-1 mt-6 mb-6 bg-gray-100 rounded-lg">
          <div className="flex">
            <button
              type="button"
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-all duration-300 ${role === 'employee' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('employee')}
            >
              Employee
            </button>
            <button
              type="button"
              className={`relative z-10 flex-1 py-2 text-sm font-medium transition-all duration-300 ${role === 'admin' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>
          <div
            className={`absolute top-1 bottom-1 left-1 right-1 w-1/2 bg-white shadow-sm rounded-md transition-all duration-300 transform ${role === 'employee' ? 'translate-x-0' : 'translate-x-full'}`}
          ></div>
        </div>
        
        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
