# 생기부 조립기 : 블록(Block) - Blueprint (v3.0 Design Overhaul)

## Overview
학생의 탐구 활동을 체계적인 문장으로 조립하고, 최신 과학 뉴스를 통해 탐구 주제를 추천받는 AI 기반 생기부 작성 보조 도구입니다. **고등학생이 매일 쓰고 싶은 세련된 앱 느낌(Notion + 카카오톡 스타일)**으로 디자인이 개편되었습니다.

## Core Architecture
### 1. Frontend (SPA)
- **UI:** Modern, high-hierarchy design. Soft gradients, interactive cards, and clear typography.
- **Styling Strategy:**
  - **Background:** Soft, ethereal gradient (Notion-inspired).
  - **Cards (Q1-Q4):** High-contrast color lines on the left + distinct number badges.
  - **Interactivity:** Subtle scaling and highlighting on focus-within to guide the user's attention.
  - **Buttons:** Vibrant gradients and soft shadows for a "lifted" feel.
  - **Typography:** Strong hierarchy using Pretendard/Noto Sans KR, differentiating titles, labels, and input values.
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
### Visual Overhaul (v3.0)
1. **Q1~Q4 Cards:** Left-side color bars (distinct colors for each stage) and numeric badges for clear progression.
2. **Tab Navigation:** Enhanced active states with a "pill" style and subtle shadows.
3. **Assemble Button:** Dynamic gradient with hover effects for a premium app feel.
4. **Card Focus Effect:** Entire card subtly scales or shifts when the input is active, improving the "alive" feel.
5. **Typography Hierarchy:** Larger headers, bold labels, and comfortable input text sizes.

### Security Standards
- **XSS Protection:** `sanitizeInput` 유틸리티를 통한 태그 제거.
- **Auth Nudge:** 저장/히스토리 등 고급 기능 사용 시 커스텀 모달로 로그인 유도.
- **Firestore Rules:** `request.auth.uid` 검증을 통한 데이터 격리.

### Features
- **Sentence Accumulator:** 조립된 문장을 쌓아서 전체 문단 완성.
- **Smart Insertion:** 추천 단어 클릭 시 현재 커서 위치에 즉시 삽입.
- **Explorer Sync:** 기사 카드 클릭 시 블록 자동 채우기 및 탭 전환.
