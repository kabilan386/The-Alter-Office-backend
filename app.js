const express = require('express');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
var fs = require('fs');
const app = express();
const db = require('./db.js');
const Image = require('./imageModal.js');
app.use(cors())
// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

app.use('/images', express.static('uploads'));

// Express route

app.get('/get-image', async (req, res) => {
    const allImages = await Image.find({});
    res.json({
        status: true,
        images: allImages
    })
})
app.get('/update-avatar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const removeState = await Image.findOneAndUpdate({ dbState : true }, { dbState : false });
        const findImage = await Image.findByIdAndUpdate({ _id: id }, { dbState : true });
        if(findImage){
            res.json({
                status: true,
                message: `Profile updated successfully`
            });
        }
    } catch (error) {
        
    }
})
app.delete('/remove/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const findImage = await Image.findById({ _id: id });
        fs.unlink(`./uploads/${findImage.url}`, async function () {
            await Image.deleteOne({ _id: id })
            res.json({
                status: true,
                message: `File removed successfully`
            });
        })
    } catch (error) {
        console.log("error")
    }
})
app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({
                    status: false,
                    message: "File size is too large! Maximum size is 5MB"
                });
            } else {
                res.send(err);
            }
        } else {
            if (req.file == undefined) {
                res.json({
                    status: false,
                    message: 'Error: No File Selected!'
                });
            } else {

                const newImage = new Image({
                    url: req.file.filename,
                    size: req.file.size
                });

                await newImage.save();

                res.json({
                    status: true,
                    message: `File Uploaded: ${req.file.filename}`
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
