package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	jwtSecret     []byte
	accessExpiry  time.Duration
	refreshExpiry time.Duration
	userService   *UserService // Sẽ được set sau khi khởi tạo để tránh circular dependency
}

type TokenClaims struct {
	UserID primitive.ObjectID `json:"user_id"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // Thời gian hết hạn của access token (seconds)
}

func NewAuthService(jwtSecret string) *AuthService {
	return &AuthService{
		jwtSecret:     []byte(jwtSecret),
		accessExpiry:  24 * time.Hour,      // 24 giờ cho access token
		refreshExpiry: 30 * 24 * time.Hour, // 30 ngày cho refresh token
	}
}

// SetUserService thiết lập userService sau khi khởi tạo để tránh circular dependency
func (s *AuthService) SetUserService(userService *UserService) {
	s.userService = userService
}

func (s *AuthService) HashPassword(password string) (string, error) {
	if len(password) < 6 {
		return "", errors.New("mật khẩu phải có ít nhất 6 ký tự")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return "", errors.New("không thể mã hóa mật khẩu")
	}
	return string(hash), nil
}

func (s *AuthService) ComparePasswords(hashedPassword, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return errors.New("mật khẩu không chính xác")
		}
		log.Printf("Error comparing passwords: %v", err)
		return errors.New("lỗi xác thực mật khẩu")
	}
	return nil
}

func (s *AuthService) GenerateTokenPair(userID primitive.ObjectID) (*TokenPair, error) {
	// Kiểm tra userID hợp lệ
	if userID.IsZero() {
		return nil, errors.New("userID không hợp lệ")
	}

	now := time.Now()
	expiryTime := now.Add(s.accessExpiry)

	// Generate access token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, TokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiryTime),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   userID.Hex(),
		},
	})

	accessTokenString, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		log.Printf("Error signing access token: %v", err)
		return nil, errors.New("không thể tạo token")
	}

	// Generate refresh token
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, TokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   userID.Hex(),
		},
	})

	refreshTokenString, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		log.Printf("Error signing refresh token: %v", err)
		return nil, errors.New("không thể tạo token")
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    int64(s.accessExpiry.Seconds()),
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*TokenClaims, error) {
	if tokenString == "" {
		return nil, errors.New("token trống")
	}

	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("phương thức ký không hợp lệ: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		// Ghi log lỗi chi tiết
		log.Printf("Token validation error: %v", err)
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, errors.New("token is expired")
		}
		return nil, errors.New("token không hợp lệ")
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token không hợp lệ")
}

func (s *AuthService) RefreshTokens(refreshToken string) (*TokenPair, error) {
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Kiểm tra người dùng vẫn tồn tại trước khi cấp token mới
	if s.userService != nil {
		_, err = s.userService.GetUserByID(claims.UserID)
		if err != nil {
			log.Printf("User not found during token refresh: %v", err)
			return nil, errors.New("người dùng không tồn tại")
		}
	}

	return s.GenerateTokenPair(claims.UserID)
}

// GetUserFromToken trả về thông tin người dùng từ token
func (s *AuthService) GetUserFromToken(token string) (*TokenClaims, error) {
	return s.ValidateToken(token)
}

// GetUserIDFromToken trích xuất userID từ token
func (s *AuthService) GetUserIDFromToken(token string) (primitive.ObjectID, error) {
	claims, err := s.ValidateToken(token)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return claims.UserID, nil
}
