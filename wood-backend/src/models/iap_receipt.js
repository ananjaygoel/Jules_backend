const mongoose = require('mongoose');

const iapReceiptSchema = new mongoose.Schema({
  platform: { type: String, enum: ['android', 'ios'], required: true },
  type: { type: String, enum: ['inapp', 'subs'], required: true },
  productId: { type: String, required: true },
  token: { type: String, required: true, unique: true, index: true },
  orderId: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['verified', 'revoked'], default: 'verified' },
}, { timestamps: true });

module.exports = mongoose.model('IapReceipt', iapReceiptSchema);
