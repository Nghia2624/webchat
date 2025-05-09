# WebChat API Documentation

This document provides detailed information about all API endpoints in the WebChat application, including request formats, response examples, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8081/api
```

## Authentication

Most endpoints require authentication through a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained by logging in or registering.

## Error Handling

All endpoints follow a standardized error response format:

```json
{
  "error": true,
  "message": "Error message description",
  "code": "ERROR_CODE"
}
```

## API Endpoints

### Authentication

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Authenticates a user and returns tokens and user data

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response Example** (200 OK):
```json
{
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Registers a new user

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response Example** (201 Created):
```json
{
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": null,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Refresh Token

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Refreshes the access token using a refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Example** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Logs out the user by invalidating their tokens

**Response Example** (200 OK):
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### User Management

#### Get Current User Profile

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves the profile of the currently authenticated user

**Response Example** (200 OK):
```json
{
  "id": "user123",
  "name": "John Doe",
  "email": "user@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "status": "active"
}
```

#### Update Profile

- **URL**: `/users/me`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Description**: Updates the profile of the currently authenticated user

**Request Body**:
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response Example** (200 OK):
```json
{
  "id": "user123",
  "name": "John Updated",
  "email": "user@example.com",
  "avatar": "https://example.com/new-avatar.jpg",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Search Users

- **URL**: `/users/search?q=searchTerm`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Searches for users by name or email

**Response Example** (200 OK):
```json
{
  "users": [
    {
      "id": "user456",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "https://example.com/jane-avatar.jpg"
    },
    {
      "id": "user789",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "avatar": null
    }
  ]
}
```

### Friends Management

#### Get Friends List

- **URL**: `/friends`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves the user's friends list

**Response Example** (200 OK):
```json
{
  "friends": [
    {
      "id": "user456",
      "name": "Jane Doe",
      "avatar": "https://example.com/jane-avatar.jpg",
      "isOnline": true,
      "status": "active"
    },
    {
      "id": "user789",
      "name": "John Smith",
      "avatar": null,
      "isOnline": false,
      "status": "active"
    }
  ]
}
```

#### Get Friend Requests

- **URL**: `/friends/requests`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves received and sent friend requests

**Response Example** (200 OK):
```json
{
  "received": [
    {
      "id": "req123",
      "sender": {
        "id": "user101",
        "name": "Alice Johnson",
        "avatar": "https://example.com/alice-avatar.jpg"
      },
      "status": "pending",
      "createdAt": "2023-01-01T10:00:00.000Z"
    }
  ],
  "sent": [
    {
      "id": "req456",
      "recipient": {
        "id": "user202",
        "name": "Bob Williams",
        "avatar": null
      },
      "status": "pending",
      "createdAt": "2023-01-02T10:00:00.000Z"
    }
  ]
}
```

#### Send Friend Request

- **URL**: `/friends/requests`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Sends a friend request to another user

**Request Body**:
```json
{
  "userId": "user101"
}
```

**Response Example** (201 Created):
```json
{
  "success": true,
  "request": {
    "id": "req789",
    "recipient": {
      "id": "user101",
      "name": "Alice Johnson",
      "avatar": "https://example.com/alice-avatar.jpg"
    },
    "status": "pending",
    "createdAt": "2023-01-03T10:00:00.000Z"
  }
}
```

#### Accept Friend Request

- **URL**: `/friends/requests/{requestId}/accept`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Description**: Accepts a received friend request

**Response Example** (200 OK):
```json
{
  "success": true,
  "requestId": "req123",
  "friend": {
    "id": "user101",
    "name": "Alice Johnson",
    "avatar": "https://example.com/alice-avatar.jpg",
    "isOnline": false,
    "status": "active"
  }
}
```

#### Reject Friend Request

- **URL**: `/friends/requests/{requestId}/reject`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Description**: Rejects a received friend request

**Response Example** (200 OK):
```json
{
  "success": true,
  "requestId": "req123"
}
```

#### Remove Friend

- **URL**: `/friends/{friendId}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Description**: Removes a user from friends list

**Response Example** (200 OK):
```json
{
  "success": true,
  "friendId": "user101"
}
```

### Conversations

#### Get Conversations

- **URL**: `/conversations`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves all conversations for the current user

**Response Example** (200 OK):
```json
{
  "conversations": [
    {
      "id": "conv123",
      "type": "personal",
      "participants": [
        {
          "id": "user456",
          "name": "Jane Doe",
          "avatar": "https://example.com/jane-avatar.jpg",
          "isOnline": true
        }
      ],
      "lastMessage": {
        "id": "msg456",
        "sender": {
          "id": "user456",
          "name": "Jane Doe"
        },
        "content": "Hello there!",
        "createdAt": "2023-01-02T14:30:00.000Z",
        "read": true
      },
      "unreadCount": 0
    },
    {
      "id": "conv456",
      "type": "group",
      "name": "Project Team",
      "participants": [
        {
          "id": "user456",
          "name": "Jane Doe",
          "avatar": "https://example.com/jane-avatar.jpg",
          "isOnline": true
        },
        {
          "id": "user789",
          "name": "John Smith",
          "avatar": null,
          "isOnline": false
        }
      ],
      "lastMessage": {
        "id": "msg789",
        "sender": {
          "id": "user789",
          "name": "John Smith"
        },
        "content": "Meeting tomorrow?",
        "createdAt": "2023-01-03T09:15:00.000Z",
        "read": false
      },
      "unreadCount": 2
    }
  ]
}
```

#### Get Conversation by ID

- **URL**: `/conversations/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves a specific conversation by ID

**Response Example** (200 OK):
```json
{
  "id": "conv123",
  "type": "personal",
  "createdAt": "2023-01-01T10:00:00.000Z",
  "participants": [
    {
      "id": "user456",
      "name": "Jane Doe",
      "avatar": "https://example.com/jane-avatar.jpg",
      "isOnline": true
    }
  ]
}
```

#### Create Personal Conversation

- **URL**: `/conversations/personal`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Creates a personal conversation with another user

**Request Body**:
```json
{
  "recipientId": "user456"
}
```

**Response Example** (201 Created):
```json
{
  "id": "conv123",
  "type": "personal",
  "createdAt": "2023-01-03T15:45:00.000Z",
  "participants": [
    {
      "id": "user456",
      "name": "Jane Doe",
      "avatar": "https://example.com/jane-avatar.jpg",
      "isOnline": true
    }
  ]
}
```

#### Create Group Conversation

- **URL**: `/conversations/group`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Creates a group conversation

**Request Body**:
```json
{
  "name": "Project Team",
  "participantIds": ["user456", "user789"]
}
```

**Response Example** (201 Created):
```json
{
  "id": "conv456",
  "type": "group",
  "name": "Project Team",
  "createdAt": "2023-01-03T16:00:00.000Z",
  "participants": [
    {
      "id": "user456",
      "name": "Jane Doe",
      "avatar": "https://example.com/jane-avatar.jpg",
      "isOnline": true
    },
    {
      "id": "user789",
      "name": "John Smith",
      "avatar": null,
      "isOnline": false
    }
  ]
}
```

### Messages

#### Get Messages

- **URL**: `/conversations/{conversationId}/messages?offset=0&limit=20`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves messages for a specific conversation with pagination

**Response Example** (200 OK):
```json
{
  "messages": [
    {
      "id": "msg123",
      "conversationId": "conv123",
      "sender": {
        "id": "user123",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": "Hello!",
      "attachment": null,
      "createdAt": "2023-01-01T12:00:00.000Z",
      "updatedAt": "2023-01-01T12:00:00.000Z",
      "read": true,
      "readBy": [
        {
          "userId": "user456",
          "readAt": "2023-01-01T12:01:00.000Z"
        }
      ]
    },
    {
      "id": "msg456",
      "conversationId": "conv123",
      "sender": {
        "id": "user456",
        "name": "Jane Doe",
        "avatar": "https://example.com/jane-avatar.jpg"
      },
      "content": "Hello there!",
      "attachment": null,
      "createdAt": "2023-01-01T12:02:00.000Z",
      "updatedAt": "2023-01-01T12:02:00.000Z",
      "read": true,
      "readBy": [
        {
          "userId": "user123",
          "readAt": "2023-01-01T12:03:00.000Z"
        }
      ]
    }
  ],
  "hasMore": false,
  "totalCount": 2
}
```

#### Mark Messages as Read

- **URL**: `/conversations/{conversationId}/messages/read`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Marks specific messages as read

**Request Body**:
```json
{
  "messageIds": ["msg789", "msg790"]
}
```

**Response Example** (200 OK):
```json
{
  "success": true,
  "updatedMessages": ["msg789", "msg790"]
}
```

### Files

#### Upload File

- **URL**: `/files/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Description**: Uploads a file (image, document, etc.)

**Request Body**:
```
file: [binary file data]
type: "attachment" | "avatar"
```

**Response Example** (200 OK):
```json
{
  "fileId": "file123",
  "url": "https://example.com/uploads/file123.jpg",
  "type": "image/jpeg",
  "size": 125000,
  "filename": "profile.jpg"
}
```

### Health Check

#### Check API Health

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Checks if the API is running properly

**Response Example** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2023-01-03T16:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

## WebSocket API

The WebSocket connection is established at:

```
ws://localhost:8081/api/ws?token=<your_jwt_token>
```

### WebSocket Messages

Messages sent and received through WebSocket follow this format:

```json
{
  "type": "message_type",
  "payload": {
    // Message-specific data
  }
}
```

### Message Types

#### Sending Messages

To send a message:

```json
{
  "type": "message",
  "payload": {
    "id": "client_generated_id",
    "conversationId": "conv123",
    "content": "Hello world!",
    "attachment": null
  }
}
```

#### Typing Status

To indicate typing status:

```json
{
  "type": "typing",
  "payload": {
    "conversationId": "conv123",
    "isTyping": true
  }
}
```

#### Receiving Messages

When receiving a new message:

```json
{
  "type": "message",
  "payload": {
    "id": "msg123",
    "conversationId": "conv123",
    "sender": {
      "id": "user456",
      "name": "Jane Doe"
    },
    "content": "Hello there!",
    "attachment": null,
    "createdAt": "2023-01-03T16:45:00.000Z"
  }
}
```

#### Message Acknowledgment

When a sent message is processed by the server:

```json
{
  "type": "message_ack",
  "payload": {
    "messageId": "client_generated_id",
    "message": {
      "id": "msg123",
      "conversationId": "conv123",
      "sender": {
        "id": "user123",
        "name": "John Doe"
      },
      "content": "Hello world!",
      "attachment": null,
      "createdAt": "2023-01-03T16:45:00.000Z"
    }
  }
}
```

#### Friend Requests

When receiving a friend request:

```json
{
  "type": "friend_request",
  "payload": {
    "id": "req123",
    "sender": {
      "id": "user101",
      "name": "Alice Johnson",
      "avatar": "https://example.com/alice-avatar.jpg"
    },
    "status": "pending",
    "createdAt": "2023-01-03T17:00:00.000Z"
  }
}
```

#### Friend Request Updates

When a friend request status changes:

```json
{
  "type": "friend_request_update",
  "payload": {
    "requestId": "req123",
    "status": "accepted"
  }
}
```

#### Friend Status Updates

When a friend's online status changes:

```json
{
  "type": "friend_status",
  "payload": {
    "userId": "user456",
    "isOnline": true
  }
}
```

#### Connection Maintenance

Keep the connection alive by sending periodic pings:

```json
{
  "type": "ping"
}
```

Server response:

```json
{
  "type": "pong"
}
``` 