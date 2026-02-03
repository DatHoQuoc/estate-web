export interface FeedbackItemResponse {
  feedbackItemId: string;
  category: string;     // Matches Category enum
  severity: string;     // Matches Severity enum
  targetAttribute: string;
  errorMessage: string;
  suggestion: string;
  detectedBy: string;   // Matches DetectedBy enum
  isFixed: boolean;
  createdAt: string;
}

export interface FeedbackResponse {
  feedbackId: string;
  listingId: string;
  sellerUserId: string;
  checkType: string;         // Matches CheckType enum
  feedbackStatus: string;    // Matches FeedbackStatus enum
  aiConfidenceScore: number;
  createdAt: string;
  reviewedByStaffId: string | null;
  isResubmission: boolean;
  previousFeedbackId: string | null;
  feedbackItems: FeedbackItemResponse[];
}