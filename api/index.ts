import app from '../apps/api/src/app';

// Export the express app as the default export so Vercel serverless can use it directly.
// Vercel's Node runtime will call this exported function as (req, res).
export default app as any;