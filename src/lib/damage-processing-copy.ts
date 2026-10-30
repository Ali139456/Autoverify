/** Ravin-guided AI damage analysis — customer-facing timing (Denise / Ravin ops). */
export const AI_DAMAGE_PROCESSING_MINUTES = 10;

/** Delay after AI damage analysis completes before the updated report email sends. */
export const AI_DAMAGE_FOLLOW_UP_EMAIL_MINUTES = 30;

export const AI_DAMAGE_PROCESSING_SHORT =
  "AI damage analysis usually takes around 10 minutes to process.";

export const AI_DAMAGE_PROCESSING_POLLER =
  "AI damage analysis is processing — this page will update automatically when results are ready (usually within around 10 minutes).";

export const AI_DAMAGE_PROCESSING_WALKAROUND_BANNER =
  "Walkaround photos are saved. AI damage analysis is being processed and usually takes around 10 minutes — this report will update automatically when ready.";

export const AI_DAMAGE_PROCESSING_DAMAGE_SECTION =
  "AI damage analysis is processing and usually takes around 10 minutes. Results will appear on this page when ready.";

export const AI_DAMAGE_PROCESSING_PDF =
  "AI damage analysis is processing (usually around 10 minutes). Results will appear when ready.";

export const AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE = `We will email you an updated report with PDF attached about ${AI_DAMAGE_FOLLOW_UP_EMAIL_MINUTES} minutes after AI damage analysis completes.`;

/** Shown on the mobile capture “All done” screen while Ravin processes photos. */
export const INSPECTION_CAPTURE_DONE_PENDING_MESSAGE = `AI damage analysis usually takes around ${AI_DAMAGE_PROCESSING_MINUTES} minutes. We will email your updated report about ${AI_DAMAGE_FOLLOW_UP_EMAIL_MINUTES} minutes after AI damage analysis completes.`;
