# Image Upload Error Debugging Guide

## Current Error: 500 Internal Server Error + "Failed to fetch"

**What's happening:**
- Frontend sends multipart image upload to `/api/products/2/images`
- Backend returns 500 error
- Browser throws "Failed to fetch" (CORS issue with error response)

---

## Why "Failed to fetch" Appears

When the backend returns a **500 error WITHOUT proper CORS headers**, the browser blocks the response with a generic "Failed to fetch" error. This is a security feature.

**The issue is on the backend side** - it needs to send proper CORS headers even on error responses.

---

## Frontend Debug Steps ✅ (DONE)

Enhanced logging has been added to `/src/lib/api/auth.ts`:
- Request URL and details logged
- File count and total size tracked
- Token presence verified
- Response headers logged
- Better error messages

**Check browser console (F12) for:**
```
📤 Request Details:
   URL: https://api.untappednature.com/api/products/2/images
   Files: X
   Total Size: Y KB
   Token: Present
```

---

## Backend Debugging Steps ⚠️ (REQUIRED)

Your backend team needs to:

### 1. **Add CORS Headers to All Responses**
```
Access-Control-Allow-Origin: https://your-frontend-domain
Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

**This must be on ALL responses, including 500 errors.**

### 2. **Check Backend Logs**
```bash
# For Node.js/Express
console.error('Image upload error:', error);

# For nginx
tail -f /var/log/nginx/error.log

# For Docker
docker logs <container-name>
```

### 3. **Verify the Image Upload Handler**

The backend endpoint should:
- Accept `POST /api/products/{id}/images`
- Parse multipart FormData with field name `images`
- Accept multiple files
- Validate product ownership
- Save files to disk/storage
- Return JSON response

**Example (Node.js/Express):**
```javascript
router.post('/api/products/:id/images', authenticate, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    
    // Check if product exists and belongs to user
    const product = await Product.findOne({ id: productId, userId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }
    
    // Process and save images
    const savedImages = await Promise.all(
      req.files.map(file => saveImageToStorage(file, productId))
    );
    
    // Save to database
    await ProductImage.insertMany(
      savedImages.map(path => ({ productId, imageUrl: path }))
    );
    
    return res.status(200).json({ 
      message: 'Images uploaded successfully',
      images: savedImages 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: error.message });
  }
});
```

### 4. **Common Backend Issues**

| Issue | Solution |
|-------|----------|
| **Product ID doesn't exist** | Verify product 2 exists: `GET /api/products/2` |
| **User doesn't own product** | Verify token owner matches product owner |
| **No file system permissions** | Check server write permissions to upload directory |
| **Request parsing fails** | Ensure multipart middleware is configured (`express-fileupload`, `multer`, etc.) |
| **Missing CORS headers** | Add CORS middleware that applies to ALL responses |
| **Path issues** | Verify `API_BASE_URL` is correct: `https://api.untappednature.com` |

---

## Testing Steps

### 1. Test with Postman
```
POST https://api.untappednature.com/api/products/2/images
Headers:
  Authorization: Bearer <your-token>
Body: form-data
  images: [select image file]
```

Check:
- ✅ Status code (should be 200)
- ✅ CORS headers in response
- ✅ Response body (should have `message` and `images`)
- ✅ Images actually saved on server

### 2. Check Server Logs
```bash
# See what error the backend is actually throwing
# This will tell you the real issue
```

### 3. Verify Product Exists
```
GET https://api.untappednature.com/api/products/2
Headers:
  Authorization: Bearer <your-token>
```

---

## Frontend Enhanced Logging

The updated code now logs:
- ✅ Request details (URL, file count, size)
- ✅ Response status and headers
- ✅ Detailed error messages
- ✅ CORS vs connection error detection

**All logged to browser console (F12 → Console tab)**

---

## Next Steps

1. **Check browser console** for the enhanced debug logs
2. **Share the backend logs** with your server team
3. **Test with Postman** to isolate frontend vs backend
4. **Verify CORS headers** are sent on all responses
5. Once backend is fixed, image uploads will work immediately

---

## CORS Configuration Examples

### nginx
```nginx
add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com';
add_header 'Access-Control-Allow-Methods' 'POST, OPTIONS, GET, PUT, DELETE';
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
add_header 'Access-Control-Allow-Credentials' 'true';

if ($request_method = 'OPTIONS') {
  return 204;
}
```

### Express.js
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
}));
```

### Django/Python
```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
]
CORS_ALLOW_CREDENTIALS = True
```

---

## Need Help?

1. ✅ **Frontend is ready** - no more changes needed
2. ⚠️ **Backend needs fixes:**
   - Add CORS headers to error responses
   - Check endpoint handler for bugs
   - Verify file permissions

Share the backend logs and we can diagnose the exact issue! 🔍
