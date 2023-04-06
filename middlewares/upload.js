import multer from 'multer';
import HttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

const upload = (mimTypes = []) => multer({
  storage: multer.diskStorage({
    filename(req, file, cb) {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (mimTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(HttpError(422, 'Invalid File Type'), false);
    }
  },
});

export default upload;
