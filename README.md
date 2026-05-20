# oss-atlas

Static-first, GitHub Pages-friendly project catalog and contribution atlas generator for GitHub organizations.

## What it does

oss-atlas helps an org curate a `catalog.yml`, sync GitHub repository metadata, and generate:

- `atlas.json` for the data model
- `REPORT.md` for a human-readable summary
- a static Astro site for publishing

## Requirements

- Node.js
- pnpm
- Optional: `GITHUB_TOKEN` for GitHub API rate limits

## Install, build, verify

```bash
pnpm install
pnpm build
pnpm verify
```

`pnpm verify` runs the test suite, build, and the static site output check.

## CLI flow

1. Create a starter catalog:

```bash
pnpm cli init -- --org BSSM-OSS
```

2. Sync GitHub org metadata:

```bash
pnpm cli sync -- --org BSSM-OSS
```

3. Generate the atlas JSON, Markdown report, and static site:

```bash
pnpm cli generate
```

4. Render the Markdown report from the generated atlas cache:

```bash
pnpm cli report
```

## Fixture-based local testing

Use the fixture to avoid live GitHub calls:

```bash
pnpm cli sync -- --fixture test/fixtures/github-org-repos.json
```

A typical local flow is:

```bash
pnpm cli init -- --org BSSM-OSS
cp examples/bssm-oss/catalog.yml catalog.yml
pnpm cli sync -- --fixture test/fixtures/github-org-repos.json
pnpm cli generate
pnpm cli report
```

## Generated outputs

The CLI writes artifacts into the target working directory:

- `.oss-atlas/github.json`: synced GitHub repository metadata
- `.oss-atlas/atlas.json`: merged atlas cache
- `dist/atlas.json`: generated atlas data for the site
- `dist/REPORT.md`: generated Markdown report
- `dist/`: static site output when `generate` runs without `--skip-site`

## `catalog.yml` shape

`catalog.yml` has two top-level keys:

- `organization`: org metadata such as `name`, `description`, and `url`
- `repos`: a map keyed by repo name

Example:

```yml
organization:
  name: BSSM-OSS
  description: 부산소프트웨어마이스터고 OSS 조직의 프로젝트 지도
  url: https://github.com/BSSM-OSS
repos:
  maru:
    featured: true
    category: product
    status: active
    pitch: 입학 원서 작성 및 제출 서비스
    maintainers:
      - '@bssm-oss'
    contribution:
      - frontend
      - backend
      - docs
    difficulty: medium
    techStack:
      - TypeScript
      - Java
      - Spring
```

## MVP non-goals

- Not a database-backed product
- Not an auth system
- Not realtime
- Not analytics
- Not a broad project management platform
