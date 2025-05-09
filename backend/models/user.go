package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserStatus string

const (
	UserStatusOnline  UserStatus = "online"
	UserStatusOffline UserStatus = "offline"
	UserStatusBusy    UserStatus = "busy"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"`
	Name      string             `bson:"name" json:"name"`
	Avatar    string             `bson:"avatar" json:"avatar"`
	Status    UserStatus         `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type UserResponse struct {
	ID     primitive.ObjectID `json:"id"`
	Email  string             `json:"email"`
	Name   string             `json:"name"`
	Avatar string             `json:"avatar"`
	Status UserStatus         `json:"status"`
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:     u.ID,
		Email:  u.Email,
		Name:   u.Name,
		Avatar: u.Avatar,
		Status: u.Status,
	}
}
