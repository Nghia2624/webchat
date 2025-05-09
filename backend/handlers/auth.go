package handlers

import (
	"log"
	"net/http"
	"strings"

	"webchat/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService *services.UserService
	authService *services.AuthService
}

func NewAuthHandler(userService *services.UserService, authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		authService: authService,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	user, err := h.userService.CreateUser(req.Email, req.Password, req.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tokens, err := h.authService.GenerateTokenPair(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tạo token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":   user.ToResponse(),
		"tokens": tokens,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Login error - Invalid data: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ", "details": err.Error()})
		return
	}

	log.Printf("Login attempt with email: %s", req.Email)

	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("Login error - User not found: %s, error: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không đúng"})
		return
	}

	if err := h.authService.ComparePasswords(user.Password, req.Password); err != nil {
		log.Printf("Login error - Invalid password for user: %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không đúng"})
		return
	}

	tokens, err := h.authService.GenerateTokenPair(user.ID)
	if err != nil {
		log.Printf("Login error - Failed to generate tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tạo token", "details": err.Error()})
		return
	}

	log.Printf("Login successful for user: %s, ID: %s", user.Email, user.ID.Hex())

	c.JSON(http.StatusOK, gin.H{
		"user":   user.ToResponse(),
		"tokens": tokens,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không được cung cấp"})
		return
	}

	parts := strings.Split(auth, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ"})
		return
	}

	tokens, err := h.authService.RefreshTokens(parts[1])
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ hoặc đã hết hạn"})
		return
	}

	c.JSON(http.StatusOK, tokens)
}
