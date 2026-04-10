# 생기부 조립기 : 블록(Block) - Blueprint

## Overview
AI가 써주는 것이 아니라, 학생이 빈칸만 채우면 완벽한 생기부 문장이 완성되는 '레고 블록형' 글쓰기 앱입니다. 고등학생들이 생기부(학교생활기록부) 작성을 효율적이고 전문적으로 할 수 있도록 돕습니다.

## Project Details
### Style & Design
- **Theme:** Pastel-toned, modern, mobile-friendly UI.
- **Typography:** Expressive and readable fonts (system-sans-serif, Noto Sans KR).
- **Colors:** Vibrant but soft pastel colors (Light blue, mint, lavender).
- **Layout:** Card-based structure with clear spacing and interactive feedback.
- **Components:** 
  - Floating action buttons or cards for inputs.
  - Progress bar for byte/char counts.
  - Bottom-up popup for word recommendations.
  - **New:** Copy to clipboard, Clear all inputs, Animated result area.

### Features
1. **Block Assembly UI:**
   - Q1. 동기 (Motivation)
   - Q2. 과정 (Process)
   - Q3. 결과 (Result)
   - Q4. 변화 (Change/Reflection)
2. **Assembly Logic:** Joins the inputs into a cohesive paragraph with natural conjunctions.
3. **Advanced Vocabulary Converter:** A dictionary of formal terms (e.g., '알아봤다' -> '탐구함').
4. **NEIS-compatible Counter:** 
   - Autonomous Activity: 500 chars / 1500 bytes.
   - Career Activity: 700 chars / 2100 bytes.
   - Subject-specific: 500 chars / 1500 bytes (typical).
   - Real-time progress bar.

## Current Tasks & Implementation Plan
1. **[Completed] Setup Structure (HTML)**
2. **[Completed] Styling (CSS)**
3. **[Completed] Logic (JavaScript)**
4. **[Completed] Refinement:** Added animations, "Copy/Clear" functionality, and polished UI/UX.

## Implementation Steps for Current Version
1. Update `index.html` with semantic structure and new action buttons.
2. Update `style.css` with modern pastel styles, responsive layout, and animations.
3. Update `main.js` with refined assembly logic and functional improvements (copy, clear, visual feedback).
