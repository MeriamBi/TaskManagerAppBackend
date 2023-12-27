import multer, { diskStorage } from "multer";
import path, { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

export default function (image) {
    return multer({
        storage: diskStorage({
            destination: (req, file, callback) => {
                const __dirname = dirname(fileURLToPath(import.meta.url));
                callback(null, join(__dirname, "../public/images"));
            },
            filename: (req, file, callback) => {
                const uniqueFilename = `${file.originalname}-${Date.now()}${extname(file.originalname)}`;
                callback(null, uniqueFilename);
            },
        }),
        limits: 10 * 1024 * 1024,
    }).single(image);
}