# oss-atlas

## Product Overview

oss-atlas는:

```txt
GitHub 조직을 위한 프로젝트 카탈로그 및 기여 지도 생성기
```

이다.

GitHub organization 페이지는 단순 repository 목록을 보여줄 뿐:

```txt
어떤 프로젝트가 대표작인지
무엇이 활성 상태인지
어디에 기여할 수 있는지
신입이 어디부터 봐야 하는지
```

를 구조적으로 보여주기 어렵다.

oss-atlas는 GitHub metadata와 조직의 수동 큐레이션 정보를 결합하여:

```txt
프로젝트 카탈로그
기여 지도
활성 상태
조직 overview
```

를 정적 사이트 형태로 생성한다.

---

# Vision

단순 GitHub repo list가 아니라:

```txt
조직의 살아있는 지도(atlas)
```

를 만드는 것이 목표.

---

# Core Problem

현재 GitHub org page의 문제:

```txt
- repo가 많아질수록 탐색 어려움
- 대표 프로젝트가 무엇인지 모름
- inactive repo와 active repo 구분 어려움
- 기여 가능한 프로젝트를 찾기 어려움
- 조직의 방향성이 드러나지 않음
- README 품질에 따라 편차가 큼
```

특히:

```txt
학교 OSS 조직
커뮤니티 조직
학생 프로젝트 조직
```

은 프로젝트 discovery 문제가 큼.

---

# Target Users

## Primary

```txt
BSSM-OSS
학교 개발 조직
오픈소스 커뮤니티
```

---

## Secondary

```txt
개인 GitHub organization
스터디 기반 org
사이드프로젝트 그룹
```

---

# Core Philosophy

## 1. GitHub Metadata Alone Is Not Enough

GitHub API만으로는:

```txt
대표 프로젝트
프로젝트 목적
기여 난이도
조직 내 중요도
```

를 알 수 없다.

따라서:

```txt
자동 수집 + 수동 큐레이션
```

조합이 필요하다.

---

## 2. Curation Is a Feature

`catalog.yml` 기반 수동 메타데이터는:

```txt
추가 작업
```

이 아니라:

```txt
조직의 의도를 드러내는 핵심 기능
```

이다.

---

## 3. Static First

초기 목표는:

```txt
빠른 생성
간단한 배포
GitHub Pages 호환
```

이다.

---

# Product Positioning

NOT:

```txt
GitHub dashboard clone
```

NOT:

```txt
project management tool
```

Closer to:

```txt
Open Source Organization Atlas
```

---

# MVP Scope

## 반드시 포함

### 1. GitHub Organization Fetch

수집 대상:

```txt
repo name
stars
forks
language
updated_at
description
topics
license
archived
```

---

### 2. catalog.yml Support

수동 메타데이터 추가.

예:

```yaml
repos:
  maru:
    featured: true
    category: product
    status: active
    pitch: 입학 원서 작성 및 제출 서비스
    contribution:
      - frontend
      - docs
    difficulty: medium
```

---

### 3. Static Projects Page Generation

생성 결과:

```txt
프로젝트 목록
featured section
category grouping
active/inactive 구분
```

---

### 4. Markdown Report Generation

출력 예:

```md
# BSSM-OSS Projects

## Featured
- Maru
- Jagalchi

## Active Projects
...
```

---

### 5. Contribution Visibility

표시 대상:

```txt
good first issue
needs maintainer
beginner friendly
help wanted
```

---

# Non-goals

초기에는 제외:

```txt
AI DeepWiki generation
real-time dashboard
multi-user auth
DB backend
all git providers
issue analytics
PR analytics
```

---

# Initial UX

## Homepage

```txt
organization overview
featured projects
recently active projects
categories
```

---

## Project Card

포함 정보:

```txt
name
pitch
language
status
stars
updated date
contribution difficulty
links
```

---

## Project Detail

```txt
README summary
maintainers
contribution areas
tech stack
related repos
```

---

# Technical Architecture

## Input Sources

```txt
GitHub REST API
GitHub GraphQL API
catalog.yml
```

---

## Pipeline

```txt
GitHub org fetch
→ metadata normalization
→ catalog.yml merge
→ schema validation
→ static page generation
→ report generation
```

---

# Recommended Stack

## Language

```txt
TypeScript
```

---

## Runtime

```txt
Node.js
```

---

## Static Site

추천:

```txt
Astro
```

이유:

```txt
static-first
content friendly
fast build
simple deployment
```

---

## CLI

```txt
commander
or
cac
```

---

## Validation

```txt
zod
```

---

# Repository Structure

```txt
oss-atlas/
├─ apps/
│  └─ web/
├─ packages/
│  ├─ core/
│  ├─ github/
│  ├─ generator/
│  ├─ schema/
│  └─ ui/
├─ templates/
│  ├─ default/
│  └─ minimal/
├─ examples/
│  └─ bssm-oss/
├─ docs/
└─ catalog.schema.json
```

---

# Core Data Model

## RepoMetadata

```ts
interface RepoMetadata {
  name: string
  description?: string
  stars: number
  forks: number
  language?: string
  archived: boolean
  updatedAt: string
  topics: string[]
}
```

---

## CatalogEntry

```ts
interface CatalogEntry {
  featured?: boolean
  category?: string
  status?: 'active' | 'maintenance' | 'archived'
  pitch?: string
  contribution?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
}
```

---

# catalog.yml Design

```yaml
organization:
  name: BSSM-OSS
  description: 부산소프트웨어마이스터고 OSS 조직

repos:
  maru:
    featured: true
    category: product
    status: active
    pitch: 입학 원서 작성 및 제출 서비스
    contribution:
      - frontend
      - backend
      - docs
    difficulty: medium

  jagalchi:
    featured: true
    category: education
    status: active
    pitch: 개발자 로드맵 에디터
    difficulty: hard
```

---

# CLI Design

## Initialize

```bash
oss-atlas init
```

---

## Generate Site

```bash
oss-atlas generate
```

---

## Sync GitHub Metadata

```bash
oss-atlas sync
```

---

## Build Markdown Report

```bash
oss-atlas report
```

---

# Output Modes

## Static Website

목표:

```txt
GitHub Pages deployment
```

---

## Markdown Report

용도:

```txt
README
weekly updates
organization overview
```

---

## JSON Export

용도:

```txt
custom integrations
future tooling
```

---

# Validation Goals

성공 기준:

```txt
GitHub org 페이지보다 프로젝트 이해가 빠르다
```

---

## BSSM-OSS Validation

```txt
Projects page를 실제 BSSM-OSS에서 사용 가능
```

---

## External Validation

```txt
다른 OSS organization에도 적용 가능
```

---

# Risks

## 1. Metadata Maintenance Fatigue

문제:

```txt
catalog.yml 관리 귀찮음
```

대응:

```txt
자동 defaults
optional fields
```

---

## 2. Weak Differentiation

문제:

```txt
단순 repo 카드 사이트처럼 보일 수 있음
```

대응:

```txt
contribution mapping
featured curation
organization storytelling
```

---

## 3. GitHub API Rate Limit

대응:

```txt
cache
incremental sync
```

---

# Future Expansion Ideas

## 1. AI-generated Repo Summary

README 기반 요약.

---

## 2. Contribution Recommendation

```txt
Beginner-friendly projects
```

추천.

---

## 3. Dependency/Relation Graph

```txt
repo ↔ repo
```

관계 시각화.

---

## 4. Activity Heatmap

```txt
commit frequency
release activity
```

---

## 5. DeepWiki-style Project Pages

프로젝트별 구조 설명.

---

# Development Roadmap

## v0.1

```txt
GitHub org fetch
catalog.yml
basic static site
markdown report
```

---

## v0.2

```txt
categories
featured projects
contribution tags
status system
```

---

## v0.3

```txt
search/filter
JSON export
custom themes
```

---

## v0.4

```txt
AI-generated summaries
repo relation graph
activity visualization
```

---

# BSSM-OSS Fit

oss-atlas는:

```txt
BSSM-OSS의 프로젝트 지도
```

역할을 수행할 수 있다.

특히:

```txt
대표 프로젝트
활성 프로젝트
기여 가능 영역
```

을 구조적으로 보여줄 수 있음.

---

# Long-term Vision

현재:

```txt
GitHub org
= repository dump
```

목표:

```txt
organization atlas
= curated open source ecosystem map
```

즉:

```txt
repository list
→ organization storytelling
```

로 확장하는 것이 목표.
