# CMS-like Website with Express.js & MongoDB

A modern, headless CMS built with Express.js, MongoDB, and a block-based content editor similar to Editor.js. This project provides a flexible and scalable backend for managing website content with support for multiple languages (English and Arabic).

## Features

- 🚀 **Block-based Content Editing** - Flexible content creation with Editor.js style blocks
- 🌐 **Multilingual Support** - Built-in support for English and Arabic (easily extensible)
- 🔒 **Secure** - Helmet, rate limiting, data sanitization, and other security best practices
- ⚡ **Performance** - Compression, caching, and optimized database queries
- 📱 **API-First** - RESTful API design with proper status codes and error handling
- 🛠 **Developer Experience** - ESLint, Prettier, and Husky for code quality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, rate limiting, data sanitization
- **Code Quality**: ESLint, Prettier, Husky

## Project Structure

```
cms-website/
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/               # Mongoose models
├── routes/               # API routes
├── utils/                # Utility functions
├── .env                  # Environment variables
├── .eslintrc.json        # ESLint config
├── .prettierrc           # Prettier config
├── package.json          # Project dependencies
└── server.js             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cms-website.git
   cd cms-website
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The server will be running at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Available Endpoints

#### Pages
- `GET /pages/:pageType` - Get page by type (home, about, services, etc.)
- `GET /pages/id/:id` - Get page by ID
- `POST /pages` - Create or update page content (admin only)
- `DELETE /pages/:id` - Delete a page (admin only)

#### Services
- `GET /services` - Get all services
- `GET /services/:slug` - Get service by slug
- `POST /services` - Create a new service (admin only)
- `PUT /services/:id` - Update a service (admin only)
- `DELETE /services/:id` - Delete a service (admin only)

#### Blogs
- `GET /blogs` - Get all blog posts
- `GET /blogs/:slug` - Get blog post by slug
- `POST /blogs` - Create a new blog post (admin only)
- `PUT /blogs/:id` - Update a blog post (admin only)
- `DELETE /blogs/:id` - Delete a blog post (admin only)

#### Careers
- `GET /careers` - Get all job postings
- `GET /careers/:idOrSlug` - Get job posting by ID or slug
- `POST /careers/:id/apply` - Submit job application
- `POST /careers` - Create a new job posting (admin only)
- `PUT /careers/:id` - Update a job posting (admin only)
- `DELETE /careers/:id` - Delete a job posting (admin only)

#### Contact
- `POST /contact` - Submit contact form
- `GET /contact` - Get contact submissions (admin only)
- `PATCH /contact/:id/status` - Update submission status (admin only)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Default language
DEFAULT_LANGUAGE=en

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## Development

### Linting
```bash
npm run lint
# or
yarn lint
```

### Formatting
```bash
npm run format
# or
yarn format
```

### Testing
```bash
npm test
# or
yarn test
```

## Deployment

### Production Build
```bash
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

### Environment Variables in Production
Make sure to set the following environment variables in your production environment:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Editor.js](https://editorjs.io/)
- And all the amazing open-source libraries used in this project
