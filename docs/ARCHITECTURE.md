# Backend Architecture & Performance

## Directory Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── services/       # Business logic
└── utils/          # Helper functions
```

## Caching Strategy

### 1. Memory Caching (Development)

```javascript
// services/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

const withCache = async (key, callback, ttl = 3600) => {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const data = await callback();
  if (data) cache.set(key, data, ttl);
  return data;
};
```

### 2. Redis (Production)

```javascript
// config/redis.js
const Redis = require('ioredis');
module.exports = new Redis(process.env.REDIS_URL);
```

## Database Indexing

### Recommended Indexes

```javascript
// Blog model
blogSchema.index({ slug: 1, language: 1 }, { unique: true });
blogSchema.index({ status: 1, publishedAt: -1 });

// Page model
pageSchema.index({ pageType: 1, language: 1 }, { unique: true });

// Service model
serviceSchema.index({ slug: 1, language: 1 }, { unique: true });
```

## Performance Tips

1. **Query Optimization**
   - Use `.select()` for specific fields
   - Apply pagination
   - Use `.lean()` for read operations

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Serve responsive images

3. **Response Compression**
   ```javascript
   app.use(require('compression')());
   ```

## SEO Best Practices

1. **Sitemap**
   - Generate dynamic sitemap.xml
   - Include all public URLs
   - Set proper changefreq and priority

2. **Structured Data**
   - Add JSON-LD for rich snippets
   - Include BlogPosting, Organization schemas

3. **Meta Tags**
   - Dynamic title and description
   - Open Graph and Twitter cards
   - Canonical URLs

## Deployment

### Environment Variables

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://redis:6379
```

### PM2 Configuration

```json
{
  "apps": [{
    "name": "cms-api",
    "script": "./server.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

## Monitoring

1. **Logging**
   - Winston for structured logging
   - Error tracking with Sentry

2. **Performance**
   - New Relic / Datadog
   - MongoDB Atlas metrics

## Security

1. **Helmet**
   ```javascript
   app.use(helmet());
   ```

2. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use('/api/', rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   }));
   ```

3. **Data Sanitization**
   ```javascript
   app.use(express.json({ limit: '10kb' }));
   app.use(mongoSanitize());
   app.use(xss());
   app.use(hpp());
   ```
