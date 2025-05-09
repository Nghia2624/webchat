package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ConversationType string

const (
	ConversationTypePersonal ConversationType = "personal"
	ConversationTypeGroup    ConversationType = "group"
)

type Conversation struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Type         ConversationType     `bson:"type" json:"type"`
	Name         string               `bson:"name,omitempty" json:"name,omitempty"`
	Image        string               `bson:"image,omitempty" json:"image,omitempty"`
	Participants []primitive.ObjectID `bson:"participants" json:"participants"`
	Admins       []primitive.ObjectID `bson:"admins,omitempty" json:"admins,omitempty"`
	LastMessage  *Message             `bson:"last_message,omitempty" json:"last_message,omitempty"`
	CreatedAt    time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time            `bson:"updated_at" json:"updated_at"`
}

type ConversationResponse struct {
	ID           primitive.ObjectID `json:"id"`
	Type         ConversationType   `json:"type"`
	Name         string             `json:"name,omitempty"`
	Image        string             `json:"image,omitempty"`
	Participants []*UserResponse    `json:"participants"`
	Admins       []*UserResponse    `json:"admins,omitempty"`
	LastMessage  *MessageResponse   `json:"last_message,omitempty"`
	CreatedAt    time.Time          `json:"created_at"`
}

func (c *Conversation) ToResponse(participants []*User, lastMessage *MessageResponse) *ConversationResponse {
	participantResponses := make([]*UserResponse, len(participants))
	for i, p := range participants {
		participantResponses[i] = p.ToResponse()
	}

	adminResponses := make([]*UserResponse, 0)
	if len(c.Admins) > 0 {
		for _, p := range participants {
			for _, adminID := range c.Admins {
				if p.ID == adminID {
					adminResponses = append(adminResponses, p.ToResponse())
					break
				}
			}
		}
	}

	return &ConversationResponse{
		ID:           c.ID,
		Type:         c.Type,
		Name:         c.Name,
		Image:        c.Image,
		Participants: participantResponses,
		Admins:       adminResponses,
		LastMessage:  lastMessage,
		CreatedAt:    c.CreatedAt,
	}
}
