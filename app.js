const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 1MB limit
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myFile'); 

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Express route
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({
                    status : false,
                    message : "File size is too large! Maximum size is 5MB"
                });
            } else {
                res.send(err);
            }
        } else {
            if(req.file == undefined){
                res.json({
                    status : false,
                    message : 'Error: No File Selected!'
                });
            } else {
                res.json({
                    status : true,
                    message : `File Uploaded: ${req.file.filename}`
                });
            }
        }
    });
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
