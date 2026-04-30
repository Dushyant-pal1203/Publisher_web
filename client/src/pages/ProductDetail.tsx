import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Button } from "@/components/common/Button";
import { Footer } from "@/components/Layout/Footer";
import { articleAPI, reviewsAPI } from "@/lib/api";
import {
  BookOpen,
  Star,
  ChevronRight,
  Calendar,
  User,
  Package,
  Heart,
  ShoppingCart,
  Share2,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  Filter,
  SortAsc,
  AlertCircle,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

type Article = {
  id: number;
  title: string;
  author: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  cover_image_url: string | null;
  category: string | null;
  isbn: string | null;
  published_year: number | null;
  page_count: number | null;
  language: string | null;
  publisher: string | null;
  stock_quantity: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
};

type Review = {
  id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
};

type ReviewStats = {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

type ReviewSubmission = {
  rating: number;
  title: string;
  comment: string;
  product_id: number;
  user_name: string;
  user_email: string;
};

const getImageUrl = (url: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${baseUrl}${url}`;
};

const StarRating = ({
  rating,
  size = "md",
  showNumber = false,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}) => {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i < fullStars
                ? "text-yellow-400 fill-current"
                : i === fullStars && hasHalfStar
                  ? "text-yellow-400 fill-current opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

const RelatedArticleCard = ({
  article,
  onClick,
}: {
  article: Article;
  onClick: () => void;
}) => {
  const imageUrl = getImageUrl(article.cover_image_url);
  const [imageError, setImageError] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "book":
        return "bg-purple-100 text-purple-700";
      case "journal":
        return "bg-blue-100 text-blue-700";
      case "magazine":
        return "bg-pink-100 text-pink-700";
      case "newspaper":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${getTypeColor(article.type)}`}
          >
            {article.type}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600">
          {article.title}
        </h4>
        <p className="text-xs text-gray-500 mb-2">{article.author}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">
            {article.currency === "INR"
              ? "₹"
              : article.currency === "USD"
                ? "$"
                : "€"}
            {article.price.toLocaleString()}
          </span>
          <Button className="text-xs text-blue-600 hover:bg-gray-100 hover:text-blue-700 font-medium">
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);

  const handleHelpful = async () => {
    if (!helpful) {
      try {
        await reviewsAPI.markHelpful(review.id);
        setHelpful(true);
        setHelpfulCount(helpfulCount + 1);
        toast.success("Thanks for your feedback!");
      } catch (error) {
        console.error("Failed to mark as helpful:", error);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="font-semibold text-gray-900">{review.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{review.user_name}</span>
            {review.verified_purchase && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Verified Purchase
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 mt-2 text-sm">{review.comment}</p>
      <Button
        onClick={handleHelpful}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mt-3 transition-colors"
      >
        <ThumbsUp
          className={`h-3 w-3 ${helpful ? "fill-current text-blue-600" : ""}`}
        />
        Helpful ({helpfulCount})
      </Button>
    </div>
  );
};

const ReviewForm = ({
  onSubmit,
  productId,
}: {
  onSubmit: (review: ReviewSubmission) => void;
  productId: number;
}) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!title.trim()) {
      toast.error("Please enter a review title");
      return false;
    }
    if (!comment.trim()) {
      toast.error("Please enter your review");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        title,
        comment,
        product_id: productId,
        user_name: name,
        user_email: email,
      });
      setRating(5);
      setTitle("");
      setComment("");
      setName("");
      setEmail("");
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Email"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Summarize your experience"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your thoughts about this publication..."
          required
        />
      </div>

      <div className="justify-items-center">
        <Button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-gray-50 hover:text-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
};

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Article | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching product with ID:", id);

        // Fetch product details
        const response = await articleAPI.getById(Number(id));
        console.log("Product API response:", response);

        // Handle different response structures
        let productData = null;
        if (response.data?.data) {
          productData = response.data.data;
        } else if (response.data?.article) {
          productData = response.data.article;
        } else if (response.data) {
          productData = response.data;
        } else {
          productData = response;
        }

        if (!productData || !productData.id) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        // Try to fetch related products (if endpoint exists)
        try {
          const relatedResponse = await articleAPI.getRelated(Number(id));
          console.log("Related products response:", relatedResponse);

          let relatedData = [];
          if (relatedResponse.data?.data) {
            relatedData = relatedResponse.data.data;
          } else if (relatedResponse.data?.articles) {
            relatedData = relatedResponse.data.articles;
          } else if (Array.isArray(relatedResponse.data)) {
            relatedData = relatedResponse.data;
          }
          setRelatedProducts(relatedData);
        } catch (relatedError) {
          console.log("Related products not available:", relatedError);
          // Don't show error for related products, just set empty array
          setRelatedProducts([]);
        }

        // Try to fetch reviews (if endpoint exists)
        try {
          const [reviewsRes, statsRes] = await Promise.all([
            reviewsAPI.getProductReviews(Number(id)),
            reviewsAPI.getReviewStats(Number(id)),
          ]);

          let reviewsData = [];
          if (reviewsRes.data?.data) {
            reviewsData = reviewsRes.data.data;
          } else if (Array.isArray(reviewsRes.data)) {
            reviewsData = reviewsRes.data;
          }
          setReviews(reviewsData);

          let statsData = null;
          if (statsRes.data?.data) {
            statsData = statsRes.data.data;
          } else if (statsRes.data) {
            statsData = statsRes.data;
          }
          setReviewStats(statsData);
        } catch (reviewError) {
          console.log("Reviews not available:", reviewError);
          // Don't show error for reviews, just set empty
          setReviews([]);
          setReviewStats(null);
        }
      } catch (error: any) {
        console.error("Failed to fetch product details:", error);
        setError(error.message || "Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    } else {
      setLoading(false);
      setError("Invalid product ID");
    }
  }, [id]);

  const handleSubmitReview = async (reviewData: ReviewSubmission) => {
    const response = await reviewsAPI.create(reviewData);
    const newReview = response.data;
    setReviews([newReview, ...reviews]);

    if (reviewStats) {
      const newAvg =
        (reviewStats.average_rating * reviewStats.total_reviews +
          reviewData.rating) /
        (reviewStats.total_reviews + 1);
      setReviewStats({
        ...reviewStats,
        average_rating: newAvg,
        total_reviews: reviewStats.total_reviews + 1,
        rating_distribution: {
          ...reviewStats.rating_distribution,
          [reviewData.rating]:
            reviewStats.rating_distribution[
              reviewData.rating as keyof typeof reviewStats.rating_distribution
            ] + 1,
        },
      });
    }
  };

  const handleAddToCart = () => {
    toast.success(
      `Added ${quantity} ${quantity === 1 ? "copy" : "copies"} of "${product?.title}" to cart`,
    );
  };

  const handleQuantityChange = (delta: number) => {
    if (product) {
      setQuantity(
        Math.max(1, Math.min(product.stock_quantity, quantity + delta)),
      );
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({ title: product?.title, url });
    } catch {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-24 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-6 py-5">
          <Button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The publication you're looking for doesn't exist or has been removed."}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = getImageUrl(product.cover_image_url);
  const isInStock = product.in_stock && product.stock_quantity > 0;

  return (
    <div>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-5">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:bg-gray-100 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row justify-between gap-24 mb-16">
          <div className="w-auto md:w-96">
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-fit hover:scale-105 transition-transform duration-500"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-32 w-32 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 w-auto md:w-[60%] h-[550px] overflow-y-auto hide-scrollbar rounded-3xl bg-slate-100 p-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                    product.type === "book"
                      ? "bg-purple-100 text-purple-700"
                      : product.type === "journal"
                        ? "bg-blue-100 text-blue-700"
                        : product.type === "magazine"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-green-100 text-green-700"
                  }`}
                >
                  {product.type}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.title}
              </h1>

              <p className="text-gray-600 flex items-center gap-2 mb-4">
                <User className="h-5 w-5" />
                by {product.author}
              </p>

              {reviewStats && reviewStats.total_reviews > 0 && (
                <div className="flex items-center gap-4 mb-4">
                  <StarRating
                    rating={reviewStats.average_rating}
                    size="lg"
                    showNumber
                  />
                  <span className="text-sm text-gray-500">
                    {reviewStats.total_reviews}{" "}
                    {reviewStats.total_reviews === 1 ? "review" : "reviews"}
                  </span>
                  <Button
                    onClick={() => setActiveTab("reviews")}
                    className="text-sm hover:bg-gray-100 hover:text-black hover:underline"
                  >
                    Read all reviews
                  </Button>
                </div>
              )}

              {product.description && (
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {product.currency === "INR"
                    ? "₹"
                    : product.currency === "USD"
                      ? "$"
                      : "€"}
                  {product.price.toLocaleString()}
                </span>
                {isInStock && (
                  <span className="text-green-600 text-sm font-medium">
                    In Stock
                  </span>
                )}
              </div>

              {isInStock ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-2 hover:bg-gray-100 hover:text-black transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <Button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-2 hover:bg-gray-100 hover:text-black transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-gray-50 hover:text-black transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <div className="text-red-600 bg-red-50 p-3 rounded-lg">
                  Out of Stock - This item is currently unavailable
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors">
                <Heart className="h-5 w-5" />
                Save for Later
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {product.publisher && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Publisher:</span>{" "}
                  {product.publisher}
                </p>
              )}
              {product.published_year && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Published:</span>{" "}
                  {product.published_year}
                </p>
              )}
              {product.language && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Language:</span>{" "}
                  {product.language}
                </p>
              )}
              {product.isbn && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">ISBN:</span>{" "}
                  {product.isbn}
                </p>
              )}
              {product.page_count && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Pages:</span>{" "}
                  {product.page_count}
                </p>
              )}
              <p className="text-sm flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span className="font-medium text-gray-700">
                  Available Stock:
                </span>{" "}
                {product.stock_quantity} copies
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Truck className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
                <p className="text-xs text-gray-400">on orders above ₹500</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">7-Day Returns</p>
                <p className="text-xs text-gray-400">Easy replacement</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
                <p className="text-xs text-gray-400">100% protected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 px-1 font-medium transition-colors relative ${
                activeTab === "details"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-1 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Reviews ({reviewStats?.total_reviews || 0})
            </button>
          </div>
        </div>

        <div className="mb-16">
          {activeTab === "details" && (
            <div className="bg-white rounded-3xl p-5">
              <h2 className="text-2xl font-serif text-gray-900 mb-4">
                Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-xl sticky top-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Review Summary
                  </h3>
                  {reviewStats && reviewStats.total_reviews > 0 ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {reviewStats.average_rating.toFixed(1)}
                        </div>
                        <StarRating
                          rating={reviewStats.average_rating}
                          size="lg"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Based on {reviewStats.total_reviews}{" "}
                          {reviewStats.total_reviews === 1
                            ? "review"
                            : "reviews"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            reviewStats.rating_distribution[
                              star as keyof typeof reviewStats.rating_distribution
                            ] || 0;
                          const percentage =
                            (count / reviewStats.total_reviews) * 100;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 w-8">
                                {star} ★
                              </span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-12">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No reviews yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Be the first to review this product
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Write a Review
                  </h3>
                  <ReviewForm
                    onSubmit={handleSubmitReview}
                    productId={product.id}
                  />
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Customer Reviews
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <SortAsc className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Filter className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((related) => (
                <RelatedArticleCard
                  key={related.id}
                  article={related}
                  onClick={() => navigate(`/product/${related.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
