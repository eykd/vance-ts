#!/usr/bin/env python3
"""Script to rename worker name in wrangler.toml to a custom project slug.

This script:
1. Validates that the provided slug meets requirements
2. Replaces the 'name' field in wrangler.toml with the slug
3. Updates database and R2 bucket names to match

Usage:
    python rename_project.py <worker-slug>

Example:
    python rename_project.py mycompany-api
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Validation constants
MIN_SLUG_LENGTH = 3
MAX_SLUG_LENGTH = 30
EXPECTED_ARGC = 2
MAX_ARGC_WITH_TEST_PATH = 4  # <slug> --wrangler-toml-path <path>


def validate_slug(slug: str) -> tuple[bool, str]:
    """Validate that the worker slug meets requirements.

    Requirements:
    - 3-30 characters long
    - Only lowercase letters, numbers, and hyphens
    - Cannot start or end with hyphen
    - Cannot be exactly 'turtlebased-ts' (template name)

    Args:
        slug: The worker slug to validate

    Returns:
        Tuple of (is_valid, error_message)
        If valid, error_message is empty string
    """
    # Check length
    if len(slug) < MIN_SLUG_LENGTH:
        return False, f"Worker name must be at least {MIN_SLUG_LENGTH} characters long"
    if len(slug) > MAX_SLUG_LENGTH:
        return False, f"Worker name must be at most {MAX_SLUG_LENGTH} characters long"

    # Check characters (alphanumeric and hyphens only, no underscores for Workers)
    if not re.match(r"^[a-z0-9-]+$", slug):
        return (
            False,
            "Worker name must contain only lowercase letters, numbers, and hyphens",
        )

    # Check start/end
    if slug.startswith("-"):
        return False, "Worker name cannot start with a hyphen"
    if slug.endswith("-"):
        return False, "Worker name cannot end with a hyphen"

    # Check reserved names
    if slug in {"turtlebased-ts", "turtlebased"}:
        return (
            False,
            f"'{slug}' is a template name - please choose a unique worker name",
        )

    return True, ""


def replace_worker_name_in_toml(file_path: Path, new_slug: str) -> None:
    """Replace worker name and related identifiers in wrangler.toml.

    Args:
        file_path: Path to the wrangler.toml file
        new_slug: The new worker slug to use
    """
    content = file_path.read_text()

    # Replace name = "..." field
    content = re.sub(
        r'^name\s*=\s*"[^"]*"',
        f'name = "{new_slug}"',
        content,
        flags=re.MULTILINE,
    )

    # Replace database_name if it exists
    content = re.sub(
        r'^database_name\s*=\s*"[^"]*"',
        f'database_name = "{new_slug}-db"',
        content,
        flags=re.MULTILINE,
    )

    # Replace R2 bucket binding name if it exists
    content = re.sub(
        r'^bucket_name\s*=\s*"[^"]*"',
        f'bucket_name = "{new_slug}-storage"',
        content,
        flags=re.MULTILINE,
    )

    # Write back to file
    file_path.write_text(content)


def main() -> int:
    """Main entry point for the script."""
    # Parse arguments: <worker-slug> [--wrangler-toml-path <path>]
    if len(sys.argv) < EXPECTED_ARGC or len(sys.argv) > MAX_ARGC_WITH_TEST_PATH:
        print(
            "Usage: python rename_project.py <worker-slug> [--wrangler-toml-path <path>]",
            file=sys.stderr,
        )
        print("\nExample: python rename_project.py mycompany-api", file=sys.stderr)
        return 1

    new_slug = sys.argv[1]

    # Check for optional wrangler-toml-path argument (for testing)
    wrangler_toml_path = None
    if len(sys.argv) >= MAX_ARGC_WITH_TEST_PATH and sys.argv[2] == "--wrangler-toml-path":
        wrangler_toml_path = Path(sys.argv[3])
    else:
        # Find wrangler.toml (look in project root, which is 3 levels up from this script)
        project_root = Path(__file__).parent.parent.parent
        wrangler_toml_path = project_root / "wrangler.toml"

    # Validate the slug
    is_valid, error_message = validate_slug(new_slug)
    if not is_valid:
        print(f"Error: {error_message}", file=sys.stderr)
        return 1

    if not wrangler_toml_path.exists():
        print(f"Error: wrangler.toml not found at {wrangler_toml_path}", file=sys.stderr)
        print("\nNote: This script expects a wrangler.toml file in the project root.", file=sys.stderr)
        print("If you haven't created one yet, Claude can help you set it up.", file=sys.stderr)
        return 1

    # Perform the replacement
    try:
        replace_worker_name_in_toml(wrangler_toml_path, new_slug)
    except OSError as e:
        print(f"Error updating wrangler.toml: {e}", file=sys.stderr)
        return 1
    else:
        print(f"✓ Successfully renamed worker to '{new_slug}'")
        print(f"✓ Updated {wrangler_toml_path}")
        print(f"\nYour Worker will be available at: https://{new_slug}.<account>.workers.dev")
        print("(The exact URL will be shown after deployment)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
