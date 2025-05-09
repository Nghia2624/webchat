package handlers

import (
	"encoding/json"
	"log"
	"time"
	"webchat/types"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WebSocketHandler extends the basic functionality from types.WebSocketHandler
type WebSocketHandler struct {
	*types.WebSocketHandler
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		WebSocketHandler: types.NewWebSocketHandler(),
	}
}

// HandleConnection handles a new WebSocket connection
func (h *WebSocketHandler) HandleConnection(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)

	conn, err := h.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Lỗi khi upgrade connection: %v", err)
		return
	}

	h.Mutex.Lock()
	h.Clients[userID] = conn
	h.Mutex.Unlock()

	// Broadcast trạng thái online
	h.broadcastUserStatus(userID, true)

	// Khởi động heartbeat
	go h.handleHeartbeat(userID, conn)

	// Xử lý tin nhắn
	go h.handleMessages(userID, conn)
}

func (h *WebSocketHandler) handleHeartbeat(userID primitive.ObjectID, conn *websocket.Conn) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				h.handleDisconnect(userID)
				return
			}
		}
	}
}

func (h *WebSocketHandler) handleMessages(userID primitive.ObjectID, conn *websocket.Conn) {
	defer h.handleDisconnect(userID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Lỗi websocket: %v", err)
			}
			break
		}

		var wsMessage types.WebSocketMessage
		if err := json.Unmarshal(message, &wsMessage); err != nil {
			log.Printf("Lỗi parse message: %v", err)
			continue
		}

		switch wsMessage.Type {
		case types.EventTypeMessage:
			h.handleNewMessage(userID, wsMessage.Payload)
		case types.EventTypeTyping:
			h.handleTypingStatus(userID, wsMessage.Payload)
		case types.EventTypeRead:
			h.handleMessageRead(userID, wsMessage.Payload)
		}
	}
}

func (h *WebSocketHandler) handleDisconnect(userID primitive.ObjectID) {
	h.Mutex.Lock()
	if conn, ok := h.Clients[userID]; ok {
		conn.Close()
		delete(h.Clients, userID)
		delete(h.Typing, userID)
	}
	h.Mutex.Unlock()

	// Broadcast trạng thái offline
	h.broadcastUserStatus(userID, false)
}

func (h *WebSocketHandler) broadcastUserStatus(userID primitive.ObjectID, isOnline bool) {
	message := types.WebSocketMessage{
		Type: types.EventTypeOnline,
		Payload: map[string]interface{}{
			"user_id": userID,
			"online":  isOnline,
		},
	}

	h.broadcastToAll(message)
}

func (h *WebSocketHandler) broadcastToAll(message types.WebSocketMessage) {
	payload, err := json.Marshal(message)
	if err != nil {
		log.Printf("Lỗi marshal message: %v", err)
		return
	}

	h.Mutex.RLock()
	defer h.Mutex.RUnlock()

	for _, conn := range h.Clients {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Printf("Lỗi gửi message: %v", err)
		}
	}
}

// Custom implementations of message handling
func (h *WebSocketHandler) handleNewMessage(userID primitive.ObjectID, payload interface{}) {
	// Implementation logic should be updated to reflect your business requirements
	log.Printf("New message from user %s: %v", userID.Hex(), payload)
}

func (h *WebSocketHandler) handleTypingStatus(userID primitive.ObjectID, payload interface{}) {
	// Extract conversation ID and typing status from payload
	if data, ok := payload.(map[string]interface{}); ok {
		var conversationID primitive.ObjectID
		var isTyping bool

		if convIDStr, ok := data["conversation_id"].(string); ok {
			if objID, err := primitive.ObjectIDFromHex(convIDStr); err == nil {
				conversationID = objID
			}
		}

		if typingVal, ok := data["is_typing"].(bool); ok {
			isTyping = typingVal
		}

		// Update typing status
		if !conversationID.IsZero() {
			h.Mutex.Lock()
			if _, exists := h.Typing[userID]; !exists {
				h.Typing[userID] = make(map[primitive.ObjectID]bool)
			}
			h.Typing[userID][conversationID] = isTyping
			h.Mutex.Unlock()

			// Broadcast typing status to other users
			message := types.WebSocketMessage{
				Type: types.EventTypeTyping,
				Payload: map[string]interface{}{
					"user_id":         userID,
					"conversation_id": conversationID.Hex(),
					"is_typing":       isTyping,
				},
			}
			h.broadcastToAll(message)
		}
	}
}

func (h *WebSocketHandler) handleMessageRead(userID primitive.ObjectID, payload interface{}) {
	// Implementation logic for marking messages as read
	log.Printf("Message read by user %s: %v", userID.Hex(), payload)
}
