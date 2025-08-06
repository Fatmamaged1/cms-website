# CMS API Endpoints

## Base URL
```
{{base_url}}/api/v1
```

## Authentication
- Required for admin endpoints
- Add header: `Authorization: Bearer {token}`

## Blogs

### Get All Blog Posts
```
GET /blogs
```
**Query Params:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID
- `tag` - Filter by tag name
- `search` - Search query
- `language` - Language code (en/ar)

### Get Single Blog Post
```
GET /blogs/:slug
```
**Query Params:**
- `language` - Language code (en/ar)

### Create Blog Post (Admin)
```
POST /blogs
```
**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "title": "Post Title",
  "slug": "post-title",
  "excerpt": "Short excerpt",
  "content": {"blocks": [{"type":"paragraph","data":{"text":"Content..."}}]},
  "categories": ["category-id"],
  "tags": ["tag1", "tag2"],
  "status": "draft",
  "language": "en"
}
```

## Pages

### Get Page by Type
```
GET /pages/:pageType
```
**Page Types:** `home`, `about`, `services`, `blog`, `careers`, `contact`

## Services

### Get All Services
```
GET /services
```
**Query Params:**
- `page` - Page number
- `limit` - Items per page
- `featured` - Filter featured services
- `language` - Language code

## Careers

### Get Job Postings
```
GET /careers
```
**Query Params:**
- `status` - Filter by status (default: published)
- `department` - Filter by department
- `jobType` - Filter by job type
- `language` - Language code

### Apply for Job
```
POST /careers/:id/apply
```
**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "resume": "https://example.com/resume.pdf",
  "coverLetter": "I'm excited to apply..."
}
```

## Contact

### Submit Contact Form
```
POST /contact
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question.",
  "recaptchaToken": "token-from-google"
}
```

## Authentication

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

### Get Current User
```
GET /auth/me
```
**Headers:**
- `Authorization: Bearer {token}`

## Environment Variables
Create a `.env` file with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cms-website
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Importing to Postman
1. Create a new collection
2. Import the environment variables
3. Set `base_url` to `http://localhost:3000` for development
