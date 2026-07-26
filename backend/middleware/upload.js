const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Smart upload middleware:
 *  - If CLOUDINARY_CLOUD_NAME env var is set → upload to Cloudinary (production / Render)
 *  - Otherwise → save to local disk (development)
 *
 * Cloudinary URLs are full https:// links; local disk paths are /uploads/<folder>/<filename>
 * Both formats are handled by the getImageUrl() helper on the frontend.
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
    console.log('💾  Local disk image storage (set CLOUDINARY_* env vars for production)');
}

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
};

const upload = (folder = 'general') => {
    if (cloudinaryConfigured) {
        const { CloudinaryStorage } = require('multer-storage-cloudinary');
        const cloudinary = require('cloudinary').v2;
        const storage = new CloudinaryStorage({
            cloudinary,
            params: {
                folder: `abpharma/${folder}`,
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
        });
        return multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 } });
    }

    // Local disk storage (development)
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '..', 'uploads', folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, unique + path.extname(file.originalname));
        },
    });
    return multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 } });
};

module.exports = upload;
