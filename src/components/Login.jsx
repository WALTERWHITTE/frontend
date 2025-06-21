import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!username || !password) {
    setError('Please enter both username and password');
    return;
  }

  try {
    const endpoint = isRegisterMode ? '/register' : '/login';
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error('Invalid response format');
    }

    if (!response.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    if (isRegisterMode) {
      setSuccess('Registration successful. You can now log in.');
      setIsRegisterMode(false);
      return;
    }

    const { token, userId, username: loggedInUsername } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', loggedInUsername);

    navigate('/logs');
  } catch (err) {
    console.error('Auth error:', err);
    setError(err.message || 'Something went wrong. Please try again.');
  }
};


  return (
    <div className="flex overflow-hidden justify-center items-center min-h-screen bg-gray-100">
      <div className="relative flex w-full max-w-4xl h-[480px]">
        {/* Welcome Card */}
        <div className={`absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-amber-950 to-amber-800 rounded-l-2xl shadow-2xl transition-all duration-700 ease-in-out transform ${
          isRegisterMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
        }`}>
          <div className="flex flex-col justify-center items-center p-8 h-full text-white">
            <div className="text-center">
              <div className="mb-6">
                <img src="/logo192.png" alt="Logo" className="mx-auto mb-4 w-40 h-40" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-yellow-400">
                {isRegisterMode ? 'Welcome!' : 'Welcome Back!'}
              </h2>
              <p className="text-lg leading-relaxed text-amber-200">
                {isRegisterMode 
                  ? 'Join our team and start your journey with VB Abundance UMP App. Create your account to get started.'
                  : 'We\'re glad to see you again. Sign in to continue your journey with VB Abundance UMP App.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Login/Register Card */}
        <div className={`absolute left-0 top-0 w-1/2 h-full bg-white shadow-2xl ring-1 ring-gray-200 transition-all duration-700 ease-in-out transform ${isRegisterMode ? 'rounded-r-2xl' : 'rounded-2xl'} ${
          isRegisterMode ? 'translate-x-full' : 'translate-x-1/2'
        }`}>
          <div className="flex flex-col justify-center p-8 h-full">
            <h1 className="mb-6 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-500 drop-shadow-md">
              VB Abundance UMP App
            </h1>

            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">{success}</div>}

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
                  className="px-3 py-2 w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3 py-2 w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-500 transition-colors duration-200 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-3 w-full font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md transition-all duration-300 transform hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 hover:scale-105 active:scale-95"
              >
                {isRegisterMode ? 'Register' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-600">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setIsRegisterMode(!isRegisterMode);
                }}
                className="ml-1 font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline"
              >
                {isRegisterMode ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;