const multer = require('multer');

function randomNumber() {
    return Math.floor(Math.random() * (10000 - 5000) + 5000);
}

const postStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images/posts');
    },
    filename: (req, file, callback) => {
        let extension = file.originalname.split('.');
        extension = extension[extension.length - 1];

        const name = String(Date.now()) + String(randomNumber()) + '.' + extension;
        callback(null, name);
    }
});

const profilePictureStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images/users');
    },
    filename: (req, file, callback) => {
        let extension = file.originalname.split('.');
        extension = extension[extension.length - 1];

        const name = String(Date.now()) + String(randomNumber()) + '.' + extension;
        callback(null, name);
    }
});

const filterFileType = function(req, file, cb) {
    const validFileTypes = /jpeg|jpg|png/;
    const isValid = validFileTypes.test(file.mimetype);

    if (isValid) {
        return cb(null, true);
    } else {
        console.log('mauvais format');
        console.log(file.mimetype);
        const error = new Error('Unsupported file type');
        error.details = 'Type de fichier non supporté';
        return cb(error, false);
    }
}


// TODO : Régler ces noms 'file' qui ne veulent rien dire, tout est interconnecté avec ce nom dans le front et sharp
exports.post = multer({storage:postStorage, fileFilter:filterFileType}).single('file');
exports.profilePicture = multer({storage:profilePictureStorage, fileFilter:filterFileType}).fields([
    { name: 'file', maxCount: 1 },
    { name: 'file2', maxCount: 1}
]);