import mongoose, { Schema } from "mongoose";

const CartSchema = new Schema({
    sneaker: {type:mongoose.Schema.ObjectId, ref: "Sneaker"},
    quantity: {
        type: Number,
        default: 0
    }
})

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart