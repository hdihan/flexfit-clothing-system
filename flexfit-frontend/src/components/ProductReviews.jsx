import { useState, useEffect } from 'react';
import { Star, Upload, User, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProductReviews({ productId, initialReviews = [] }) {
    const [reviews, setReviews] = useState(initialReviews);
    const { user } = useAuth();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [fitFeedback, setFitFeedback] = useState('True to size');
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter out if user already reviewed
    const hasReviewed = user ? reviews.some(r => r.user === user._id || r.user?._id === user._id) : false;

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(res.data.url);
            }
            setPhotos([...photos, ...uploadedUrls]);
            toast.success('Photos uploaded');
        } catch (err) {
            toast.error('Failed to upload photos');
        } finally {
            setUploading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return toast.error('Please write a review');
        
        setSubmitting(true);
        try {
            await api.post(`/products/${productId}/reviews`, {
                rating,
                comment,
                fitFeedback,
                photos
            });
            toast.success('Review submitted successfully');
            
            // Optimistically add review
            const newReview = {
                _id: Date.now().toString(),
                user: { _id: user._id },
                name: user.name || 'You',
                rating,
                comment,
                fitFeedback,
                photos,
                createdAt: new Date().toISOString()
            };
            setReviews([newReview, ...reviews]);
            setComment('');
            setPhotos([]);
            setRating(5);
            setFitFeedback('True to size');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
            
            {user && !hasReviewed ? (
                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                    <h4 className="font-semibold mb-4">Write a Review</h4>
                    <form onSubmit={submitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        <Star fill={rating >= star ? 'currentColor' : 'none'} size={24} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fit Feedback</label>
                            <select 
                                value={fitFeedback}
                                onChange={(e) => setFitFeedback(e.target.value)}
                                className="input-field max-w-xs"
                            >
                                <option value="Runs small">Runs small</option>
                                <option value="True to size">True to size</option>
                                <option value="Runs large">Runs large</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="3"
                                className="input-field"
                                placeholder="What did you like or dislike about this product?"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional)</label>
                            <div className="flex gap-3 flex-wrap">
                                {photos.map((url, idx) => (
                                    <img key={idx} src={url} alt="Review" className="w-20 h-20 object-cover rounded-lg border" />
                                ))}
                                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                                    <Upload size={20} className="text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting || uploading} className="btn-primary w-full md:w-auto mt-2">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            ) : user && hasReviewed ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-8 flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <p className="text-sm font-medium">You have already reviewed this product.</p>
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-xl mb-8 text-center">
                    <p className="text-sm text-gray-600">Please log in to write a review.</p>
                </div>
            )}

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                                        {review.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{review.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={14} fill={review.rating >= star ? 'currentColor' : 'none'} className={review.rating >= star ? 'text-yellow-400' : 'text-gray-300'} />
                                    ))}
                                </div>
                            </div>

                            {review.fitFeedback && (
                                <p className="text-xs font-medium text-gray-600 mb-2 bg-gray-100 inline-block px-2 py-1 rounded">
                                    Fit: {review.fitFeedback}
                                </p>
                            )}

                            <p className="text-gray-700 text-sm">{review.comment}</p>

                            {review.photos && review.photos.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {review.photos.map((photo, idx) => (
                                        <a href={photo} target="_blank" rel="noopener noreferrer" key={idx}>
                                            <img src={photo} alt="Review" className="w-16 h-16 object-cover rounded-md border shadow-sm hover:opacity-80 transition" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
