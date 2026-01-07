// Example Express server endpoint for handling payment confirmation with an uploaded slip.
// Usage:
// 1. npm install express multer
// 2. node payment-confirmation-example.js
// 3. POST multipart/form-data to /api/payments/confirm with fields like orderId, amount and file field named `slip`.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config - store files on disk with original name prefixed by timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safeName}`);
  }
});

const upload = multer({ storage });

// Example endpoint
app.post('/api/payments/confirm', upload.single('slip'), (req, res) => {
  // req.body will contain text fields from the form (e.g. orderId, amount)
  // req.file contains file metadata saved by multer

  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No slip file uploaded (field name must be "slip").' });
  }

  // Example: basic validation
  const { orderId, amount } = req.body;
  if (!orderId) {
    return res.status(400).json({ ok: false, message: 'Missing orderId in form data.' });
  }

  // In a real application you'd associate the uploaded file with the payment record,
  // perform additional validation, and move the file to permanent storage if needed.

  res.json({
    ok: true,
    message: 'Payment confirmation received.',
    received: {
      orderId,
      amount,
      slip: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        savedAs: req.file.filename,
        path: path.relative(process.cwd(), req.file.path)
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Payment confirmation example server listening on http://localhost:${PORT}`);
});
