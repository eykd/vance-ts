# Request Data Extraction

## Table of Contents

- [Form Data](#form-data)
- [Query Parameters](#query-parameters)
- [Path Parameters](#path-parameters)
- [Validation Patterns](#validation-patterns)
- [Type-Safe Extraction](#type-safe-extraction)

## Form Data

```typescript
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();

  // String fields
  const title = formData.get("title") as string;

  // Boolean from checkbox (returns "on" or null)
  const urgent = formData.get("urgent") === "on";

  // Optional fields
  const description = formData.get("description") as string | null;

  // Multiple values (multi-select, checkboxes with same name)
  const tags = formData.getAll("tags") as string[];
}
```

### File Uploads

```typescript
async uploadAvatar(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return this.htmlResponse(
      `<div class="alert alert-error">Please select a file</div>`,
      400
    );
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return this.htmlResponse(
      `<div class="alert alert-error">File must be an image</div>`,
      400
    );
  }

  // Read file content
  const bytes = await file.arrayBuffer();
}
```

## Query Parameters

```typescript
async listTasks(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // String params
  const search = url.searchParams.get("search") ?? "";
  const sort = url.searchParams.get("sort") ?? "created_desc";

  // Numeric params with defaults
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);

  // Boolean params
  const completed = url.searchParams.get("completed") === "true";

  // Multiple values
  const tags = url.searchParams.getAll("tag");
}
```

## Path Parameters

Path params are extracted by the Router and passed to handlers:

```typescript
// Router extracts :id from /api/tasks/:id
async updateTask(request: Request, id: string): Promise<Response> {
  const task = await this.taskRepository.findById(id);
  if (!task) {
    return new Response("Not found", { status: 404 });
  }
  // ...
}

// Multiple path params
async getComment(
  request: Request,
  taskId: string,
  commentId: string
): Promise<Response> {
  // Route: /api/tasks/:taskId/comments/:commentId
}
```

## Validation Patterns

### Inline Validation

```typescript
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const dueDate = formData.get("dueDate") as string | null;

  // Collect validation errors
  const errors: string[] = [];

  if (!title || title.length < 3) {
    errors.push("Title must be at least 3 characters");
  }
  if (title && title.length > 200) {
    errors.push("Title must be less than 200 characters");
  }
  if (dueDate && isNaN(Date.parse(dueDate))) {
    errors.push("Invalid due date format");
  }

  if (errors.length > 0) {
    return this.htmlResponse(
      `<div class="alert alert-error">
        <ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul>
      </div>`,
      400
    );
  }

  // Proceed with valid data
}
```

### Field-Specific Error Display

```typescript
interface ValidationErrors {
  [field: string]: string;
}

async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const errors: ValidationErrors = {};

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  const email = (formData.get("email") as string)?.trim();
  if (email && !this.isValidEmail(email)) {
    errors.email = "Invalid email address";
  }

  if (Object.keys(errors).length > 0) {
    // Re-render form with errors and preserved values
    return this.htmlResponse(
      taskForm({ title, email }, errors),
      400
    );
  }
}
```

## Type-Safe Extraction

### Request Data Interface

```typescript
interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date;
  tags: string[];
}

async extractCreateTaskData(request: Request): Promise<CreateTaskData | ValidationErrors> {
  const formData = await request.formData();
  const errors: ValidationErrors = {};

  const title = (formData.get("title") as string)?.trim();
  if (!title || title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  const dueDateStr = formData.get("dueDate") as string | null;
  let dueDate: Date | undefined;
  if (dueDateStr) {
    const parsed = Date.parse(dueDateStr);
    if (isNaN(parsed)) {
      errors.dueDate = "Invalid date format";
    } else {
      dueDate = new Date(parsed);
    }
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  return {
    title: title!,
    description: (formData.get("description") as string)?.trim() || undefined,
    dueDate,
    tags: formData.getAll("tags") as string[]
  };
}

// Usage in handler
async createTask(request: Request): Promise<Response> {
  const result = await this.extractCreateTaskData(request);

  if ("title" in result === false) {
    // result is ValidationErrors
    return this.htmlResponse(taskForm({}, result), 400);
  }

  // result is CreateTaskData
  const task = await this.createTaskUseCase.execute(result);
}
```

### Reusable Validators

```typescript
// src/presentation/utils/validators.ts
export const validators = {
  required(value: string | null | undefined, field: string): string | null {
    if (!value?.trim()) return `${field} is required`;
    return null;
  },

  minLength(value: string, min: number, field: string): string | null {
    if (value.length < min) return `${field} must be at least ${min} characters`;
    return null;
  },

  maxLength(value: string, max: number, field: string): string | null {
    if (value.length > max) return `${field} must be less than ${max} characters`;
    return null;
  },

  email(value: string): string | null {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Invalid email address';
    return null;
  },

  uuid(value: string): string | null {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!regex.test(value)) return 'Invalid ID format';
    return null;
  },
};
```
