import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import Spinner from '../common/Spinner';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [focused, setFocused] = useState({
    email: false,
    password: false,
  });
  const [validation, setValidation] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (name === 'email') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, email: 'Email is required' }));
      } else if (!validateEmail(value)) {
        setValidation(prev => ({ ...prev, email: 'Invalid email format' }));
      } else {
        setValidation(prev => ({ ...prev, email: '' }));
      }
    }

    if (name === 'password') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, password: 'Password is required' }));
      } else if (value.length < 6) {
        setValidation(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      } else {
        setValidation(prev => ({ ...prev, password: '' }));
      }
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setFocused(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFocused(prev => ({
      ...prev,
      [name]: !!value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) dispatch(clearError());

    // Validate before submitting
    let isValid = true;
    const newValidation = { email: '', password: '' };

    if (!formData.email.trim()) {
      newValidation.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newValidation.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newValidation.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newValidation.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setValidation(newValidation);

    if (isValid) {
      await dispatch(login(formData));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`appearance-none block w-full px-3 py-2 border ${
              validation.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
          />
          {validation.email && (
            <p className="mt-1 text-sm text-red-600">{validation.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`appearance-none block w-full px-3 py-2 border ${
              validation.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
          />
          {validation.password && (
            <p className="mt-1 text-sm text-red-600">{validation.password}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          } transition-colors`}
        >
          {loading ? (
            <div className="flex items-center">
              <Spinner size="sm" color="light" className="mr-2" />
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;