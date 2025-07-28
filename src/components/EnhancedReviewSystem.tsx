import { useState, useEffect } from "react";
import { Star, Camera, ThumbsUp, MessageSquare, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  customer_id: string;
  provider_id: string;
  booking_id: string;
  rating: number;
  review_text: string;
  review_photos?: string[];
  response_text?: string;
  response_date?: string;
  helpful_count: number;
  dimensions: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  is_verified: boolean;
  created_at: string;
  customer_profile?: Record<string, unknown>;
  provider_profile?: Record<string, unknown>;
}

interface ReviewFormData {
  rating: number;
  reviewText: string;
  dimensions: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  photos: string[];
}

interface EnhancedReviewSystemProps {
  providerId: string;
  bookingId?: string;
  showForm?: boolean;
  onReviewSubmitted?: () => void;
}

const EnhancedReviewSystem = ({ 
  providerId, 
  bookingId, 
  showForm = false, 
  onReviewSubmitted 
}: EnhancedReviewSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    reviewText: "",
    dimensions: {
      quality: 0,
      communication: 0,
      timeliness: 0,
      professionalism: 0
    },
    photos: []
  });

  useEffect(() => {
    fetchReviews();
  }, [providerId]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("provider_reviews")
      .select(`
        *,
        customer_profile:profiles!provider_reviews_customer_id_fkey(full_name, avatar_url)
      `)
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data.map(review => ({
        ...review,
        dimensions: review.dimensions as any || { quality: 0, communication: 0, timeliness: 0, professionalism: 0 }
      })));
      calculateRatingStats(data.map(review => ({
        ...review,
        dimensions: review.dimensions as any || { quality: 0, communication: 0, timeliness: 0, professionalism: 0 }
      })));
    }
  };

  const calculateRatingStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) return;

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(totalRating / reviewsData.length);

    const breakdown: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      breakdown[i] = reviewsData.filter(review => review.rating === i).length;
    }
    setRatingBreakdown(breakdown);
  };

  const handleRatingChange = (category: string, rating: number) => {
    if (category === "overall") {
      setFormData(prev => ({ ...prev, rating }));
    } else {
      setFormData(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [category]: rating }
      }));
    }
  };

  const submitReview = async () => {
    if (!user || !bookingId || formData.rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("provider_reviews")
        .insert({
          customer_id: user.id,
          provider_id: providerId,
          booking_id: bookingId,
          rating: formData.rating,
          review_text: formData.reviewText,
          review_photos: formData.photos,
          dimensions: formData.dimensions
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });

      setShowReviewForm(false);
      setFormData({
        rating: 0,
        reviewText: "",
        dimensions: { quality: 0, communication: 0, timeliness: 0, professionalism: 0 },
        photos: []
      });
      
      fetchReviews();
      onReviewSubmitted?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    // In a real app, you'd track which reviews a user has marked as helpful
    const { error } = await supabase
      .from("provider_reviews")
      .update({ helpful_count: (reviews.find(r => r.id === reviewId)?.helpful_count || 0) + 1 })
      .eq("id", reviewId);

    if (!error) {
      fetchReviews();
    }
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void, interactive = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getDimensionAverage = (dimension: keyof Review["dimensions"]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.dimensions?.[dimension] || 0), 0);
    return total / reviews.length;
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            {showForm && user && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>Write Review</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Overall Rating */}
                    <div className="space-y-2">
                      <Label>Overall Rating</Label>
                      <div className="flex items-center space-x-2">
                        {renderStars(formData.rating, (rating) => handleRatingChange("overall", rating), true)}
                        <span className="text-sm text-muted-foreground ml-2">
                          {formData.rating === 0 ? "Select rating" : `${formData.rating} star${formData.rating !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Dimensional Ratings */}
                    <div className="space-y-4">
                      <Label>Rate Different Aspects</Label>
                      {Object.entries(formData.dimensions).map(([dimension, rating]) => (
                        <div key={dimension} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{dimension}</span>
                          {renderStars(rating, (r) => handleRatingChange(dimension, r), true)}
                        </div>
                      ))}
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                      <Label>Your Review</Label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={formData.reviewText}
                        onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <Label>Add Photos (Optional)</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload photos</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={submitReview} disabled={isSubmitting || formData.rating === 0}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2">
                  <span className="text-sm w-3">{stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <Progress value={(ratingBreakdown[stars] / reviews.length) * 100} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingBreakdown[stars] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimensional Averages */}
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["quality", "communication", "timeliness", "professionalism"].map((dimension) => (
              <div key={dimension} className="text-center">
                <div className="text-lg font-semibold">
                  {getDimensionAverage(dimension as keyof Review["dimensions"]).toFixed(1)}
                </div>
                <div className="flex justify-center mb-1">
                  {renderStars(Math.round(getDimensionAverage(dimension as keyof Review["dimensions"])))}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{dimension}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={review.customer_profile?.avatar_url} />
                  <AvatarFallback>
                    {review.customer_profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{review.customer_profile?.full_name || "Anonymous"}</p>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {review.review_text && (
                    <p className="text-sm mb-3">{review.review_text}</p>
                  )}

                  {/* Review Photos */}
                  {review.review_photos && review.review_photos.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.review_photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Provider Response */}
                  {review.response_text && (
                    <div className="bg-muted p-3 rounded-lg mt-3">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium">Provider Response</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {review.response_date && formatDistanceToNow(new Date(review.response_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{review.response_text}</p>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center space-x-4 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpful(review.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful_count})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedReviewSystem;