import Bottleneck from 'bottleneck';

/**
 * Free-Tier Rate Limiting Configuration:
 * Google AI Studio Free Tier limits are nominally 15 RPM.
 * We throttle calls to 10 requests per 60 seconds (1 request per 6 seconds)
 * with maxConcurrent: 1 to guarantee zero 429 concurrency spikes.
 */
export const geminiLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 6000, // 6 seconds between executions = 10 RPM max
  reservoir: 10, // 10 initial tokens
  reservoirRefreshAmount: 10,
  reservoirRefreshInterval: 60 * 1000 // refresh every 60 seconds
});

// Event listeners for monitoring and graceful backoff
geminiLimiter.on('failed', async (error, jobInfo) => {
  const retryCount = jobInfo.retryCount;
  console.warn(`[GeminiLimiter] Job failed (Attempt ${retryCount + 1}):`, error.message);

  // If HTTP 429 or ResourceExhausted, backoff exponentially up to 3 retries
  if ((error.message.includes('429') || error.message.includes('ResourceExhausted')) && retryCount < 3) {
    const backoffMs = Math.pow(2, retryCount) * 10000; // 10s, 20s, 40s
    console.warn(`[GeminiLimiter] Quota exceeded. Applying exponential backoff of ${backoffMs / 1000}s...`);
    return backoffMs;
  }

  // If temporary 503 service unavailable spike, brief 2s backoff retry
  if ((error.message.includes('503') || error.message.includes('high demand') || error.message.includes('Service Unavailable')) && retryCount < 2) {
    console.warn(`[GeminiLimiter] 503 spike detected. Retrying in 2s (Attempt ${retryCount + 2})...`);
    return 2000;
  }
  return null; // Don't retry further

});

geminiLimiter.on('dropped', (dropped) => {
  console.error('[GeminiLimiter] Job dropped from queue:', dropped);
});

geminiLimiter.on('depleted', (empty) => {
  console.info('[GeminiLimiter] Reservoir depleted. Queueing incoming Gemini requests...');
});
