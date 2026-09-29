"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { ProfileSubpage } from "@/components/family/profile-subpage";
import { cn } from "@/lib/utils";

const ratingLabels = ["", "Very poor", "Poor", "Okay", "Good", "Excellent"];
const topics = ["General experience", "Educators & care", "Learning program", "Family Portal app", "Food & nutrition", "Facilities"];

export default function FeedbackPage() {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [topic, setTopic] = useState(topics[0]);
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError("Please choose a star rating.");
      return;
    }
    setError(null);
    setStatus("sending");
    window.setTimeout(() => {
      setStatus("sent");
      toast({ title: "Feedback sent", description: "Thank you — the Centre Director reads every response." });
    }, 900);
  }

  function reset() {
    setRating(0);
    setTopic(topics[0]);
    setComments("");
    setStatus("idle");
  }

  const shown = hover || rating;

  return (
    <ProfileSubpage title="Give Feedback" description="Tell us how we're going">
      <Card className="p-5 md:p-6">
        {status === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <CheckCircle2 className="h-9 w-9 text-success-foreground" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">Thanks for your feedback!</h2>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={cn("h-5 w-5", value <= rating ? "text-accent" : "text-muted")}
                  fill="currentColor"
                />
              ))}
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              We use family feedback in our Quality Improvement Plan (NQS Quality Area 6).
            </p>
            <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
              <Link href="/family/profile" className={buttonVariants()}>
                Back to Profile
              </Link>
              <Button variant="ghost" onClick={reset}>
                Send more feedback
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                How would you rate your experience at Little Explorer?
              </p>
              <div className="mt-3 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(value)}
                    onClick={() => {
                      setRating(value);
                      setError(null);
                    }}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn("h-9 w-9", value <= shown ? "text-accent" : "text-muted")}
                      fill="currentColor"
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 h-5 text-sm font-medium text-muted-foreground">{ratingLabels[shown]}</p>
              {error && <p className="text-xs text-danger-foreground">{error}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">What is it about?</label>
              <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="comments" className="text-sm font-semibold text-foreground">
                Comments <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="comments"
                rows={5}
                maxLength={800}
                placeholder="What's working well? What could we do better?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <p className="text-right text-xs text-muted-foreground">{comments.length}/800</p>
            </div>

            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "sending" ? "Sending…" : "Send feedback"}
            </Button>
          </form>
        )}
      </Card>
    </ProfileSubpage>
  );
}
