const Review = require('../Models/Review');
const Product = require('../Models/Product');

const AppError = require('../utils/appError');

// Submit a new review
const submitReview = (async (req, res, next) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const review = await Review.create({
        user: req.user._id,
        product: productId,
        rating,
        comment
    });

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
});

// Get all reviews for a specific product
const getProductReviews = (async (req, res, next) => {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
        .populate('user', 'name email');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// Delete a review
const deleteReview = (async (req, res, next) => {
    const { productId, reviewId } = req.params;

    const review = await Review.findOneAndDelete({
        _id: reviewId,
        product: productId
    });

    if (!review) {
        return next(new AppError('Review not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
module.exports = { submitReview, getProductReviews, deleteReview };