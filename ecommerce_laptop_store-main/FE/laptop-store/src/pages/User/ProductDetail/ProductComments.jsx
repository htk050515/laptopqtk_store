import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import userApi from '../../../api/UserApi/userApi';
import Swal from 'sweetalert2';
import { getAccessTokenFromLS } from '../../../utils/auth';

const ProductComments = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination/Load More state
    const [displayedReviews, setDisplayedReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const reviewsPerPage = 3; // Show 3 reviews at a time

    const access_token = getAccessTokenFromLS();

    // Fetch reviews for this product
    const fetchReviews = async () => {
        console.log('Fetching reviews for product ID:', productId);
        setIsLoading(true);
        try {
            const response = await userApi.getReviewsByProduct(productId);
            console.log('Reviews API response:', response);

            // Filter only approved reviews
            const approvedReviews = response.data.reviews.filter(review => review.status === "approved");
            console.log('Approved reviews:', approvedReviews);
            setReviews(approvedReviews);

            // Initialize displayed reviews with the first batch
            loadReviews(approvedReviews, 1);

            // Calculate average rating
            if (approvedReviews.length > 0) {
                const sum = approvedReviews.reduce((total, review) => total + review.rating, 0);
                const avg = sum / approvedReviews.length;
                console.log('Average rating calculation:', { sum, count: approvedReviews.length, average: avg });
                setAverageRating(avg);
            } else {
                console.log('No approved reviews found, setting average to 0');
                setAverageRating(0);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            console.log('Error details:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Load a specific page of reviews
    const loadReviews = (allReviews, page) => {
        const startIndex = 0;
        const endIndex = page * reviewsPerPage;
        const displayed = allReviews.slice(startIndex, endIndex);

        setDisplayedReviews(displayed);
        setCurrentPage(page);
        setHasMore(endIndex < allReviews.length);
    };

    // Load more reviews when button is clicked
    const handleLoadMore = () => {
        loadReviews(reviews, currentPage + 1);
    };

    useEffect(() => {
        console.log('Component mounted with productId:', productId, 'and access_token:', access_token ? 'present' : 'missing');
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!access_token) {
            Swal.fire({
                title: 'Cần đăng nhập!',
                text: 'Bạn cần đăng nhập để gửi đánh giá.',
                icon: 'warning',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        if (comment.trim() && rating > 0) {
            console.log('Submitting review with rating:', rating, 'and comment:', comment);
            setIsSubmitting(true);

            try {
                // Create review payload with required fields
                const reviewData = {
                    product_id: productId,
                    rating: rating,
                    comment: comment
                };
                console.log('Review payload:', reviewData);

                const response = await userApi.createReview(access_token, reviewData);
                console.log('Create review response:', response);

                // Clear form
                setComment('');
                setRating(5);

                // Refresh reviews
                fetchReviews();

                // Show success message with SweetAlert
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Cảm ơn bạn đã gửi đánh giá. Đánh giá sẽ được hiển thị sau khi được phê duyệt.',
                    icon: 'success',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#2563eb'
                });
            } catch (error) {
                console.error("Error submitting review:", error);
                console.log('Error details:', error.response?.data || error.message);

                // Show error message with SweetAlert
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.',
                    icon: 'error',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#2563eb'
                });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log('Validation failed - comment or rating missing');
            // Show validation error with SweetAlert
            Swal.fire({
                title: 'Thiếu thông tin!',
                text: 'Vui lòng nhập đánh giá và bình luận của bạn.',
                icon: 'warning',
                confirmButtonText: 'Đóng',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Star rating component
    const StarRating = ({ rating, size = "text-xl", onRatingChange = null }) => (
        <div className={`flex ${size}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    type="button"
                    key={star}
                    onClick={() => onRatingChange && onRatingChange(star)}
                    className={`mr-1 focus:outline-none ${!onRatingChange ? 'cursor-default' : ''}`}
                    disabled={!onRatingChange}
                >
                    <FontAwesomeIcon
                        icon={star <= rating ? solidStar : regularStar}
                        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <div className="mt-8">
            {/* Overall Rating Display */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="text-sm text-gray-600">({reviews.length} đánh giá)</span>
                </div>
            </div>

            {/* New Review Form */}
            <h2 className="text-xl font-bold mb-2">Gửi đánh giá của bạn</h2>
            <form onSubmit={handleCommentSubmit} className="mb-6 p-4 border rounded-lg w-full">
                <div className="mb-3 w-full">
                    <label className="block mb-2">Đánh giá:</label>
                    <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <div className="mb-3 w-full">
                    <label htmlFor="comment" className="block mb-2">Nhận xét:</label>
                    <textarea
                        id="comment"
                        className="w-full border p-2 rounded"
                        rows="3"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-[#2563eb] text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            Đang gửi...
                        </span>
                    ) : 'Gửi đánh giá'}
                </button>
            </form>

            {/* Reviews List */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Đánh giá từ khách hàng</h2>
                <div className="text-sm text-gray-500">
                    {reviews.length > 0 && `Hiển thị ${displayedReviews.length} / ${reviews.length} đánh giá`}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-gray-400" />
                    <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {displayedReviews.length > 0 ? (
                            displayedReviews.map((review) => (
                                <div key={review.id} className="border p-4 rounded-lg transition duration-200 hover:shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium">{review.user.name}</div>
                                            <div className="flex text-yellow-400 my-1">
                                                <StarRating rating={review.rating} size="text-sm" />
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatDate(review.created_at)}
                                        </div>
                                    </div>
                                    <p className="mb-3">{review.comment}</p>

                                    {/* Shop Replies */}
                                    {review.replies && review.replies.length > 0 && (
                                        <div className="ml-6 mt-3 border-l-2 border-gray-200 pl-4">
                                            {review.replies.map(reply => (
                                                <div key={reply.id} className="mb-2 bg-gray-50 p-3 rounded">
                                                    <div className="font-medium text-sm mb-1">Shop trả lời:</div>
                                                    <p>{reply.content}</p>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {formatDate(reply.created_at)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 py-4 text-center">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                        )}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-2 border border-[#2563eb] text-[#2563eb] rounded-full hover:bg-[#2563eb] hover:text-white transition duration-300"
                            >
                                Xem thêm đánh giá
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductComments;