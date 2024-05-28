const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

    name : String,
    address: String,
    city: String,
    houseNo : Number,
    state: String,
    country : String,
    zipCode: Number,
    mobile : Number,
    default: {
        type: Boolean,
        default: false // Or true, depending on your default value
    }

});

const addressDB = mongoose.model('addressdb',addressSchema);

module.exports = addressDB;