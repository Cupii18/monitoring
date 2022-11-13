const multer = require('multer');
const path = require('path');
const random_text = require('../config/random_text');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../img/petugas'));
  },
  filename: function (req, file, cb) {
    cb(null, random_text.random(15) + path.extname(file.originalname));
  }
})

const imageFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb("File yang diupload harus berupa gambar", false);
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: imageFilter
});

module.exports = upload;
