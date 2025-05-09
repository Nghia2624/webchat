package services

import (
	"context"
	"errors"
	"log"
	"sort"
	"time"

	"webchat/models"
	"webchat/types"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MockChatStore lưu trữ cuộc trò chuyện và tin nhắn trong bộ nhớ khi không có cơ sở dữ liệu thật
type MockChatStore struct {
	conversations    map[primitive.ObjectID]*models.Conversation
	conversationList []*models.Conversation
	messages         map[primitive.ObjectID]*models.Message
	messagesByConv   map[primitive.ObjectID][]*models.Message
}

// Tạo một mock chat store mới
func NewMockChatStore() *MockChatStore {
	return &MockChatStore{
		conversations:    make(map[primitive.ObjectID]*models.Conversation),
		conversationList: []*models.Conversation{},
		messages:         make(map[primitive.ObjectID]*models.Message),
		messagesByConv:   make(map[primitive.ObjectID][]*models.Message),
	}
}

type ChatService struct {
	db               *mongo.Database
	websocketHandler *types.WebSocketHandler
	mockStore        *MockChatStore
	useMock          bool
}

func NewChatService(db *mongo.Database, wsHandler *types.WebSocketHandler) *ChatService {
	useMock := db == nil
	var mockStore *MockChatStore

	if useMock {
		log.Println("ChatService: Using in-memory mock database")
		mockStore = NewMockChatStore()
	}

	return &ChatService{
		db:               db,
		websocketHandler: wsHandler,
		mockStore:        mockStore,
		useMock:          useMock,
	}
}

// CreatePersonalConversation tạo cuộc hội thoại 1-1
func (s *ChatService) CreatePersonalConversation(userID1, userID2 primitive.ObjectID) (*models.Conversation, error) {
	// Mock database mode
	if s.useMock {
		// Kiểm tra xem cuộc hội thoại đã tồn tại chưa
		for _, conv := range s.mockStore.conversationList {
			if conv.Type == models.ConversationTypePersonal &&
				len(conv.Participants) == 2 &&
				containsID(conv.Participants, userID1) &&
				containsID(conv.Participants, userID2) {
				return conv, nil
			}
		}

		// Tạo cuộc hội thoại mới
		conv := &models.Conversation{
			ID:           primitive.NewObjectID(),
			Type:         models.ConversationTypePersonal,
			Participants: []primitive.ObjectID{userID1, userID2},
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		s.mockStore.conversations[conv.ID] = conv
		s.mockStore.conversationList = append(s.mockStore.conversationList, conv)
		s.mockStore.messagesByConv[conv.ID] = []*models.Message{}

		return conv, nil
	}

	// Normal database mode
	// Kiểm tra xem cuộc hội thoại đã tồn tại chưa
	filter := bson.M{
		"type":         models.ConversationTypePersonal,
		"participants": bson.M{"$all": []primitive.ObjectID{userID1, userID2}},
	}

	var existingConv models.Conversation
	err := s.db.Collection("conversations").FindOne(context.Background(), filter).Decode(&existingConv)
	if err == nil {
		return &existingConv, nil
	}

	conv := &models.Conversation{
		ID:           primitive.NewObjectID(),
		Type:         models.ConversationTypePersonal,
		Participants: []primitive.ObjectID{userID1, userID2},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = s.db.Collection("conversations").InsertOne(context.Background(), conv)
	return conv, err
}

// CreateGroupConversation tạo cuộc hội thoại nhóm
func (s *ChatService) CreateGroupConversation(name string, image string, creatorID primitive.ObjectID, participants []primitive.ObjectID) (*models.Conversation, error) {
	if len(participants) > 20 {
		return nil, errors.New("số lượng thành viên không được vượt quá 20")
	}

	// Thêm người tạo vào danh sách thành viên nếu chưa có
	hasCreator := false
	for _, p := range participants {
		if p == creatorID {
			hasCreator = true
			break
		}
	}
	if !hasCreator {
		participants = append(participants, creatorID)
	}

	// Mock database mode
	if s.useMock {
		conv := &models.Conversation{
			ID:           primitive.NewObjectID(),
			Type:         models.ConversationTypeGroup,
			Name:         name,
			Image:        image,
			Participants: participants,
			Admins:       []primitive.ObjectID{creatorID},
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		s.mockStore.conversations[conv.ID] = conv
		s.mockStore.conversationList = append(s.mockStore.conversationList, conv)
		s.mockStore.messagesByConv[conv.ID] = []*models.Message{}

		return conv, nil
	}

	// Normal database mode
	conv := &models.Conversation{
		ID:           primitive.NewObjectID(),
		Type:         models.ConversationTypeGroup,
		Name:         name,
		Image:        image,
		Participants: participants,
		Admins:       []primitive.ObjectID{creatorID},
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err := s.db.Collection("conversations").InsertOne(context.Background(), conv)
	return conv, err
}

// SendMessage gửi tin nhắn mới
func (s *ChatService) SendMessage(senderID, conversationID primitive.ObjectID, content string) (*models.Message, error) {
	// Kiểm tra độ dài tin nhắn
	if len(content) > 2000 {
		return nil, errors.New("độ dài tin nhắn không được vượt quá 2000 ký tự")
	}

	// Mock database mode
	if s.useMock {
		// Lấy thông tin cuộc hội thoại
		conv, exists := s.mockStore.conversations[conversationID]
		if !exists {
			return nil, errors.New("cuộc hội thoại không tồn tại")
		}

		// Kiểm tra quyền gửi tin nhắn
		hasAccess := false
		for _, p := range conv.Participants {
			if p == senderID {
				hasAccess = true
				break
			}
		}
		if !hasAccess {
			return nil, errors.New("không có quyền gửi tin nhắn trong cuộc hội thoại này")
		}

		// Tạo tin nhắn mới
		msg := &models.Message{
			ID:             primitive.NewObjectID(),
			ConversationID: conversationID,
			SenderID:       senderID,
			Content:        content,
			Status:         models.MessageStatusSent,
			ReadBy:         []primitive.ObjectID{senderID},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if conv.Type == models.ConversationTypePersonal {
			msg.Type = models.MessageTypePersonal
		} else {
			msg.Type = models.MessageTypeGroup
			msg.GroupID = conversationID
		}

		// Lưu tin nhắn vào mock store
		s.mockStore.messages[msg.ID] = msg
		s.mockStore.messagesByConv[conversationID] = append(s.mockStore.messagesByConv[conversationID], msg)

		// Cập nhật tin nhắn cuối cùng cho cuộc hội thoại
		conv.LastMessage = msg
		conv.UpdatedAt = time.Now()

		// Gửi tin nhắn qua WebSocket cho tất cả người tham gia
		for _, participantID := range conv.Participants {
			if participantID != senderID {
				s.websocketHandler.SendToUser(participantID, types.WebSocketMessage{
					Type:    types.EventTypeMessage,
					Payload: msg,
				})
			}
		}

		return msg, nil
	}

	// Normal database mode
	var conv models.Conversation
	err := s.db.Collection("conversations").FindOne(context.Background(), bson.M{"_id": conversationID}).Decode(&conv)
	if err != nil {
		return nil, err
	}

	hasAccess := false
	for _, p := range conv.Participants {
		if p == senderID {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		return nil, errors.New("không có quyền gửi tin nhắn trong cuộc hội thoại này")
	}

	msg := &models.Message{
		ID:             primitive.NewObjectID(),
		Type:           models.MessageTypePersonal,
		ConversationID: conversationID,
		SenderID:       senderID,
		Content:        content,
		Status:         models.MessageStatusSent,
		ReadBy:         []primitive.ObjectID{senderID},
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if conv.Type == models.ConversationTypeGroup {
		msg.Type = models.MessageTypeGroup
		msg.GroupID = conversationID
	}

	_, err = s.db.Collection("messages").InsertOne(context.Background(), msg)
	if err != nil {
		return nil, err
	}

	// Cập nhật tin nhắn cuối cùng của cuộc hội thoại
	update := bson.M{
		"$set": bson.M{
			"last_message": msg,
			"updated_at":   time.Now(),
		},
	}
	_, err = s.db.Collection("conversations").UpdateOne(context.Background(), bson.M{"_id": conversationID}, update)

	// Gửi tin nhắn qua WebSocket cho tất cả người tham gia
	for _, participantID := range conv.Participants {
		if participantID != senderID {
			s.websocketHandler.SendToUser(participantID, types.WebSocketMessage{
				Type:    types.EventTypeMessage,
				Payload: msg,
			})
		}
	}

	return msg, err
}

// GetMessages lấy danh sách tin nhắn của cuộc hội thoại
func (s *ChatService) GetMessages(conversationID primitive.ObjectID, limit int64, before time.Time) ([]*models.Message, error) {
	if limit > 100 {
		limit = 100
	}

	// Mock database mode
	if s.useMock {
		var result []*models.Message
		messages, exists := s.mockStore.messagesByConv[conversationID]
		if !exists {
			return []*models.Message{}, nil
		}

		// Lọc tin nhắn theo thời gian và giới hạn số lượng
		count := int64(0)
		for i := len(messages) - 1; i >= 0 && count < limit; i-- {
			if messages[i].CreatedAt.Before(before) && !messages[i].IsDeleted {
				result = append(result, messages[i])
				count++
			}
		}

		return result, nil
	}

	// Normal database mode
	opts := options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(limit)
	filter := bson.M{
		"conversation_id": conversationID,
		"created_at":      bson.M{"$lt": before},
		"is_deleted":      false,
	}

	cursor, err := s.db.Collection("messages").Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var messages []*models.Message
	if err = cursor.All(context.Background(), &messages); err != nil {
		return nil, err
	}

	return messages, nil
}

// MarkMessageAsRead đánh dấu tin nhắn đã đọc
func (s *ChatService) MarkMessageAsRead(messageID, userID primitive.ObjectID) error {
	// Mock database mode
	if s.useMock {
		msg, exists := s.mockStore.messages[messageID]
		if !exists {
			return errors.New("tin nhắn không tồn tại")
		}

		// Thêm người dùng vào danh sách đã đọc nếu chưa có
		if !containsID(msg.ReadBy, userID) {
			msg.ReadBy = append(msg.ReadBy, userID)
			msg.Status = models.MessageStatusRead
		}

		return nil
	}

	// Normal database mode
	filter := bson.M{"_id": messageID}
	update := bson.M{
		"$addToSet": bson.M{"read_by": userID},
		"$set":      bson.M{"status": models.MessageStatusRead},
	}

	_, err := s.db.Collection("messages").UpdateOne(context.Background(), filter, update)
	return err
}

// BatchMarkMessagesAsRead đánh dấu nhiều tin nhắn là đã đọc cùng lúc
func (s *ChatService) BatchMarkMessagesAsRead(messageIDs []primitive.ObjectID, userID primitive.ObjectID) error {
	if len(messageIDs) == 0 {
		return nil
	}

	// Mock database mode
	if s.useMock {
		senderMap := make(map[primitive.ObjectID]bool)

		for _, msgID := range messageIDs {
			msg, exists := s.mockStore.messages[msgID]
			if !exists {
				continue
			}

			// Đánh dấu tin nhắn đã đọc
			if !containsID(msg.ReadBy, userID) {
				msg.ReadBy = append(msg.ReadBy, userID)
				msg.Status = models.MessageStatusRead
			}

			// Ghi nhận ID người gửi để thông báo
			if msg.SenderID != userID {
				senderMap[msg.SenderID] = true
			}
		}

		// Chuyển đổi messageIDs thành mảng các chuỗi hex
		messageIDsHex := make([]string, len(messageIDs))
		for i, id := range messageIDs {
			messageIDsHex[i] = id.Hex()
		}

		// Gửi thông báo trạng thái tin nhắn đã đọc qua WebSocket
		for senderID := range senderMap {
			s.websocketHandler.SendToUser(senderID, types.WebSocketMessage{
				Type: types.EventTypeRead,
				Payload: map[string]interface{}{
					"message_ids": messageIDsHex,
					"user_id":     userID.Hex(),
					"status":      models.MessageStatusRead,
				},
			})
		}

		return nil
	}

	// Normal database mode
	filter := bson.M{"_id": bson.M{"$in": messageIDs}}
	update := bson.M{
		"$addToSet": bson.M{"read_by": userID},
		"$set":      bson.M{"status": models.MessageStatusRead},
	}

	_, err := s.db.Collection("messages").UpdateMany(context.Background(), filter, update)
	if err != nil {
		return err
	}

	// Lấy thông tin về các tin nhắn để xác định người gửi
	var messages []*models.Message
	cursor, err := s.db.Collection("messages").Find(
		context.Background(),
		bson.M{"_id": bson.M{"$in": messageIDs}},
	)
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &messages); err != nil {
		return err
	}

	// Gửi thông báo đến người gửi tin nhắn
	senderMap := make(map[primitive.ObjectID]bool)
	for _, msg := range messages {
		if msg.SenderID != userID && !senderMap[msg.SenderID] {
			senderMap[msg.SenderID] = true

			// Chuyển đổi messageIDs thành mảng các chuỗi hex
			messageIDsHex := make([]string, len(messageIDs))
			for i, id := range messageIDs {
				messageIDsHex[i] = id.Hex()
			}

			// Gửi thông báo trạng thái tin nhắn đã đọc qua WebSocket
			s.websocketHandler.SendToUser(msg.SenderID, types.WebSocketMessage{
				Type: types.EventTypeRead,
				Payload: map[string]interface{}{
					"message_ids": messageIDsHex,
					"user_id":     userID.Hex(),
					"status":      models.MessageStatusRead,
				},
			})
		}
	}

	return nil
}

// Hàm tiện ích để kiểm tra một ID có trong mảng ID không
func containsID(ids []primitive.ObjectID, id primitive.ObjectID) bool {
	for _, existingID := range ids {
		if existingID == id {
			return true
		}
	}
	return false
}

// GetConversations lấy danh sách cuộc hội thoại của người dùng
func (s *ChatService) GetConversations(userID primitive.ObjectID, limit int64) ([]*models.Conversation, error) {
	if limit <= 0 {
		limit = 20
	} else if limit > 50 {
		limit = 50
	}

	// Mock database mode
	if s.useMock {
		var result []*models.Conversation

		// Lọc các cuộc hội thoại có chứa userID trong danh sách participants
		for _, conv := range s.mockStore.conversationList {
			for _, participantID := range conv.Participants {
				if participantID == userID {
					result = append(result, conv)
					break
				}
			}

			// Giới hạn số lượng cuộc hội thoại
			if int64(len(result)) >= limit {
				break
			}
		}

		// Sắp xếp theo thời gian cập nhật gần nhất (hoặc theo thời gian tin nhắn cuối cùng)
		sort.Slice(result, func(i, j int) bool {
			return result[i].UpdatedAt.After(result[j].UpdatedAt)
		})

		return result, nil
	}

	// Normal database mode
	opts := options.Find().SetSort(bson.M{"updated_at": -1}).SetLimit(limit)
	filter := bson.M{
		"participants": userID,
	}

	cursor, err := s.db.Collection("conversations").Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var conversations []*models.Conversation
	if err = cursor.All(context.Background(), &conversations); err != nil {
		return nil, err
	}

	return conversations, nil
}
