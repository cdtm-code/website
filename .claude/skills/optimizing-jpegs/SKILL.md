---
name: optimizing-jpegs
description: Optimizes JPEG images for LLM context windows using jpegoptim. Reduces file sizes by 10x-30x while preserving legibility. Use when preparing screenshots, test artifacts, or browser captures for Claude or other LLM agents.
---

# JPEG Optimization for LLM Context

Optimize JPEG images to fit within LLM context windows efficiently. Uses `jpegoptim` for both lossless and lossy compression.

## Quick Start

Default command for screenshots (medium quality, strip metadata):

```bash
jpegoptim -S40 --strip-all image.jpg
```

## Quality Tiers

| Tier | Command | Use Case | Reduction |
|------|---------|----------|-----------|
| **High** | `-m80 --strip-all` | Text-heavy, fine details | ~50-70% |
| **Medium** | `-m60 --strip-all` | UI screenshots (default) | ~70-85% |
| **Aggressive** | `-m40 --strip-all` | Layout verification | ~85-95% |

## Common Patterns

### Batch Processing

```bash
jpegoptim -m60 --strip-all -t screenshots/*.jpg
```

### Target Specific Size

For strict context budgets (e.g., 50KB max):

```bash
jpegoptim -S50 --strip-all image.jpg
```

### Dry-Run Preview

Check savings before committing:

```bash
jpegoptim -m60 --strip-all -n image.jpg
```

### Non-Destructive Output

Preserve originals by outputting to a separate folder:

```bash
jpegoptim -m60 --strip-all -d ./optimized/ *.jpg
```

### Maximum Compression

Retry until no further gains, with progressive encoding:

```bash
jpegoptim -m40 --strip-all --all-progressive -r image.jpg
```

## Metadata Stripping Options

| Option | Strips |
|--------|--------|
| `--strip-all` | All markers (recommended) |
| `--strip-exif` | EXIF only |
| `--strip-icc` | ICC color profile |
| `--strip-com` | Comments |
| `--strip-xmp` | XMP metadata |

## Reference

For complete options: See [reference/options.md](reference/options.md)
