package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"webchat/handlers"
	"webchat/middleware"
	"webchat/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Tải file .env
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using default environment variables")
	}

	// Thiết lập chế độ môi trường (development/production)
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug" // Default to debug mode
	}
	gin.SetMode(ginMode)

	// Lấy port từ biến môi trường hoặc sử dụng mặc định
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Kết nối MongoDB hoặc sử dụng mock database
	var db *mongo.Database
	var mongoClient *mongo.Client
	useMock := os.Getenv("USE_MOCK_DB")

	// Sử dụng mock database mặc định nếu không có biến môi trường
	if useMock == "" {
		useMock = "true" // Sử dụng mock database mặc định
	}

	if useMock == "true" {
		log.Println("Using mock database for development")
		db = nil
	} else {
		// Kết nối MongoDB
		mongoURI := os.Getenv("MONGODB_URI")
		if mongoURI == "" {
			mongoURI = "mongodb://localhost:27017/webchat"
		}

		// Thiết lập timeout cho kết nối MongoDB
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		clientOptions := options.Client().ApplyURI(mongoURI)
		var err error
		mongoClient, err = mongo.Connect(ctx, clientOptions)
		if err != nil {
			log.Println("Failed to connect to MongoDB:", err)
			log.Println("Using mock database instead")
			db = nil
		} else {
			// Kiểm tra kết nối MongoDB
			err = mongoClient.Ping(ctx, nil)
			if err != nil {
				log.Println("Could not connect to MongoDB:", err)
				log.Println("Using mock database instead")
				db = nil
			} else {
				log.Println("Connected to MongoDB at", mongoURI)
				db = mongoClient.Database("webchat")
			}
		}
	}

	// Xử lý đóng kết nối MongoDB khi tắt server
	if mongoClient != nil {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)
		go func() {
			<-c
			log.Println("Closing MongoDB connection...")
			mongoClient.Disconnect(context.Background())
			log.Println("Application shutting down...")
			os.Exit(0)
		}()
	}

	// Khởi tạo các service
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret_key_change_this_in_production"
		log.Println("Warning: Using default JWT secret key. Set JWT_SECRET environment variable for production.")
	}

	authService := services.NewAuthService(jwtSecret)
	userService := services.NewUserService(db, authService)
	// Thiết lập userService cho authService để tránh circular dependency
	authService.SetUserService(userService)

	wsHandler := handlers.NewWebSocketHandler()
	chatService := services.NewChatService(db, wsHandler.WebSocketHandler)

	// Khởi tạo các handler
	authHandler := handlers.NewAuthHandler(userService, authService)
	chatHandler := handlers.NewChatHandler(chatService, userService)
	userHandler := handlers.NewUserHandler(userService)

	// Khởi tạo middleware
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Thiết lập Gin router
	r := gin.Default()

	// Thêm middleware xử lý lỗi chung
	r.Use(middleware.ErrorHandler())

	// Cấu hình CORS chi tiết hơn
	allowOrigins := []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5174"}
	if os.Getenv("CORS_ALLOW_ALL") == "true" {
		allowOrigins = append(allowOrigins, "*")
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Route kiểm tra API
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "API is working",
			"mock":    useMock == "true",
			"env":     ginMode,
			"version": "1.0.0",
		})
	})

	// Route kiểm tra API với CORS
	r.GET("/api/health", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "API is working",
			"mock":    useMock == "true",
			"env":     ginMode,
			"version": "1.0.0",
		})
	})

	// Rate limiting cho toàn bộ API
	r.Use(authMiddleware.RateLimit())

	// Group các route API
	api := r.Group("/api")

	// Các route không cần xác thực
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/refresh", authHandler.RefreshToken)

	// WebSocket endpoint - sử dụng WebSocketAuth thay vì RequireAuth
	api.GET("/ws", authMiddleware.WebSocketAuth(), wsHandler.HandleConnection)

	// Các route cần xác thực
	protected := api.Group("")
	protected.Use(authMiddleware.RequireAuth())
	{
		// User endpoints
		protected.GET("/users/profile", userHandler.GetProfile)
		protected.PUT("/users/profile", userHandler.UpdateProfile)

		// Chat endpoints
		protected.POST("/conversations/personal", chatHandler.CreatePersonalConversation)
		protected.POST("/conversations/group", chatHandler.CreateGroupConversation)
		protected.GET("/conversations/:id/messages", chatHandler.GetMessages)
		protected.POST("/conversations/:id/messages", chatHandler.SendMessage)
		protected.PUT("/messages/:id/read", chatHandler.MarkMessageAsRead)
		protected.PUT("/messages/batch-read", chatHandler.BatchMarkMessagesAsRead)
		// Thêm route để lấy danh sách cuộc hội thoại
		protected.GET("/conversations", chatHandler.GetConversations)
	}

	// Thiết lập server với timeout
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Channel để nhận tín hiệu shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Khởi động server trong goroutine
	go func() {
		log.Printf("Server running in %s mode on port %s", ginMode, port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed to start: ", err)
		}
	}()

	// Đợi tín hiệu shutdown
	<-quit
	log.Println("Shutting down server...")

	// Tạo context với timeout cho graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Đóng kết nối MongoDB nếu có
	if mongoClient != nil {
		if err := mongoClient.Disconnect(ctx); err != nil {
			log.Fatal("Error disconnecting from MongoDB:", err)
		}
	}

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited properly")
}
