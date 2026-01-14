# Template Functions

TypeScript functions that return HTML strings for HTMX partial responses.

## Essential: escapeHtml Utility

**Always escape user-provided data to prevent XSS:**

```typescript
/** Escape HTML special characters to prevent XSS */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
```

## Single Item Template

```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

function taskItem(task: Task): string {
  return `
    <li class="flex items-center gap-3 p-3 bg-base-100 rounded-lg"
        id="task-${escapeHtml(task.id)}">
      <input type="checkbox"
             class="checkbox"
             ${task.completed ? 'checked' : ''}
             hx-post="/app/_/tasks/${escapeHtml(task.id)}/toggle"
             hx-swap="outerHTML"
             hx-target="#task-${escapeHtml(task.id)}">
      <span class="${task.completed ? 'line-through opacity-60' : ''}">
        ${escapeHtml(task.title)}
      </span>
      <button class="btn btn-ghost btn-sm ml-auto"
              hx-delete="/app/_/tasks/${escapeHtml(task.id)}"
              hx-target="#task-${escapeHtml(task.id)}"
              hx-swap="outerHTML">
        ✕
      </button>
    </li>
  `;
}
```

## List Template

```typescript
function taskList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return `
      <div class="text-center py-8 text-base-content/60">
        <p>No tasks yet. Add one above!</p>
      </div>
    `;
  }

  return `
    <ul class="space-y-2">
      ${tasks.map(taskItem).join('')}
    </ul>
  `;
}
```

## Card Component

```typescript
interface Article {
  id: string;
  title: string;
  excerpt: string;
  url: string;
}

function articleCard(article: Article): string {
  return `
    <article class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.excerpt)}</p>
        <div class="card-actions justify-end">
          <a href="${escapeHtml(article.url)}" class="btn btn-primary btn-sm">
            Read More
          </a>
        </div>
      </div>
    </article>
  `;
}
```

## Search Result with Highlighting

```typescript
interface SearchResult {
  title: string;
  excerpt: string;
  url: string;
}

function highlightQuery(text: string, query: string): string {
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escaped.replace(regex, '<mark class="bg-warning/30">$1</mark>');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchResults(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `
      <div class="p-4 text-center text-base-content/60">
        No results found for "${escapeHtml(query)}"
      </div>
    `;
  }

  return `
    <ul class="divide-y divide-base-200">
      ${results
        .map(
          (result) => `
        <li>
          <a href="${escapeHtml(result.url)}"
             class="block p-4 hover:bg-base-200 transition-colors">
            <h4 class="font-medium">${highlightQuery(result.title, query)}</h4>
            <p class="text-sm text-base-content/70 mt-1">
              ${highlightQuery(result.excerpt, query)}
            </p>
          </a>
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}
```

## Comment Component

```typescript
interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
}

function commentItem(comment: Comment): string {
  const avatarUrl = `https://www.gravatar.com/avatar/${md5(comment.email.toLowerCase())}?d=mp&s=48`;

  return `
    <article class="flex gap-4 p-4 bg-base-100 rounded-lg">
      <img src="${escapeHtml(avatarUrl)}"
           alt="${escapeHtml(comment.author)}"
           class="w-12 h-12 rounded-full">
      <div class="flex-1">
        <div class="flex items-baseline gap-2">
          <span class="font-bold">${escapeHtml(comment.author)}</span>
          <time class="text-sm opacity-60">
            ${comment.createdAt.toLocaleDateString()}
          </time>
        </div>
        <p class="mt-2">${escapeHtml(comment.content)}</p>
      </div>
    </article>
  `;
}
```

## Conditional Classes

```typescript
function statusBadge(status: 'pending' | 'active' | 'completed'): string {
  const classes: Record<string, string> = {
    pending: 'badge-warning',
    active: 'badge-info',
    completed: 'badge-success',
  };

  return `<span class="badge ${classes[status]}">${status}</span>`;
}
```

## See Also

- [Response Patterns](./response-patterns.md) - Wrapping templates in responses
- [Error Responses](./error-responses.md) - Error and empty state templates
