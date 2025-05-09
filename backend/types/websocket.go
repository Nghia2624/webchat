package types

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WebSocket event types
const (
	EventTypeMessage     = "message"
	EventTypeTyping      = "typing"
	EventTypeOnline      = "online"
	EventTypeRead        = "read"
	EventTypeGroupUpdate = "group_update"
)

// WebSocketMessage represents a message sent over WebSocket
type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// WebSocketHandler handles WebSocket connections and messaging
type WebSocketHandler struct {
	Clients  map[primitive.ObjectID]*websocket.Conn
	Typing   map[primitive.ObjectID]map[primitive.ObjectID]bool // userID -> conversationID -> isTyping
	Mutex    sync.RWMutex
	Upgrader websocket.Upgrader
}

// New WebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		Clients: make(map[primitive.ObjectID]*websocket.Conn),
		Typing:  make(map[primitive.ObjectID]map[primitive.ObjectID]bool),
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // In production, check origin properly
			},
		},
	}
}

// SendToUser sends a WebSocket message to a specific user
func (h *WebSocketHandler) SendToUser(userID primitive.ObjectID, message WebSocketMessage) error {
	h.Mutex.RLock()
	conn, ok := h.Clients[userID]
	h.Mutex.RUnlock()

	if !ok {
		return nil // User not online
	}

	payload, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.TextMessage, payload)
}
