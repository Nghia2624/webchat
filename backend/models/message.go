package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MessageType string
type MessageStatus string

const (
	MessageTypePersonal MessageType = "personal"
	MessageTypeGroup    MessageType = "group"

	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusRead      MessageStatus = "read"
)

type Message struct {
	ID             primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Type           MessageType          `bson:"type" json:"type"`
	ConversationID primitive.ObjectID   `bson:"conversation_id" json:"conversation_id"`
	GroupID        primitive.ObjectID   `bson:"group_id,omitempty" json:"group_id,omitempty"`
	SenderID       primitive.ObjectID   `bson:"sender_id" json:"sender_id"`
	Content        string               `bson:"content" json:"content"`
	Status         MessageStatus        `bson:"status" json:"status"`
	ReadBy         []primitive.ObjectID `bson:"read_by" json:"read_by"`
	IsDeleted      bool                 `bson:"is_deleted" json:"is_deleted"`
	CreatedAt      time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time            `bson:"updated_at" json:"updated_at"`
}

type MessageResponse struct {
	ID             primitive.ObjectID `json:"id"`
	Type           MessageType        `json:"type"`
	ConversationID primitive.ObjectID `json:"conversation_id"`
	GroupID        primitive.ObjectID `json:"group_id,omitempty"`
	Sender         *UserResponse      `json:"sender"`
	Content        string             `json:"content"`
	Status         MessageStatus      `json:"status"`
	ReadCount      int                `json:"read_count"`
	CreatedAt      time.Time          `json:"created_at"`
}

func (m *Message) ToResponse(sender *User) *MessageResponse {
	return &MessageResponse{
		ID:             m.ID,
		Type:           m.Type,
		ConversationID: m.ConversationID,
		GroupID:        m.GroupID,
		Sender:         sender.ToResponse(),
		Content:        m.Content,
		Status:         m.Status,
		ReadCount:      len(m.ReadBy),
		CreatedAt:      m.CreatedAt,
	}
}
