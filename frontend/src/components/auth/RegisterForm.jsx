import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [focused, setFocused] = useState({
    email: false,
    password: false,
    name: false,
    confirmPassword: false
  });
  const [validation, setValidation] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
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

    // Validation thời gian thực
    if (name === 'email') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, email: 'Email không được để trống' }));
      } else if (!validateEmail(value)) {
        setValidation(prev => ({ ...prev, email: 'Email không hợp lệ' }));
      } else {
        setValidation(prev => ({ ...prev, email: '' }));
      }
    }

    if (name === 'password') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, password: 'Mật khẩu không được để trống' }));
      } else if (value.length < 6) {
        setValidation(prev => ({ ...prev, password: 'Mật khẩu phải có ít nhất 6 ký tự' }));
      } else {
        setValidation(prev => ({ ...prev, password: '' }));
      }
      
      // Kiểm tra lại confirm password nếu đã nhập
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setValidation(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
        } else {
          setValidation(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    }

    if (name === 'name') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, name: 'Tên không được để trống' }));
      } else if (value.length < 2) {
        setValidation(prev => ({ ...prev, name: 'Tên phải có ít nhất 2 ký tự' }));
      } else {
        setValidation(prev => ({ ...prev, name: '' }));
      }
    }

    if (name === 'confirmPassword') {
      if (!value.trim()) {
        setValidation(prev => ({ ...prev, confirmPassword: 'Vui lòng xác nhận mật khẩu' }));
      } else if (value !== formData.password) {
        setValidation(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
      } else {
        setValidation(prev => ({ ...prev, confirmPassword: '' }));
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

    // Kiểm tra validation trước khi submit
    let isValid = true;
    const newValidation = { email: '', password: '', name: '', confirmPassword: '' };

    if (!formData.name.trim()) {
      newValidation.name = 'Tên không được để trống';
      isValid = false;
    } else if (formData.name.length < 2) {
      newValidation.name = 'Tên phải có ít nhất 2 ký tự';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newValidation.email = 'Email không được để trống';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newValidation.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newValidation.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (formData.password.length < 6) {
      newValidation.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      newValidation.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newValidation.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setValidation(newValidation);

    if (isValid) {
      // Loại bỏ confirmPassword trước khi gửi dữ liệu
      const { confirmPassword, ...registerData } = formData;
      await dispatch(register(registerData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl transform transition-all hover:scale-[1.01]">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              đăng nhập với tài khoản đã có
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm transition-all duration-300 animate-pulse">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-5">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  validation.name || error ? 'border-red-300' : focused.name ? 'border-blue-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:text-sm transition-all duration-300`}
                placeholder=" "
              />
              <label 
                htmlFor="name" 
                className={`absolute left-3 transition-all duration-300 ${
                  focused.name 
                    ? '-top-2 text-xs text-blue-600 bg-white px-1 z-10' 
                    : 'top-3 text-gray-500'
                }`}
              >
                Họ tên
              </label>
              {validation.name && (
                <p className="mt-1 text-xs text-red-500">{validation.name}</p>
              )}
            </div>
            
            <div className="relative">
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
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  validation.email || error ? 'border-red-300' : focused.email ? 'border-blue-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:text-sm transition-all duration-300`}
                placeholder=" "
              />
              <label 
                htmlFor="email" 
                className={`absolute left-3 transition-all duration-300 ${
                  focused.email 
                    ? '-top-2 text-xs text-blue-600 bg-white px-1 z-10' 
                    : 'top-3 text-gray-500'
                }`}
              >
                Email
              </label>
              {validation.email && (
                <p className="mt-1 text-xs text-red-500">{validation.email}</p>
              )}
            </div>
            
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  validation.password || error ? 'border-red-300' : focused.password ? 'border-blue-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:text-sm transition-all duration-300`}
                placeholder=" "
              />
              <label 
                htmlFor="password" 
                className={`absolute left-3 transition-all duration-300 ${
                  focused.password 
                    ? '-top-2 text-xs text-blue-600 bg-white px-1 z-10' 
                    : 'top-3 text-gray-500'
                }`}
              >
                Mật khẩu
              </label>
              {validation.password && (
                <p className="mt-1 text-xs text-red-500">{validation.password}</p>
              )}
            </div>
            
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  validation.confirmPassword || error ? 'border-red-300' : focused.confirmPassword ? 'border-blue-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:text-sm transition-all duration-300`}
                placeholder=" "
              />
              <label 
                htmlFor="confirmPassword" 
                className={`absolute left-3 transition-all duration-300 ${
                  focused.confirmPassword 
                    ? '-top-2 text-xs text-blue-600 bg-white px-1 z-10' 
                    : 'top-3 text-gray-500'
                }`}
              >
                Xác nhận mật khẩu
              </label>
              {validation.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{validation.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[1px]`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg 
                  className={`h-5 w-5 ${loading ? 'text-blue-300' : 'text-blue-500 group-hover:text-blue-400'} transition-colors duration-300`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;