"use client";

import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { phpApi, Review } from "@/lib/phpApi";
import { useAuth } from "@/store/authStore";

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await phpApi.getReviews(productId);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setTotalCount(data.totalCount);
    } catch {
      // silently fail — reviews are non-critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await phpApi.createReview(productId, rating, comment.trim() || undefined);
      toast.success("Review posted!");
      setShowForm(false);
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await phpApi.deleteReview(id);
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) return null;

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ fontSize: "1.2rem", margin: 0 }}>
          Reviews {totalCount > 0 && `(${totalCount})`}
        </h3>
        {user && (
          <button
            className="ab-btn ab-btn--ghost"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {/* Rating summary */}
      {totalCount > 0 && (
        <div className="d-flex align-items-center gap-3 mb-4" style={{ fontSize: "0.9rem" }}>
          <div className="d-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={18}
                fill={n <= Math.round(avgRating) ? "var(--ab-gold)" : "none"}
                color={n <= Math.round(avgRating) ? "var(--ab-gold)" : "var(--ab-line)"}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span style={{ color: "var(--ab-gold)", fontWeight: 600 }}>{avgRating}</span>
          <span className="ab-muted">out of 5</span>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={submit} className="mb-4 p-3" style={{ background: "var(--ab-surface)", borderRadius: "var(--ab-radius-sm)", border: "1px solid var(--ab-line)" }}>
          <div className="mb-3">
            <label className="ab-label">Rating</label>
            <div className="d-flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem" }}
                >
                  <Star
                    size={24}
                    fill={n <= rating ? "var(--ab-gold)" : "none"}
                    color={n <= rating ? "var(--ab-gold)" : "var(--ab-line)"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="ab-label">Comment (optional)</label>
            <textarea
              className="ab-input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
            />
          </div>
          <button className="ab-btn ab-btn--gold" disabled={submitting}>
            {submitting ? "Posting…" : "Post Review"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="ab-muted" style={{ fontSize: "0.9rem" }}>
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3"
              style={{ background: "var(--ab-surface)", borderRadius: "var(--ab-radius-sm)", border: "1px solid var(--ab-line)" }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{rev.user_name}</span>
                    <div className="d-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          fill={n <= rev.rating ? "var(--ab-gold)" : "none"}
                          color={n <= rev.rating ? "var(--ab-gold)" : "var(--ab-line)"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p style={{ fontSize: "0.88rem", color: "var(--ab-text-dim)", margin: "0.4rem 0 0" }}>
                      {rev.comment}
                    </p>
                  )}
                  <span className="ab-muted" style={{ fontSize: "0.78rem" }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                {user && (user.id === rev.user_name || user.role === "admin") && (
                  <button
                    onClick={() => remove(rev.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ab-danger)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
