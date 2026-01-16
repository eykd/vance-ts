# Static Files

Files copied directly to output without processing. Used for assets that don't need Hugo Pipes.

## Contents

- `_headers` - Cloudflare Pages headers configuration
- `.gitkeep` - Keeps directory in git

## Usage

- Place files here to serve at root URL path
- Example: `static/robots.txt` serves at `/robots.txt`
- For processed assets (CSS/JS), use `assets/` instead

## Skills

- `/static-first-routing` - CDN caching and headers

## Notes

- Cloudflare `_headers` file controls caching, security headers
- Prefer `assets/` for CSS/JS to enable fingerprinting
