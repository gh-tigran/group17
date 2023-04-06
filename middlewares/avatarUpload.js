import multer from 'multer';
import HttpError from 'http-errors';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (['image/png', 'image/jpeg', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid File Type'), false);
    }
  },
});

export default upload.single('avatar');
