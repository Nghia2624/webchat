package handlers

import (
	"log"
	"net/http"

	"webchat/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

type UpdateProfileRequest struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

// GetProfile lấy thông tin cá nhân của người dùng
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)

	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		log.Printf("Error getting user profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Không thể lấy thông tin người dùng",
			"code":  "USER_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, user.ToResponse())
}

// UpdateProfile cập nhật thông tin cá nhân của người dùng
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding update profile request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Dữ liệu không hợp lệ",
			"code":  "INVALID_REQUEST",
		})
		return
	}

	// Nếu tên không được cung cấp hoặc rỗng, lấy tên hiện tại
	name := req.Name
	if name == "" {
		user, err := h.userService.GetUserByID(userID)
		if err != nil {
			log.Printf("Error getting user for profile update: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Không thể lấy thông tin người dùng",
				"code":  "USER_NOT_FOUND",
			})
			return
		}
		name = user.Name
	}

	updatedUser, err := h.userService.UpdateUser(userID, name, req.Avatar)
	if err != nil {
		log.Printf("Error updating user profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Không thể cập nhật thông tin người dùng",
			"code":  "UPDATE_FAILED",
		})
		return
	}

	c.JSON(http.StatusOK, updatedUser.ToResponse())
}
