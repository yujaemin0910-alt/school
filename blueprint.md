# 생기부 조립기 : 블록(Block) - Blueprint (v2.0 Security & AI)

## Overview
학생의 탐구 활동을 체계적인 문장으로 조립하고, 최신 과학 뉴스를 통해 탐구 주제를 추천받는 AI 기반 생기부 작성 보조 도구입니다.

## Core Architecture
### 1. Frontend (SPA)
- **UI:** Pastel-toned, Responsive Tabs (Builder / Explorer).
- **Storage:** 
  - `localStorage`: 로그인 없이도 실시간 입력값 보관.
  - `Firestore`: 로그인 시 기사 데이터 조회 및 사용자 히스토리 관리.
- **Security:** 모든 사용자 입력값에 대해 XSS(HTML 태그 제거) 필터링 적용.

### 2. Backend (Firebase Functions)
- **RSS Crawler:** ScienceTimes, DongaScience 기사 자동 수집.
- **AI Summary (Gemini):** 배치 처리를 통해 기사를 생기부 4단계 블록(Q1~Q4) 힌트로 변환.
- **Rate Limiter:** 사용자별 일일 API 호출 50회 제한으로 보안 및 비용 통제.

### 3. Database (Firestore)
- **articles:** 크롤링된 탐구 주제 데이터 (Public Read).
- **users:** 사용자별 저장 데이터 (Owner-only Access).
- **usage_limits:** 일일 호출 횟수 카운팅.

## Implementation Details
### Security Standards
- **XSS Protection:** `sanitizeInput` 유틸리티를 통한 태그 제거.
- **Auth Nudge:** 저장/히스토리 등 고급 기능 사용 시 커스텀 모달로 로그인 유도.
- **Firestore Rules:** `request.auth.uid` 검증을 통한 데이터 격리.

### Features
- **Sentence Accumulator:** 조립된 문장을 쌓아서 전체 문단 완성.
- **Smart Insertion:** 추천 단어 클릭 시 현재 커서 위치에 즉시 삽입.
- **Explorer Sync:** 기사 카드 클릭 시 블록 자동 채우기 및 탭 전환.
