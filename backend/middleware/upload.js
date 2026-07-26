const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Smart upload middleware:
 *  - If CLOUDINARY env vars are set → buffer in memory, upload to Cloudinary via SDK
 *  - Otherwise → save to local disk
 *
 * Always normalizes req.file.path to be a web-accessible URL path.
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

/**
 * Wraps a multer instance so that after processing:
 * - If Cloudinary was used: req.file.path = https:// Cloudinary URL (set by SDK upload)
 * - If disk storage was used: req.file.path = /uploads/<folder>/<filename> (web URL, NOT filesystem path)
 */
function wrapMulter(multerInstance, folder) {
    const originalSingle = multerInstance.single.bind(multerInstance);
    multerInstance.single = (fieldName) => {
        const multerMiddleware = originalSingle(fieldName);
        return (req, res, next) => {
            multerMiddleware(req, res, (err) => {
                if (err) return next(err);
                if (!req.file) return next();

                // For disk storage: multer sets req.file.path to the full filesystem path.
                // We need to replace it with the web-accessible URL path.
                if (!cloudinaryConfigured && req.file.path && !req.file.path.startsWith('http')) {
                    req.file.path = `/uploads/${folder}/${req.file.filename}`;
                    console.log('📁 Disk upload:', req.file.path);
                }

                next();
            });
        };
    };
    return multerInstance;
}

const upload = (folder = 'general') => {
    if (cloudinaryConfigured) {
        const storage = multer.memoryStorage();
        const multerInstance = multer({
            storage,
            fileFilter,
            limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
        });

        // Override .single() to upload buffer to Cloudinary after multer processes it
        const originalSingle = multerInstance.single.bind(multerInstance);
        multerInstance.single = (fieldName) => {
            const multerMiddleware = originalSingle(fieldName);
            return async (req, res, next) => {
                multerMiddleware(req, res, async (err) => {
                    if (err) return next(err);
                    if (!req.file) return next();

                    try {
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
                        next();
                    } catch (uploadErr) {
                        console.error('Cloudinary upload failed:', uploadErr.message);
                        next(uploadErr);
                    }
                });
            };
        };

        return multerInstance;
    }

    // Local disk storage
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
    const multerInstance = multer({ storage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 } });

    return wrapMulter(multerInstance, folder);
};

module.exports = upload;
