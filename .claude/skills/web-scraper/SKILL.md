---
name: web-scraper
description: Convert web pages to clean Markdown format using url-to-markdown-cli-tool. Use when users need to (1) scrape web page content to Markdown, (2) extract clean text from websites while removing navigation/footers/scripts, (3) convert URLs to readable Markdown files, (4) process web content for analysis or documentation, or (5) fetch web content in a format that's easier to work with than raw HTML.
---

# Web Scraper

Convert web pages to clean, readable Markdown using the url-to-markdown-cli-tool.

## Installation

The tool requires Node.js. Install globally using npm:

```bash
npm install -g url-to-md
```

Verify installation:

```bash
url-to-md --version
```

## Basic Usage

### Convert URL to Markdown file

```bash
url-to-md https://example.com -o example.md
```

### Output to console (no file)

```bash
url-to-md https://example.com
```

This prints the Markdown directly to stdout, useful for piping or immediate viewing.

### Clean content mode (recommended for articles/blogs)

```bash
url-to-md https://blog.example.com --clean-content -o clean-blog.md
```

The `--clean-content` flag removes common page elements:

- Navigation menus (`<nav>`)
- Footers (`<footer>`)
- Sidebars (`<aside>`)
- Scripts (`<script>`)
- Styles (`<style>`)
- Headers (`<header>`)
- Non-content elements (`<noscript>`, `<canvas>`)

## Common Patterns

### Scrape article or blog post

For blog posts and articles, always use `--clean-content` to get just the main content:

```bash
url-to-md https://medium.com/article-title --clean-content -o article.md
```

### Scrape documentation page

Documentation often has useful navigation, so skip `--clean-content`:

```bash
url-to-md https://docs.example.com/guide -o guide.md
```

### Batch processing multiple URLs

Process multiple pages and save to files:

```bash
for url in $(cat urls.txt); do
  filename=$(echo $url | sed 's/[^a-zA-Z0-9]/_/g').md
  url-to-md "$url" --clean-content -o "$filename"
done
```

### Preview before saving

Check the output quality before committing to a file:

```bash
url-to-md https://example.com --clean-content
```

Review the output, then run again with `-o` if satisfactory.

## When to Use Clean Content

Use `--clean-content`:

- ✅ Blog posts and articles
- ✅ News stories
- ✅ Medium/Substack posts
- ✅ Academic papers (HTML versions)
- ✅ Tutorial content

Skip `--clean-content`:

- ❌ Documentation with useful navigation
- ❌ Reference pages where structure matters
- ❌ Landing pages where layout is important
- ❌ Pages where you need to see all elements

## Error Handling

If the tool fails or produces poor results:

1. **Check URL accessibility**: Verify the URL loads in a browser
2. **Try without clean-content**: Some sites don't handle the cleaning well
3. **Check for JavaScript-heavy sites**: Tool works best with server-rendered HTML
4. **Verify installation**: Run `url-to-md --version` to confirm it's installed

For JavaScript-heavy SPAs (Single Page Applications), this tool may not capture dynamic content. Consider alternative approaches like using browser automation tools if needed.

## Output Location

Files are saved to the current working directory unless an absolute path is specified:

```bash
# Saves to current directory
url-to-md https://example.com -o article.md

# Saves to specific directory
url-to-md https://example.com -o /home/claude/scraped/article.md
```

## Best Practices

1. **Always preview first**: Run without `-o` to check quality before saving
2. **Use meaningful filenames**: Choose descriptive names based on content, not URL
3. **Clean content by default**: Start with `--clean-content` for most scraping tasks
4. **Verify output**: Check the generated Markdown to ensure it captured what you needed
5. **Handle failures gracefully**: Not all sites scrape well; be prepared to try alternatives
