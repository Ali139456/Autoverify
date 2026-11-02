/** Ravin-guided AI condition assessment — customer-facing timing (Denise / Ravin ops). */
export const AI_DAMAGE_PROCESSING_MINUTES = 5;

/** Backup delay before cron sends completion email if webhook delivery missed. */
export const AI_DAMAGE_FOLLOW_UP_EMAIL_MINUTES = 5;

export const AI_DAMAGE_PROCESSING_SHORT = `AI condition assessment usually completes within about ${AI_DAMAGE_PROCESSING_MINUTES} minutes.`;

export const AI_DAMAGE_PROCESSING_POLLER = `AI condition assessment is processing — this page will update automatically when results are ready (usually within about ${AI_DAMAGE_PROCESSING_MINUTES} minutes).`;

export const AI_DAMAGE_PROCESSING_WALKAROUND_BANNER = `Walkaround photos are saved. AI condition assessment is in progress and usually completes within about ${AI_DAMAGE_PROCESSING_MINUTES} minutes — this report will update automatically when ready.`;

export const AI_DAMAGE_PROCESSING_DAMAGE_SECTION = `AI condition assessment is in progress and usually completes within about ${AI_DAMAGE_PROCESSING_MINUTES} minutes. Results will appear on this page when ready.`;

export const AI_DAMAGE_PROCESSING_PDF = `AI condition assessment is in progress (usually within about ${AI_DAMAGE_PROCESSING_MINUTES} minutes). Results will appear when ready.`;

export const AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE = `We will email you when AI condition assessment is complete, with an updated report link and PDF attached.`;

/** Shown on the mobile capture “All done” screen while Ravin processes photos. */
export const INSPECTION_CAPTURE_DONE_PENDING_MESSAGE = `${AI_DAMAGE_PROCESSING_SHORT} We will email you when assessment is complete and your updated report is ready.`;
