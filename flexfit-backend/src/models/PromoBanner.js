const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
    },
    ctaLink: {
      type: String,
      default: '/products',
    },
    bgGradient: {
      type: String,
      default: 'from-brand-600 to-purple-700',
    },
    emoji: {
      type: String,
      default: '🎉',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    priority: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
