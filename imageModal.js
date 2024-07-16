const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: String, // Assuming you're storing URLs of images
    dbState: {
        type : Boolean,
        default: false,
    },
    size : String
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;