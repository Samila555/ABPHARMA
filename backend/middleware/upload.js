const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Smart upload middleware:
 *  - If CLOUDINARY env vars are set → buffer in memory, upload to Cloudinary via SDK
 *  - Otherwise → convert to base64 data URI and store in database
 *
 * Images MUST persist — Render's filesystem is ephemeral.
 */

let cloudinaryConfigured = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
    console.log('☁️  Cloudinary image storage enabled');
} else {
    console.log('💾  Database image storage (base64) — images stored directly in MySQL');
}

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
};

/**
 * Compress/resize a buffer using sharp if available, otherwise return as-is.
 */
async function processImage(buffer, mimetype) {
    try {
        const sharp = require('sharp');
        let img = sharp(buffer);
        const meta = await img.metadata();

        // Resize if wider than 800px (preserve aspect ratio)
        if (meta.width > 800) {
            img = img.resize({ width: 800, withoutEnlargement: true });
        }

        // Convert to webp for smaller size (except keep gif as-is)
        if (mimetype !== 'image/gif') {
            img = img.webp({ quality: 80 });
            mimetype = 'image/webp';
        }

        const processed = await img.toBuffer();
        return { buffer: processed, mimetype };
    } catch {
        // sharp not available, return original
        return { buffer, mimetype };
    }
}

const upload = (folder = 'general') => {
    // Always use memoryStorage — we never write to disk
    const storage = multer.memoryStorage();
    const multerInstance = multer({
        storage,
        fileFilter,
        limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
    });

    const originalSingle = multerInstance.single.bind(multerInstance);
    multerInstance.single = (fieldName) => {
        const multerMiddleware = originalSingle(fieldName);
        return async (req, res, next) => {
            multerMiddleware(req, res, async (err) => {
                if (err) return next(err);
                if (!req.file) return next();

                try {
                    if (cloudinaryConfigured) {
                        // Upload to Cloudinary
                        const cloudinary = require('cloudinary').v2;
                        const b64 = req.file.buffer.toString('base64');
                        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                        const result = await cloudinary.uploader.upload(dataURI, {
                            folder: `abpharma/${folder}`,
                            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                        });
                        req.file.path = result.secure_url;
                        req.file.filename = result.public_id;
                        console.log('☁️  Cloudinary upload:', req.file.path.substring(0, 80));
                    } else {
                        // Compress and convert to base64 data URI for database storage
                        const { buffer, mimetype } = await processImage(req.file.buffer, req.file.mimetype);
                        const base64 = buffer.toString('base64');
                        req.file.path = `data:${mimetype};base64,${base64}`;
                        req.file.filename = `${folder}_${Date.now()}`;
                        console.log('💾 DB storage: base64 image (%d bytes)', buffer.length);
                    }
                    next();
                } catch (uploadErr) {
                    console.error('Image processing failed:', uploadErr.message);
                    next(uploadErr);
                }
            });
        };
    };

    return multerInstance;
};

module.exports = upload;
