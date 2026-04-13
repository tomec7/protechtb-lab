# Cloudflare Worker Contact Endpoint

## Quick setup
1. Create Cloudflare account and install Wrangler:
   - `npm i -g wrangler`
   - `wrangler login`
2. In this folder:
   - copy `wrangler.toml.example` -> `wrangler.toml`
   - `wrangler secret put RESEND_API_KEY`
   - `wrangler deploy`
3. Test worker URL:
   - `https://<your-worker>.workers.dev/health`
4. (Optional) attach custom route/domain in Cloudflare Dashboard and point `api.protechtb.sk` to worker route.

Form expects endpoint `https://api.protechtb.sk/contact`.
Until route is active, frontend falls back to Formsubmit.
