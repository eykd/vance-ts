#!/usr/bin/env bash
# install-tmplr.sh - Install the tmplr binary for template instantiation
#
# This script downloads and verifies the tmplr binary from GitHub releases.
# It supports macOS (Apple Silicon, Intel) and Linux (x86_64, arm64).
#
# Usage: ./scripts/install-tmplr.sh
# Output: ~/.local/bin/tmplr

set -euo pipefail

# Configuration
readonly TMPLR_VERSION="0.0.9"
readonly INSTALL_DIR="${HOME}/.local/bin"
readonly INSTALL_PATH="${INSTALL_DIR}/tmplr"
readonly DOWNLOAD_BASE="https://github.com/exlee/tmplr/releases/download/v${TMPLR_VERSION}"

# SHA256 checksums for tmplr v0.0.9 binaries (FR-020)
declare -A CHECKSUMS=(
    ["tmplr-aarch64-apple-darwin"]="fa3370653da0059c7a812c62e0762ccf107e2bc5444199e29fda3baeef096ad4"
    ["tmplr-x86_64-apple-darwin"]="b470d42e3f926985d462aaf6fadb469099883ecc1a4ff2e31f10d422f4829e03"
    ["tmplr-aarch64-unknown-linux-gnu"]="cf865d8fb63926185058ca6dff7e0d1b08a2ef34f3ba02bf7dc3156cd768eca1"
    ["tmplr-x86_64-unknown-linux-gnu"]="6d8a082e1ea55913a40d6d86ccf5c661af55424f042ebed800d2f7be5b31c376"
)

# Print error message and exit
error() {
    echo "Error: $1" >&2
    exit 1
}

# Print info message
info() {
    echo "$1"
}

# Detect operating system (FR-015)
detect_os() {
    local os
    os="$(uname -s)"

    case "$os" in
        Darwin)
            echo "apple-darwin"
            ;;
        Linux)
            echo "unknown-linux-gnu"
            ;;
        *)
            error "Unsupported operating system: $os. Only macOS (Darwin) and Linux are supported."
            ;;
    esac
}

# Detect CPU architecture (FR-015)
detect_arch() {
    local arch
    arch="$(uname -m)"

    case "$arch" in
        x86_64)
            echo "x86_64"
            ;;
        arm64|aarch64)
            echo "aarch64"
            ;;
        *)
            error "Unsupported architecture: $arch. Only x86_64 and arm64/aarch64 are supported."
            ;;
    esac
}

# Get the binary name for the current platform
get_binary_name() {
    local arch platform
    arch="$(detect_arch)"
    platform="$(detect_os)"
    echo "tmplr-${arch}-${platform}"
}

# Compute SHA256 checksum of a file
compute_checksum() {
    local file="$1"

    if command -v sha256sum &>/dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &>/dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        error "Neither sha256sum nor shasum found. Cannot verify checksum."
    fi
}

# Verify checksum of downloaded binary (FR-020)
verify_checksum() {
    local file="$1"
    local binary_name="$2"
    local expected_checksum="${CHECKSUMS[$binary_name]}"
    local actual_checksum

    actual_checksum="$(compute_checksum "$file")"

    if [[ "$actual_checksum" != "$expected_checksum" ]]; then
        rm -f "$file"
        error "Checksum verification failed!
Expected: $expected_checksum
Actual:   $actual_checksum
The downloaded file has been deleted for security."
    fi

    info "Verifying checksum... OK"
}

# Download the tmplr binary (FR-014)
download_binary() {
    local binary_name="$1"
    local tmp_file="$2"
    local download_url="${DOWNLOAD_BASE}/${binary_name}"

    info "Downloading tmplr v${TMPLR_VERSION} (${binary_name})..."

    if command -v curl &>/dev/null; then
        curl -fsSL -o "$tmp_file" "$download_url" || error "Failed to download from $download_url"
    elif command -v wget &>/dev/null; then
        wget -q -O "$tmp_file" "$download_url" || error "Failed to download from $download_url"
    else
        error "Neither curl nor wget found. Cannot download tmplr."
    fi
}

# Install the binary (FR-016)
install_binary() {
    local tmp_file="$1"

    # Create install directory if needed
    if [[ ! -d "$INSTALL_DIR" ]]; then
        info "Creating directory: $INSTALL_DIR"
        mkdir -p "$INSTALL_DIR"
    fi

    # Move binary to install location
    mv "$tmp_file" "$INSTALL_PATH"

    # Make executable
    chmod +x "$INSTALL_PATH"

    info "Installing to $INSTALL_PATH"
}

# Check if tmplr is already installed with correct version
check_existing_installation() {
    if [[ -x "$INSTALL_PATH" ]]; then
        local installed_version
        # Use --help to get version since --version triggers interactive mode
        installed_version="$("$INSTALL_PATH" --help 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "")"

        if [[ "$installed_version" == "$TMPLR_VERSION" ]]; then
            info "tmplr v${TMPLR_VERSION} is already installed at $INSTALL_PATH"
            return 0
        fi
    fi
    return 1
}

# Temporary file for download (global for cleanup trap)
TMP_FILE=""

# Cleanup function for trap
cleanup() {
    if [[ -n "$TMP_FILE" && -f "$TMP_FILE" ]]; then
        rm -f "$TMP_FILE"
    fi
}

# Main entry point
main() {
    local binary_name

    # Set up cleanup trap
    trap cleanup EXIT

    # Check if already installed
    if check_existing_installation; then
        exit 0
    fi

    # Detect platform
    local os arch
    os="$(uname -s)"
    arch="$(uname -m)"
    info "Detecting platform... ${os} ${arch}"

    # Get binary name for this platform
    binary_name="$(get_binary_name)"

    # Create temporary file for download
    TMP_FILE="$(mktemp)"

    # Download binary
    download_binary "$binary_name" "$TMP_FILE"

    # Verify checksum
    verify_checksum "$TMP_FILE" "$binary_name"

    # Install binary
    install_binary "$TMP_FILE"

    info "tmplr installed successfully."
    info ""
    info "Make sure $INSTALL_DIR is in your PATH:"
    info "  export PATH=\"\$HOME/.local/bin:\$PATH\""
}

main "$@"
