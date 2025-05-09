package services

import (
	"context"
	"errors"
	"log"
	"time"

	"webchat/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MockUserStore lưu trữ người dùng trong bộ nhớ khi không có cơ sở dữ liệu thật
type MockUserStore struct {
	users map[string]*models.User
	idMap map[primitive.ObjectID]*models.User
}

// Tạo một mock store mới
func NewMockUserStore() *MockUserStore {
	return &MockUserStore{
		users: make(map[string]*models.User),
		idMap: make(map[primitive.ObjectID]*models.User),
	}
}

type UserService struct {
	db          *mongo.Database
	authService *AuthService
	mockStore   *MockUserStore
	useMock     bool
}

func NewUserService(db *mongo.Database, authService *AuthService) *UserService {
	useMock := db == nil
	var mockStore *MockUserStore

	if useMock {
		log.Println("UserService: Using in-memory mock database")
		mockStore = NewMockUserStore()

		// Tạo tài khoản demo mặc định để test
		demoID := primitive.NewObjectID()
		hashedPassword, _ := authService.HashPassword("123456")
		demoUser := &models.User{
			ID:        demoID,
			Email:     "demo@example.com",
			Password:  hashedPassword,
			Name:      "Người dùng Demo",
			Status:    models.UserStatusOffline,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Lưu vào mock store
		mockStore.users[demoUser.Email] = demoUser
		mockStore.idMap[demoUser.ID] = demoUser

		log.Printf("Created demo user: %s with password: 123456", demoUser.Email)
	}

	return &UserService{
		db:          db,
		authService: authService,
		mockStore:   mockStore,
		useMock:     useMock,
	}
}

// CreateUser tạo người dùng mới
func (s *UserService) CreateUser(email, password, name string) (*models.User, error) {
	// Mock database mode
	if s.useMock {
		// Kiểm tra email đã tồn tại
		if _, exists := s.mockStore.users[email]; exists {
			return nil, errors.New("email đã được sử dụng")
		}

		// Hash mật khẩu
		hashedPassword, err := s.authService.HashPassword(password)
		if err != nil {
			return nil, err
		}

		// Tạo người dùng mới
		user := &models.User{
			ID:        primitive.NewObjectID(),
			Email:     email,
			Password:  hashedPassword,
			Name:      name,
			Status:    models.UserStatusOffline,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Lưu vào mock store
		s.mockStore.users[email] = user
		s.mockStore.idMap[user.ID] = user

		return user, nil
	}

	// Normal database mode
	// Kiểm tra email đã tồn tại
	var existingUser models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("email đã được sử dụng")
	}

	// Hash mật khẩu
	hashedPassword, err := s.authService.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        primitive.NewObjectID(),
		Email:     email,
		Password:  hashedPassword,
		Name:      name,
		Status:    models.UserStatusOffline,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = s.db.Collection("users").InsertOne(context.Background(), user)
	return user, err
}

// GetUserByEmail lấy thông tin người dùng theo email
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	// Mock database mode
	if s.useMock {
		user, exists := s.mockStore.users[email]
		if !exists {
			return nil, errors.New("không tìm thấy người dùng")
		}
		return user, nil
	}

	// Normal database mode
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByID lấy thông tin người dùng theo ID
func (s *UserService) GetUserByID(id primitive.ObjectID) (*models.User, error) {
	// Mock database mode
	if s.useMock {
		user, exists := s.mockStore.idMap[id]
		if !exists {
			return nil, errors.New("không tìm thấy người dùng")
		}
		return user, nil
	}

	// Normal database mode
	var user models.User
	err := s.db.Collection("users").FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser cập nhật thông tin người dùng
func (s *UserService) UpdateUser(id primitive.ObjectID, name, avatar string) (*models.User, error) {
	// Mock database mode
	if s.useMock {
		user, exists := s.mockStore.idMap[id]
		if !exists {
			return nil, errors.New("không tìm thấy người dùng")
		}

		user.Name = name
		user.Avatar = avatar
		user.UpdatedAt = time.Now()

		return user, nil
	}

	// Normal database mode
	update := bson.M{
		"$set": bson.M{
			"name":       name,
			"avatar":     avatar,
			"updated_at": time.Now(),
		},
	}

	_, err := s.db.Collection("users").UpdateOne(context.Background(), bson.M{"_id": id}, update)
	if err != nil {
		return nil, err
	}

	return s.GetUserByID(id)
}

// UpdateUserStatus cập nhật trạng thái người dùng
func (s *UserService) UpdateUserStatus(id primitive.ObjectID, status models.UserStatus) error {
	// Mock database mode
	if s.useMock {
		user, exists := s.mockStore.idMap[id]
		if !exists {
			return errors.New("không tìm thấy người dùng")
		}

		user.Status = status
		user.UpdatedAt = time.Now()

		return nil
	}

	// Normal database mode
	update := bson.M{
		"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		},
	}

	_, err := s.db.Collection("users").UpdateOne(context.Background(), bson.M{"_id": id}, update)
	return err
}
