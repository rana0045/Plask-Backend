import mongoose from "mongoose";

const productiveSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    isProductive: {
        type: Boolean,
        required: true
    },
    url: String
});

const Productive = mongoose.model('Productive', productiveSchema);

export default Productive;
