import React from 'react';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ghi log lỗi vào console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Có thể gửi lỗi về server để tracking
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
    
    // Hiển thị thông báo lỗi
    toast.error('Đã xảy ra lỗi. Ứng dụng sẽ khởi động lại component.');
  }

  // Hàm này sẽ gửi lỗi về server (trong môi trường thực tế)
  logErrorToService(error, errorInfo) {
    // Mocked implementation - trong thực tế sẽ gọi API endpoint để log lỗi
    console.log('Logging error to service:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Hàm reset lỗi để thử lại
  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { fallback, children } = this.props;

    // Nếu có lỗi và số lần lỗi nhỏ hơn 3, hiển thị UI lỗi có nút retry
    if (hasError) {
      // Sử dụng fallback component nếu được cung cấp
      if (fallback) {
        return fallback({ error, resetError: this.resetError });
      }

      // Hiển thị UI lỗi mặc định nếu không có fallback
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-4">Đã có lỗi xảy ra khi tải thành phần này.</p>
          
          {/* Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển) */}
          {process.env.NODE_ENV !== 'production' && (
            <details className="mb-4 text-left bg-white p-3 rounded border border-red-100">
              <summary className="cursor-pointer font-medium text-red-600 mb-2">Chi tiết lỗi</summary>
              <p className="text-red-800 font-mono text-sm whitespace-pre-wrap mb-2">{error?.toString()}</p>
              {errorInfo && (
                <pre className="text-gray-700 overflow-auto text-xs p-2 bg-gray-50 rounded">
                  {errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
          
          {/* Nút thử lại */}
          <div className="mt-4">
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    // Không có lỗi, render children bình thường
    return children;
  }
}

export default ErrorBoundary; 