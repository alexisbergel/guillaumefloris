const sharp = require('sharp');

/*exports.resizePost = (req, res, next) => {
    if (!req.file) return next();
    
    const destinationPath = 'public/images/resized';

    const fileName = req.file.filename.split('.');

    const resize720 = sharp(req.file.path)
    .resize(720, 720, { fit: sharp.fit.inside, withoutEnlargement: true })
    .jpeg({ quality: 100 })
    .toFile(destinationPath + '/' + fileName[0] + '_720.jpg');

    const resize1080 = sharp(req.file.path)
        .resize(1080, 1080, { fit: sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 100 })
        .toFile(destinationPath + '/' + fileName[0] + '_1080.jpg');

    const resize2160 = sharp(req.file.path)
        .resize(2160, 2160, { fit:sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 100})
        .toFile(destinationPath + '/' + fileName[0] + '_2160.jpg');

    Promise.all([resize720, resize1080, resize2160])
        .then(() => {
            console.log('Images had been resized');
        })
        .catch((error) => {
            console.log('Sharp - resizePost() - ', error);
        });
    
    next();
};*/

exports.resizeProfile = (req, res, next) => {
    if (!req.files) return next();

    const profilePicture = req.files['file'] ? req.files['file'][0] : null;
    const cover = req.files['file2'] ? req.files['file2'][0] : null;

    const imagesToResize = [];
    const destinationPath = 'public/images/users';

    if (profilePicture) {

        let fileName = profilePicture.filename.split('.');
        fileName = fileName[0] + '_1080.jpg';

        const profilePicture1080 = sharp(profilePicture.path)
            .resize(1080, 1080, { fit: sharp.fit.cover, withoutEnlargement: true })
            .jpeg({ quality: 100 })
            .toFile(destinationPath + '/' + fileName);

        imagesToResize.push(profilePicture1080);
    }

    if (cover) {
        const filename = cover.filename.split('.')[0];

        const resize1080 = sharp(cover.path)
            .resize(1080, 1080, { fit: sharp.fit.inside, withoutEnlargement: true })
            .jpeg({ quality: 100 })
            .toFile(destinationPath + '/' + filename + '_1080.jpg');

        const resize2160 = sharp(cover.path)
            .resize(2160, 2160, { fit: sharp.fit.inside, withoutEnlargement: true })
            .jpeg({ quality: 100 })
            .toFile(destinationPath + '/' + filename + '_2160.jpg')

        imagesToResize.push(resize1080, resize2160);
    }

    Promise.all(imagesToResize)
        .then(() => {
            console.log('Images had been resized');
        })
        .catch((error) => {
            console.log('Sharp - resizeProfile() - ', error);
        })

    next();
}

/**
 * ? Pour le moment, je garde le fichier original dans le dossier /images/posts dans son format d'origine
 * ? et le nom du fichier dans la BDD est aussi celui d'origine (.png, .jpg ou .jpeg)
 */