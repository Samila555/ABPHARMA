const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Smart upload middleware:
 *  - If CLOUDINARY env vars are set → buffer in memory, upload to Cloudinary via SDK
 *  - Otherwise → save to local disk (development)
 *
 * Uses memoryStorage + direct Cloudinary SDK call to avoid compatibility
 * issues between multer-storage-cloudinary and multer v2.
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
        // Use memoryStorage — buffer is uploaded to Cloudinary via SDK in the route handler
        const storage = multer.memoryStorage();
        const multerInstance = multer({
            storage,
            fileFilter,
            limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
        });

        // Wrap multer to upload the buffered file to Cloudinary after multer processes it
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
                        // Attach Cloudinary info in the format routes expect
                        req.file.path = result.secure_url;
                        req.file.filename = result.public_id;
                        req.file.cloudinary = result;
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
