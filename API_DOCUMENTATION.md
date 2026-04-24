# Backend API Documentation

This document describes the API endpoints your backend needs to implement for this frontend application to work with standard hosting providers like Vercel, Netlify, or Hostinger.

## Environment Variables

Create a `.env` file in your project root with:

```env
VITE_API_BASE_URL=http://localhost:3001/api
# OR for production:
# VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Authentication Endpoints

### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

---

### POST /api/auth/login
Authenticate a user and return a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

---

### POST /api/auth/logout
Logout the user (optional - mainly for backend cleanup).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/auth/me
Get the current authenticated user.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

---

## Entity Endpoints

All entity endpoints follow this pattern:

### GET /api/entities/{EntityName}?sort=field&limit=100
List all entities with optional sorting and limit.

**Query Parameters:**
- `sort`: Sort field (prefix with `-` for descending, e.g., `-created_date`)
- `limit`: Maximum number of results (default: 100)

**Response:**
```json
[
  {
    "id": "entity_id",
    "field1": "value1",
    "field2": "value2"
  }
]
```

---

### GET /api/entities/{EntityName}?filter1=value1&filter2=value2&sort=field&limit=100
Filter entities.

**Query Parameters:**
- Filter parameters (any field from the entity)
- `sort`: Sort field
- `limit`: Maximum results

**Response:**
```json
[
  { /* matching entity */ }
]
```

---

### GET /api/entities/{EntityName}/{id}
Get a single entity by ID.

**Response:**
```json
{
  "id": "entity_id",
  "field1": "value1"
}
```

---

### POST /api/entities/{EntityName}
Create a new entity.

**Request:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Response:**
```json
{
  "id": "new_entity_id",
  "field1": "value1",
  "field2": "value2"
}
```

---

### PUT /api/entities/{EntityName}/{id}
Update an entity.

**Request:**
```json
{
  "field1": "updated_value"
}
```

**Response:**
```json
{
  "id": "entity_id",
  "field1": "updated_value",
  "field2": "value2"
}
```

---

### DELETE /api/entities/{EntityName}/{id}
Delete an entity.

**Response:**
```json
{
  "success": true
}
```

---

## Entities Used in This Application

- **Place** - Travel destinations and locations
- **Post** - User posts/updates
- **PostComment** - Comments on posts
- **PostLike** - Likes on posts
- **ChatMessage** - Direct messages between users
- **Comment** - Comments on places
- **User** - User profiles
- **UserProfile** - Extended user profile information
- **Favorite** - Favorite places
- **Memory** - User memories
- **Announcement** - App announcements
- **Follow** - User follow relationships
- **Friendship** - User friendship relationships
- **FamilyTrip** - Family trip planning
- **SiteSettings** - Application settings

---

## Integration Endpoints

### POST /api/integrations/llm
Invoke a Large Language Model (for AI features).

**Request:**
```json
{
  "model": "gpt-4",
  "prompt": "Your prompt here",
  "messages": [],
  "system": "System prompt"
}
```

**Response:**
```json
{
  "result": "AI generated text here",
  "usage": { "tokens": 100 }
}
```

---

### POST /api/integrations/generate-image
Generate an image using AI.

**Request:**
```json
{
  "prompt": "A beautiful sunset in Egypt",
  "size": "1024x1024"
}
```

**Response:**
```json
{
  "image_url": "https://...",
  "file_url": "https://..."
}
```

---

### POST /api/integrations/upload
Upload a file to cloud storage.

**Form Data:**
- `file`: The file to upload
- `folder`: Optional folder path (default: "uploads")

**Response:**
```json
{
  "file_url": "https://your-storage.com/uploads/filename.jpg",
  "file_name": "filename.jpg"
}
```

---

## Error Handling

All error responses should follow this format:

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional error details (optional)"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

The token should be stored in `localStorage` as `auth_token` and will be automatically included in all API requests.

---

## Recommended Backend Solutions

1. **Node.js/Express** - Most flexible option
   - MongoDB/PostgreSQL for database
   - Firebase/AWS S3 for file storage
   - OpenAI API for AI features

2. **Supabase** - PostgreSQL + Auth + Storage
   - Built-in authentication
   - Real-time database
   - File storage included

3. **Firebase** - Google's serverless solution
   - Firestore for database
   - Firebase Auth
   - Firebase Storage
   - Firebase Functions for backend logic

4. **AWS AppSync** - GraphQL alternative
   - DynamoDB for database
   - Cognito for auth
   - S3 for storage

---

## Example Backend Implementation (Node.js/Express)

```javascript
// .env
VITE_API_BASE_URL=http://localhost:3001/api

// backend/server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  // TODO: Hash password, create user in DB
  const token = jwt.sign({ email, id: 'user_id' }, JWT_SECRET);
  res.json({ token, user: { email, full_name, id: 'user_id' } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Verify password
  const token = jwt.sign({ email, id: 'user_id' }, JWT_SECRET);
  res.json({ token, user: { email, id: 'user_id' } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

app.listen(3001, () => console.log('Server running on :3001'));
```

For a complete backend example, consider using:
- [Create-React-App with Node.js backend](https://create-react-app.dev/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
