const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    sneaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Sneaker' },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    completedAt: { type: Date, default: Date.now },
    rating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
