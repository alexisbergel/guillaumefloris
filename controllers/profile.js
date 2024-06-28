const mysql = require('../config/database');
const fs = require('fs');
const path = require('path');

const dirname = path.resolve(__dirname, '..', 'public', 'images', 'users') + '/';



/* Functions */

// Removes all files when user updates his cover image or profile image
function deleteFilesForNames(names) {
    let paths = [];

    for (let name of names) {
        const filename = name.split('.')[0];
        const extension = '.' + name.split('.')[1];

        paths.push(
            dirname + filename + extension,
            dirname + filename + '_1080.jpg',
            dirname + filename + '_2160.jpg'
        );
    }

    paths.forEach((path) => {
        fs.unlink(path, (error) => {
            if (error) console.log('Error while deleting files: ' + error);
        })
    });
}



/* Routes */

// Updates user informations (fullname, description, cover, profile photo)
exports.update = async (req, res) => {
    const userId = req.userId;

    // Prepares fullname, description, cover filename, profile filename
    let filesToDelete = [];
    const { fullname, description } = req.body;
    const coverFileName = req.files['file2'] ? req.files['file2'][0].filename : null;
    const profileFileName = req.files['file'] ? req.files['file'][0].filename : null;

    try {
        let args = ['fullname = ?, description = ?'];
        let values = [fullname, description];

        // Gets older profile and cover filenames (in case user loads new ones)
        const filenamesQuery = `SELECT profile_photo, cover_photo FROM user WHERE id = ?`;
        const [filenames] = await mysql.execute(filenamesQuery, [req.userId]);

        // Checks if user provides a cover image
        if (coverFileName) {
            args.push(' cover_photo = ?');
            values.push(coverFileName);
            if (filenames[0].cover_photo) filesToDelete.push(filenames[0].cover_photo);
        }

        // Checks if user provides a profile image
        if (profileFileName) {
            args.push(' profile_photo = ?');
            values.push(profileFileName);
            if (filenames[0].profile_photo) filesToDelete.push(filenames[0].profile_photo);
        }

        values.push(userId);

        // Query for updating data to the user table
        const query = `UPDATE user SET ${args} WHERE id = ?`;
        await mysql.execute(query, values);

        // Removes older files if update query succeeds 
        deleteFilesForNames(filesToDelete);

        return res.json({message:'success'});
    
    } catch (error) {
        // Gets provided new files and deletes them if an error occurs
        if (coverFileName) filesToDelete.push(coverFileName);
        if (profileFileName) filesToDelete.push(profileFileName);
        deleteFilesForNames(filesToDelete);

        console.log('Error while updating profile: ' + error);
        return res.status(400).send({error: 'Error while updating profile'});
    }
}