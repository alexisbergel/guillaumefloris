const sharp = require('sharp');

// Resize function for post upload() or patch()
exports.resizePost = async function(file) {
    const destinationPath = 'public/images/resized';
    const filename = file.filename.split('.')[0];
    
    const resize720 = sharp(file.path)
    .resize(720, 720, { fit: sharp.fit.inside, withoutEnlargement: true })
    .jpeg({ quality: 100 })
    .toFile(destinationPath + '/' + filename + '_720.jpg');

    const resize1080 = sharp(file.path)
        .resize(1080, 1080, { fit: sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 100 })
        .toFile(destinationPath + '/' + filename + '_1080.jpg');

    const resize2160 = sharp(file.path)
        .resize(2160, 2160, { fit:sharp.fit.inside, withoutEnlargement: true })
        .jpeg({ quality: 100})
        .toFile(destinationPath + '/' + filename + '_2160.jpg');

    try {
        await Promise.all([resize720, resize1080, resize2160]);

    } catch(error) {
        console.log('Sharp - resizePost() - ', error);
    }
}

// Resize function for profile patch() (Cover & Profile picture)
//exports.resizeProfile = async function()

/**
 * ? Pour le moment, je garde le fichier original dans le dossier /images/posts dans son format d'origine
 * ? et le nom du fichier dans la BDD est aussi celui d'origine (.png, .jpg ou .jpeg)
 */