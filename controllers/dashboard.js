const mysql = require('../config/database');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const imageResizer = require('../modules/imageResizer');

const dirname = path.resolve(__dirname, '..', 'public', 'images');


/* Functions */

// Removes all images when deleted or edited
function deleteFilesForName(name) {
    const filename = name.split('.')[0];
    const extension = '.' + name.split('.')[1];
    
    const filesToDelete = [
        dirname + '/posts/' + filename + extension,
        dirname + '/resized/' + filename + '_720.jpg',
        dirname + '/resized/' + filename + '_1080.jpg',
        dirname + '/resized/' + filename + '_2160.jpg'
    ];

    filesToDelete.forEach((path) => {
        fs.unlink(path, (error) => {
            if (error) console.log('Error while deleting files: ' + error);
        });
    });
}

// Returns uploaded image orientation (needed in database) - Portrait | Landscape | Square
function imageOrientation(filePath) {
    // sizeOf is a synchronous operation
    const size = sizeOf(filePath);
    const imageRatio = size.width / size.height;

    return imageRatio < 1 ? 'portrait' : imageRatio > 1 ? 'landscape' : 'square';
}



/* Routes */

// Loads the main page
exports.mainPage = async (req, res, next) => {
    const { userId } = req;

    try {
        const userQuery = `SELECT fullname, description, profile_photo, cover_photo FROM user WHERE id = ?`;
        const postQuery = `SELECT post.*, tag.name as tagName FROM post LEFT JOIN tag ON post.tag_id = tag.id WHERE post.user_id = ? ORDER BY date DESC`;
        const tagQuery = `SELECT * FROM tag`;

        const [[user], [posts], [tags]] = await Promise.all([
            mysql.execute(userQuery, [userId]),
            mysql.execute(postQuery, [userId]),
            mysql.execute(tagQuery)
        ]);

        if (user.length === 0) {
            const error = new Error('User not found while loading dashboard');
            error.status = 404;
            return next(error);
        }

        return res.render('dashboard', {user:user[0], data:posts, tags:tags});

    } catch (error) {
        next(error);
    }
};



// Post management

exports.newPost = async (req, res, next) => {
    const { userId } = req; 
    const { title, description } = req.body;
    const filename = req.file.filename;

    // Checks if args are type of string && if title, description and file are provided
    if (typeof title !== 'string' || typeof description !== 'string' || typeof filename !== 'string') {
        return res.status(400).send('Error with provided data');
    }

    if (title.trim().length === 0 || description.trim().length === 0 || !req.file) {
        return res.status(400).send('Title, description or file is missing');
    }

    // Tag
    let tagId = Number(req.body.tagId);
    tagId = isNaN(tagId) ? null : tagId;

    // Visible | Show / hide post (with a "/")
    const visible = (title.trim().charAt(0) === "/") ? 0 : 1;

    // Orientation : Potrait | Landscape | Square
    const orientation = imageOrientation(req.file.path);

    // INSERT query
    try {
        const query = `INSERT INTO post (title, description, filename, user_id, is_visible, orientation, tag_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [createdPost] = await mysql.execute(query, [title, description, filename, userId, visible, orientation, tagId]);
        
        if (createdPost.affectedRows === 0) {
            const error = new Error('Error while inserting post');
            error.status = 500;
            return next(error);
        }

        // Resizes images async
        if (req.file) {
            imageResizer.resizePost(req.file);
        }

        res.status(200).json({filename:filename});
    
    } catch (error) {
        // Deletes files if an error occurs
        deleteFilesForName(filename);

        next(error);
    }
};

exports.patchPost = async (req, res, next) => {
    const postId = req.params.id;
    const { userId } = req;
    const { title, description } = req.body;
    let fileToDelete = null;

    // Original data
    // and checks if user is the owner of the edited post
    let originalFilename = null;
    let originalTagId = null;

    try {
        const query = `SELECT filename, tag_id FROM post WHERE id = ? AND user_id = ?`;
        const [originalData] = await mysql.execute(query, [postId, userId]);

        if (originalData.length === 0) {
            const error = new Error('Edited post doesn\'t exist');
            error.status = 400;
            return next(error);
        }

        originalFilename = originalData[0].filename;
        originalTagId = originalData[0].tag_id;

    } catch(error) {
        return next(error);
    }

    // Checks if args are type of string && if title and description are provided
    if (typeof title !== 'string' || typeof description !== 'string') {
        return res.status(400).send('Error with provided data');
    }

    if (title.trim().length === 0 || description.length === 0) {
        return res.status(400).send('Title or description is missing');
    }

    let args = [];
    let values = [];

    // Title
    args.push('title = ?');
    values.push(title);

    // Description
    args.push('description = ?');
    values.push(description);

    // File
    if (req.file) {
        // If an older file exists, add it to fileToDelete to delete it after the post is updated in DB
        if (originalFilename) fileToDelete = originalFilename;

        // New file
        args.push('filename = ?');
        values.push(req.file.filename);

        // Updates uploaded image orienation : Potrait | Landscape | Square
        args.push('orientation = ?');
        values.push(imageOrientation(req.file.path));
    }

    // Tag
    let tagId = Number(req.body.tagId);
    tagId = isNaN(tagId) ? null : tagId;
    console.log(req.body.tagId);

    if (tagId !== originalTagId) {
        args.push('tag_id = ?');
        values.push(tagId);
    }

    // Toggle the visible parameter if user adds a '/' at the beginning of the title
    // visible is a boolean : 1 - visible | 0 - invisible
    const isVisible = (title.trim().charAt(0) === "/") ? 0 : 1;
    args.push('is_visible = ?');
    values.push(isVisible);

    // Adds postId & userId for the UPDATE request
    values.push(postId);
    values.push(userId);

    // Update request
    try {
        const query = `UPDATE post SET ${args.join(', ')} WHERE id = ? AND user_id = ?`;
        const [updateQueryResult] = await mysql.execute(query, values);

        if (updateQueryResult.affectedRows === 0) {
            const error = new Error(`Error while updating post for id ${postId}, no post found`);
            error.status = 400;
            return next(error);
        }

        // Deletes previous filename (if a new one provided)
        if (fileToDelete) deleteFilesForName(fileToDelete);

        // Resizes images async
        if (req.file) {
            imageResizer.resizePost(req.file);
        }

        res.json({id:req.params.id});
        
    } catch(error) {
        // If an error occurs and user uploaded a file, remove this file
        if (req.file) {
            deleteFilesForName(req.file.filename);
        }

        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.id;
    const { userId } = req;
    
    try {
        // Gets filename to remove 
        const filenameQuery = `SELECT filename FROM post WHERE id = ? AND user_id = ?`;
        const [filenameQueryResult] = await mysql.execute(filenameQuery, [postId, userId]);

        // There is a file ? 
        if (filenameQueryResult.length === 0) {
            const error = new Error('No file found for deleting post');
            error.status = 400;
            return next(error);
        }

        const filename = filenameQueryResult[0].filename ?? '';

        // Deletes post in databse
        const deleteQuery = `DELETE FROM post WHERE id = ? AND user_id = ?`;
        const [deleteQueryResult] = await mysql.execute(deleteQuery, [postId, userId]);

        if (deleteQueryResult.affectedRows === 0) {
            const error = new Error('No post found for deleting post in database');
            error.status = 400;
            return next(error);
        }

        // Removes files async
        deleteFilesForName(filename);

        res.json({message:'post deleted with success'});

    } catch (error) {
        next(error);
    }
};