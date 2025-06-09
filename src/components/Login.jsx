import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <h1 className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text drop-shadow-md">
            VB Abundance CRM App
          </h1>
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
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white shadow-sm rounded-md transition-all duration-300 mx-0.5 ${role === 'employee' ? 'translate-x-0' : 'translate-x-[calc(100%-2px)]'}`}
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 hover:scale-105 active:scale-95"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
