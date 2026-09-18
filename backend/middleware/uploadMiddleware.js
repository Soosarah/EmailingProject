const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const extension =
        path.extname(file.originalname).toLowerCase();

    if (extension !== ".csv") {
        return cb(
            new Error("Only CSV files are allowed.")
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;