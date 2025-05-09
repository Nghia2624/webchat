package handlers

import (
	"fmt"
	"net/http"
	"time"

	"webchat/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatHandler struct {
	chatService *services.ChatService
	userService *services.UserService
}

func NewChatHandler(chatService *services.ChatService, userService *services.UserService) *ChatHandler {
	return &ChatHandler{
		chatService: chatService,
		userService: userService,
	}
}

type CreatePersonalConversationRequest struct {
	UserID primitive.ObjectID `json:"user_id" binding:"required"`
}

type CreateGroupConversationRequest struct {
	Name         string               `json:"name" binding:"required"`
	Image        string               `json:"image"`
	Participants []primitive.ObjectID `json:"participants" binding:"required"`
}

type SendMessageRequest struct {
	Content string `json:"content" binding:"required"`
}

type GetMessagesRequest struct {
	Before string `form:"before"`
	Limit  int64  `form:"limit,default=50"`
}

func (h *ChatHandler) CreatePersonalConversation(c *gin.Context) {
	var req CreatePersonalConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	userID := c.MustGet("userID").(primitive.ObjectID)

	// Kiểm tra người dùng tồn tại
	_, err := h.userService.GetUserByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	conv, err := h.chatService.CreatePersonalConversation(userID, req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, conv)
}

func (h *ChatHandler) CreateGroupConversation(c *gin.Context) {
	var req CreateGroupConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	userID := c.MustGet("userID").(primitive.ObjectID)

	conv, err := h.chatService.CreateGroupConversation(req.Name, req.Image, userID, req.Participants)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, conv)
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	userID := c.MustGet("userID").(primitive.ObjectID)
	convID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID cuộc hội thoại không hợp lệ"})
		return
	}

	msg, err := h.chatService.SendMessage(userID, convID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, msg)
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	var req GetMessagesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	convID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID cuộc hội thoại không hợp lệ"})
		return
	}

	before := time.Now()
	if req.Before != "" {
		before, err = time.Parse(time.RFC3339, req.Before)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thời gian không hợp lệ"})
			return
		}
	}

	messages, err := h.chatService.GetMessages(convID, req.Limit, before)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func (h *ChatHandler) MarkMessageAsRead(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)
	msgID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tin nhắn không hợp lệ"})
		return
	}

	err = h.chatService.MarkMessageAsRead(msgID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// BatchMarkMessagesAsRead đánh dấu nhiều tin nhắn là đã đọc
func (h *ChatHandler) BatchMarkMessagesAsRead(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)

	var req struct {
		MessageIDs []string `json:"message_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	// Chuyển đổi các IDs từ string sang ObjectID
	messageIDs := make([]primitive.ObjectID, 0, len(req.MessageIDs))
	for _, idStr := range req.MessageIDs {
		msgID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID tin nhắn không hợp lệ"})
			return
		}
		messageIDs = append(messageIDs, msgID)
	}

	// Gọi service để đánh dấu hàng loạt
	err := h.chatService.BatchMarkMessagesAsRead(messageIDs, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// GetConversations lấy danh sách cuộc hội thoại của người dùng
func (h *ChatHandler) GetConversations(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)

	// Mặc định lấy 20 cuộc hội thoại gần nhất
	limit := 20
	if limitParam := c.Query("limit"); limitParam != "" {
		// Nếu có tham số limit, convert sang số nguyên
		_, err := fmt.Sscanf(limitParam, "%d", &limit)
		if err != nil || limit <= 0 {
			limit = 20
		}
		if limit > 50 {
			limit = 50 // Giới hạn tối đa 50 cuộc hội thoại
		}
	}

	conversations, err := h.chatService.GetConversations(userID, int64(limit))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, conversations)
}
