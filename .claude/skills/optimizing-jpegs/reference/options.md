# jpegoptim Complete Options Reference

## Table of Contents

1. [Compression Options](#compression-options)
2. [Metadata Stripping](#metadata-stripping)
3. [Metadata Preservation](#metadata-preservation)
4. [Progressive Encoding](#progressive-encoding)
5. [Output Control](#output-control)
6. [Batch Processing](#batch-processing)

---

## Compression Options

| Option | Description |
|--------|-------------|
| `-m<quality>`, `--max=<quality>` | Set maximum quality (0-100). Enables lossy mode. Files with lower quality are optimized losslessly. |
| `-S<size>`, `--size=<size>` | Target file size in KB (e.g., `-S100`) or percentage (e.g., `-S50%`). Enables lossy mode. |
| `-f`, `--force` | Force optimization even if result is larger than original. |
| `-r`, `--retry` | Retry compression until file size stops decreasing. Most effective with `-m` or `-S`. |
| `-T<threshold>`, `--threshold=<threshold>` | Keep original if compression gain is below threshold (%). |

## Metadata Stripping

| Option | Strips |
|--------|--------|
| `-s`, `--strip-all` | All markers (EXIF, IPTC, ICC, XMP, comments, Adobe, JFIF) |
| `--strip-exif` | EXIF metadata |
| `--strip-iptc` | IPTC/Photoshop (APP13) markers |
| `--strip-icc` | ICC color profile |
| `--strip-xmp` | XMP markers |
| `--strip-com` | Comment markers |
| `--strip-adobe` | Adobe (APP14) markers |
| `--strip-jfif` | JFIF markers |
| `--strip-jfxx` | JFXX (JFIF Extension) markers |

## Metadata Preservation

| Option | Preserves |
|--------|-----------|
| `--strip-none`, `--keep-all` | All markers (no stripping) |
| `--keep-exif` | EXIF metadata |
| `--keep-iptc` | IPTC/Photoshop markers |
| `--keep-icc` | ICC color profile |
| `--keep-xmp` | XMP markers |
| `--keep-com` | Comments |
| `--keep-adobe` | Adobe markers |
| `--keep-jfif` | JFIF markers |
| `--keep-jfxx` | JFXX markers |

## Progressive Encoding

| Option | Description |
|--------|-------------|
| `--all-progressive` | Force all output files to be progressive |
| `--all-normal` | Force all output files to be non-progressive |
| `--auto-mode` | Automatically select based on which produces smaller output |

## Output Control

| Option | Description |
|--------|-------------|
| `-d<path>`, `--dest=<path>` | Output directory (originals unchanged). Note: unchanged files are NOT copied. |
| `-o`, `--overwrite` | Overwrite target file if it exists (use with `-d`) |
| `-p`, `--preserve` | Preserve file modification timestamps |
| `-P`, `--preserve-perms` | Preserve file permissions by overwriting original |
| `--stdout` | Send output to stdout (instead of file) |
| `--stdin` | Read input from stdin |
| `--nofix` | Skip processing if input contains errors |
| `--save-extra` | Preserve extraneous data after end of image |

## Batch Processing

| Option | Description |
|--------|-------------|
| `-w<max>`, `--workers=<max>` | Maximum parallel threads (default: 1) |
| `-t`, `--totals` | Print totals after processing all files |
| `-n`, `--noaction` | Dry run - print results without modifying files |
| `-q`, `--quiet` | Quiet mode |
| `-v`, `--verbose` | Verbose mode |
| `-b`, `--csv` | Print progress in CSV format |
| `--files-stdin` | Read list of files to process from stdin |
| `--files-from=FILE` | Read list of files to process from a file |

---

## LLM Context Optimization Recommendations

### Typical Workflow

```bash
# 1. Preview savings (dry-run)
jpegoptim -m60 --strip-all -n screenshot.jpg

# 2. Apply optimization
jpegoptim -m60 --strip-all screenshot.jpg

# 3. Verify with totals for batch
jpegoptim -m60 --strip-all -t screenshots/*.jpg
```

### Size Targets by Context Budget

| Context Budget | Target Size | Command |
|----------------|-------------|---------|
| Tight (~50KB) | `-S50` | `jpegoptim -S50 --strip-all image.jpg` |
| Normal (~100KB) | `-S100` | `jpegoptim -S100 --strip-all image.jpg` |
| Generous (~200KB) | `-m70 --strip-all` | `jpegoptim -m70 --strip-all image.jpg` |
