package middleware

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"webchat/services"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type AuthMiddleware struct {
	authService *services.AuthService
	limiter     *rate.Limiter
}

func NewAuthMiddleware(authService *services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
		limiter:     rate.NewLimiter(rate.Every(time.Second/50), 50), // Tăng lên 50 requests per second với burst 50
	}
}

// RateLimit giới hạn số lượng yêu cầu API
func (m *AuthMiddleware) RateLimit() gin.HandlerFunc {
	// Tạo map để theo dõi giới hạn cho mỗi IP
	limiters := make(map[string]*rate.Limiter)
	mu := &sync.Mutex{}

	return func(c *gin.Context) {
		// Bỏ qua rate limit cho các route kiểm tra sức khỏe API và static assets
		if c.Request.URL.Path == "/health" ||
			c.Request.URL.Path == "/api/health" ||
			strings.HasPrefix(c.Request.URL.Path, "/static/") {
			c.Next()
			return
		}

		// Lấy địa chỉ IP của client
		clientIP := c.ClientIP()

		// Lấy hoặc tạo limiter cho IP này
		mu.Lock()
		limiter, exists := limiters[clientIP]
		if !exists {
			// Tạo limiter mới cho IP này, cho phép 30 request/giây với burst là 60
			limiter = rate.NewLimiter(rate.Every(time.Second/30), 60)
			limiters[clientIP] = limiter

			// Dọn dẹp map nếu quá lớn (tránh memory leak)
			if len(limiters) > 10000 {
				// Xóa một số entry ngẫu nhiên
				for ip := range limiters {
					delete(limiters, ip)
					if len(limiters) <= 5000 {
						break
					}
				}
			}
		}
		mu.Unlock()

		if !limiter.Allow() {
			log.Printf("Rate limit exceeded for IP: %s, URL: %s", clientIP, c.Request.URL.Path)
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Quá nhiều yêu cầu, vui lòng thử lại sau vài giây",
				"code":        "RATE_LIMIT_EXCEEDED",
				"retry_after": 2, // Đề xuất client thử lại sau 2 giây
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireAuth yêu cầu xác thực cho API endpoints
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			log.Printf("Missing Authorization header for path: %s", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Vui lòng đăng nhập để tiếp tục",
				"code":  "AUTHENTICATION_REQUIRED",
			})
			c.Abort()
			return
		}

		parts := strings.Split(auth, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("Invalid Authorization format for path: %s", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token không hợp lệ",
				"code":  "INVALID_TOKEN_FORMAT",
			})
			c.Abort()
			return
		}

		claims, err := m.authService.ValidateToken(parts[1])
		if err != nil {
			log.Printf("Token validation failed: %v for path: %s", err, c.Request.URL.Path)

			if strings.Contains(err.Error(), "token is expired") {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
					"code":  "TOKEN_EXPIRED",
				})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Token không hợp lệ hoặc đã hết hạn",
					"code":  "INVALID_TOKEN",
				})
			}

			c.Abort()
			return
		}

		// Lưu ID người dùng vào context để các handler có thể sử dụng
		c.Set("userID", claims.UserID)
		c.Next()
	}
}

// WebSocketAuth xử lý xác thực cho WebSocket connections
// Lấy token từ query parameters thay vì headers
func (m *AuthMiddleware) WebSocketAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			log.Printf("Missing token for WebSocket connection from IP: %s", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token không được cung cấp",
				"code":  "MISSING_TOKEN",
			})
			c.Abort()
			return
		}

		claims, err := m.authService.ValidateToken(token)
		if err != nil {
			log.Printf("WebSocket token validation failed: %v from IP: %s", err, c.ClientIP())

			if strings.Contains(err.Error(), "token is expired") {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
					"code":  "TOKEN_EXPIRED",
				})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Token không hợp lệ hoặc đã hết hạn",
					"code":  "INVALID_TOKEN",
				})
			}

			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

// ErrorHandler xử lý tất cả lỗi chung của API
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Nếu có lỗi được set trong context
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("API Error: %v, Path: %s", e.Err, c.Request.URL.Path)
			}

			// Nếu response đã được gửi, không làm gì cả
			if c.Writer.Written() {
				return
			}

			// Gửi response lỗi mặc định
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Đã xảy ra lỗi, vui lòng thử lại sau",
				"code":  "INTERNAL_SERVER_ERROR",
			})
		}
	}
}
