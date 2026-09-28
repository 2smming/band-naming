import React, { useState, useEffect, useCallback } from "react";
import { loadStore, loadMeta, saveMeta, saveEntry } from "./store.js";

const FOOD_Q = [
  { id: "f01", tag: "탕수육", prompt: "탕수육은", a: "부어 먹기", b: "찍어 먹기" },
  { id: "f02", tag: "호불호", prompt: "민트초코", a: "좋아함", b: "절대 반대" },
  { id: "f03", tag: "라면", prompt: "라면 면발", a: "꼬들꼬들", b: "푹 퍼진 게 맛" },
  { id: "f04", tag: "치킨", prompt: "치킨 한 마리", a: "후라이드", b: "양념" },
  { id: "f05", tag: "떡볶이", prompt: "떡볶이 떡", a: "밀떡", b: "쌀떡" },
  { id: "f06", tag: "중국집", prompt: "중국집 가면", a: "짜장", b: "짬뽕" },
  { id: "f07", tag: "국물", prompt: "국물은", a: "얼큰한 쪽", b: "맑은 쪽" },
  { id: "f08", tag: "커피", prompt: "커피는", a: "차가운 아메리카노", b: "따뜻한 아메리카노" },
  { id: "f09", tag: "아침", prompt: "아침에 먹는 것", a: "밥", b: "빵" },
  { id: "f10", tag: "냉면", prompt: "냉면은", a: "물냉면", b: "비빔냉면" },
  { id: "f11", tag: "술", prompt: "첫 잔은", a: "맥주", b: "소주" },
  { id: "f12", tag: "회", prompt: "생선은", a: "회", b: "초밥" },
  { id: "f13", tag: "피자", prompt: "피자 도우", a: "얇은 씬", b: "두툼한 오리지널" },
  { id: "f14", tag: "호불호", prompt: "파인애플 피자", a: "괜찮음", b: "용납 불가" },
  { id: "f15", tag: "매운맛", prompt: "매운 음식", a: "잘 먹음", b: "못 먹음" },
  { id: "f16", tag: "야식", prompt: "야식 시키면", a: "치킨", b: "족발" },
  { id: "f17", tag: "디저트", prompt: "디저트는", a: "케이크", b: "아이스크림" },
  { id: "f18", tag: "방식", prompt: "먹으러 갈 때", a: "배달로 집에서", b: "직접 가서 먹기" },
  { id: "f19", tag: "고기", prompt: "회식 고기", a: "삼겹살", b: "소고기" },
  { id: "f20", tag: "김밥", prompt: "김밥 고르면", a: "참치", b: "야채" },
];

const SONG_WORDS = [
  "청춘을 담은", "빛나는 순간", "끝나지 않을 것 같은", "눈부신", "반짝이는", "자유로운",
  "응원하는", "용기를 주는", "위로가 되는", "따뜻한", "다정한", "씩씩한",
  "벅차오르는", "뭉클한", "울컥하는", "애틋한", "그리운", "아련한",
  "설레는", "두근거리는", "사랑스러운", "낭만적인", "순수한", "솔직한",
  "신나는", "질주하는", "유쾌한", "장난스러운", "무모한", "방황하는",
  "폭발적인", "웅장한", "드라마틱한", "성장하는", "함께 부르고 싶은", "떼창하고 싶은",
  "잔잔한", "담담한", "편안한", "서정적인", "몽환적인", "청량한",
  "시원한", "여름밤 같은", "새벽 감성", "노을 지는", "도시적인", "복고풍",
];

const VALUE_WORDS = [
  "사랑", "우정", "신뢰", "진심", "정직", "솔직함", "책임", "성실", "의리", "약속",
  "열정", "몰입", "끈기", "도전", "용기", "담대함", "성장", "호기심", "모험", "자신감",
  "창의성", "상상력", "개성", "감각", "아름다움", "낭만", "설렘", "유머", "독창성", "표현",
  "즐거움", "여유", "평온", "안정", "균형", "조화", "자유", "순수", "감사", "기쁨",
  "배려", "공감", "존중", "다정함", "소통", "인정", "협동", "팀워크", "동행", "응원",
  "위로", "포용", "관용", "겸손", "성찰", "절제", "집중", "질서", "유연함", "지혜",
];

const EN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const KO_LETTERS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const SENSE_GROUPS = [
  { key: "time", label: "좋아하는 시간대", options: ["새벽", "아침", "한낮", "해질녘", "밤", "한밤중"] },
  { key: "season", label: "좋아하는 계절", options: ["봄", "여름", "가을", "겨울", "환절기"] },
  { key: "weather", label: "좋아하는 날씨", options: ["맑음", "흐림", "비", "눈", "안개", "바람 부는 날"] },
  { key: "scent", label: "좋아하는 향", options: ["시트러스", "베르가못", "레몬", "복숭아", "무화과", "코코넛", "플로럴", "로즈", "자스민", "라벤더", "그린", "허브", "유칼립투스", "이끼", "우디", "시더우드", "샌달우드", "스모키", "인센스", "가죽", "머스크", "앰버", "바닐라", "비누향", "비 온 뒤 흙내", "갓 구운 빵", "커피"] },
];

const LIFE_FIELDS = [
  { key: "island", label: "무인도에 하나만 가져간다면", placeholder: "예: 베이스 기타" },
  { key: "song", label: "인생 노래", placeholder: "예: 검정치마 - 기다린 만큼, 더" },
  { key: "movie", label: "인생 영화", placeholder: "예: 리틀 미스 선샤인" },
];

const LIKE_WORDS = [
  "카페에서 멍때리기", "산책", "노래방", "방구석 영화", "정주행", "낮잠",
  "페스티벌", "공연 보러 가기", "전시회", "사진 찍기", "필름카메라", "그림 그리기",
  "게임", "보드게임", "야구 직관", "축구 보기", "러닝", "클라이밍",
  "헬스", "요가", "자전거", "등산", "캠핑", "바다",
  "온천", "여행 계획 세우기", "맛집 탐방", "베이킹", "요리", "술 한잔",
  "디저트", "만화책", "웹툰", "독서", "팟캐스트", "노래 추천 주고받기",
  "쇼핑", "인테리어", "향수", "동물 영상",
];

const PALETTE = [
  { name: "체리레드", hex: "#E4433B" }, { name: "코랄", hex: "#FF7A59" },
  { name: "살구", hex: "#FFB27A" }, { name: "머스터드", hex: "#E8B23A" },
  { name: "레몬", hex: "#F3E06A" }, { name: "라임", hex: "#C3E24B" },
  { name: "올리브", hex: "#8A9A4B" }, { name: "포레스트", hex: "#2F6E4F" },
  { name: "민트", hex: "#7BD9C0" }, { name: "아쿠아", hex: "#56C4D6" },
  { name: "스카이", hex: "#6FA8F5" }, { name: "코발트", hex: "#2F52D6" },
  { name: "인디고", hex: "#3B2F87" }, { name: "라벤더", hex: "#B4A6F0" },
  { name: "바이올렛", hex: "#7B4FE0" }, { name: "자주", hex: "#8E2F63" },
  { name: "핑크", hex: "#F58BB8" }, { name: "로즈", hex: "#E05A7A" },
  { name: "버건디", hex: "#7A2233" }, { name: "초콜릿", hex: "#6B4430" },
  { name: "베이지", hex: "#E0D0B4" }, { name: "아이보리", hex: "#F3EBDC" },
  { name: "차콜", hex: "#3A3A42" }, { name: "실버", hex: "#C3C7CE" },
];
const hexOf = (n) => (PALETTE.find((c) => c.name === n) || {}).hex || "#ccc";

const MEMBERS = [
  { name: "동진", emoji: "🥁" },
  { name: "원택", emoji: "🎸" },
  { name: "현아", emoji: "🎹🎸" },
  { name: "다연", emoji: "🎤" },
  { name: "운", emoji: "🎸" },
  { name: "수영", emoji: "🎹🎸" },
];

const SECTIONS = [
  { key: "food", label: "음식 밸런스 게임", desc: "먹는 거 취향 20개", type: "balance", set: FOOD_Q },
  { key: "song", label: "어떤 음악을 하고 싶어요?", desc: "키워드 5개랑 떠오르는 곡", type: "song" },
  { key: "lastmeal", label: "마지막 한 끼", desc: "죽기 전에 먹고 싶은 음식", type: "meal" },
  { key: "likes", label: "내 취향 5개", desc: "편하게 고르는 일상 취향", type: "likes" },
  { key: "senses", label: "감각 취향", desc: "시간대, 계절, 날씨, 향", type: "senses" },
  { key: "life", label: "인생 셋", desc: "무인도, 인생 노래, 인생 영화", type: "life" },
  { key: "values", label: "가치 단어 5개", desc: "60개 중 나랑 가까운 5개", type: "chips" },
  { key: "colors", label: "좋아하는 색 3개", desc: "팔레트에서 끌리는 색 3개", type: "colors" },
  { key: "mix", label: "글자와 숫자", desc: "숫자, 알파벳, 자음 하나씩", type: "mix" },
];

const FONT_URLS = [
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css",
  "https://unpkg.com/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css",
];

const CSS = `
.bt-root {
  --ink: #F2EEFF;
  --panel: #FFFFFF;
  --line: rgba(27,20,54,.10);
  --led: #5B3DF5;
  --pop: rgba(214,242,74,.6);
  --cream: #1B1436;
  --mute: rgba(27,20,54,.62);
  --faint: rgba(27,20,54,.42);
  --rust: #DC4A3D;
  min-height: 100%;
  background:
    radial-gradient(120% 60% at 50% -10%, rgba(91,61,245,.13), transparent 62%),
    var(--ink);
  color: var(--cream);
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding: 22px 16px 56px;
  box-sizing: border-box;
}
.bt-wrap { max-width: 440px; margin: 0 auto; }

.bt-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--led);
}
.bt-title { font-size: 27px; font-weight: 700; line-height: 1.28; letter-spacing: -.035em; margin: 12px 0 8px; }
.bt-p { font-size: 14.5px; line-height: 1.72; color: var(--mute); margin: 0 0 4px; }
.bt-dim { color: var(--faint); }
.bt-num { font-variant-numeric: tabular-nums; }

.bt-panel {
  background: var(--panel);
  border: 1px solid rgba(27,20,54,.07);
  border-radius: 18px;
  padding: 24px 20px 22px;
  box-shadow: 0 1px 2px rgba(27,20,54,.05), 0 22px 44px -30px rgba(43,26,120,.55);
}

.bt-nav { display: flex; gap: 3px; margin-bottom: 12px; padding: 3px; border-radius: 12px; background: rgba(27,20,54,.07); }
.bt-nav button {
  flex: 1; background: transparent; border: none; color: var(--faint); border-radius: 9px;
  padding: 9px 4px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
  letter-spacing: -.01em; transition: color .15s ease, background .15s ease;
}
.bt-nav button.on { color: var(--led); background: #fff; box-shadow: 0 1px 3px rgba(27,20,54,.14); }

.bt-q { font-size: 22px; font-weight: 700; line-height: 1.4; letter-spacing: -.035em; margin: 14px 0 18px; }

.bt-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bt-choice {
  width: 100%; aspect-ratio: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  text-align: center; cursor: pointer; word-break: keep-all;
  background: rgba(27,20,54,.025); border: 1px solid var(--line); border-radius: 18px;
  padding: 14px; color: var(--cream); font-size: 16.5px; font-weight: 700; letter-spacing: -.03em;
  line-height: 1.4; font-family: inherit; transition: border-color .15s ease, background .15s ease;
}
.bt-choice:hover { background: rgba(91,61,245,.06); border-color: rgba(91,61,245,.45); }
.bt-choice:focus-visible { outline: 2px solid var(--led); outline-offset: 2px; }
.bt-choice .dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  background: rgba(27,20,54,.16); transition: background .15s ease, box-shadow .15s ease;
}
.bt-choice.on { border-color: rgba(91,61,245,.75); background: rgba(91,61,245,.09); }
.bt-choice.on .dot { background: var(--led); box-shadow: 0 0 0 4px rgba(91,61,245,.18); }

.bt-strip { display: flex; gap: 3px; margin-top: 20px; }
.bt-strip i { height: 3px; border-radius: 2px; background: rgba(27,20,54,.11); flex: 1; }
.bt-strip i.on { background: var(--led); }

.bt-input, .bt-area {
  width: 100%; box-sizing: border-box; background: #FAF9FF;
  border: 1px solid var(--line); border-radius: 12px; padding: 13px 14px;
  color: var(--cream); font-size: 16px; font-family: inherit; margin: 10px 0; line-height: 1.5;
}
.bt-input::placeholder, .bt-area::placeholder { color: rgba(27,20,54,.32); }
.bt-input:focus, .bt-area:focus { outline: none; border-color: var(--led); background: #fff; }
.bt-area { resize: vertical; min-height: 84px; }

.bt-letter { display: flex; align-items: center; gap: 9px; margin-bottom: 7px; }
.bt-letter .ch {
  width: 32px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(91,61,245,.10); border-radius: 9px; font-weight: 700; font-size: 15px; color: var(--led);
}
.bt-letter input {
  flex: 1; box-sizing: border-box; background: #FAF9FF; border: 1px solid var(--line);
  border-radius: 9px; padding: 10px 12px; color: var(--cream); font-size: 15px; font-family: inherit;
}
.bt-letter input:focus { outline: none; border-color: var(--led); background: #fff; }
.bt-letter input::placeholder { color: rgba(27,20,54,.3); }

.bt-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin: 14px 0 4px; }
.bt-grid button {
  aspect-ratio: 1; border: 1px solid var(--line); background: rgba(27,20,54,.025);
  color: var(--cream); border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all .14s ease;
}
.bt-grid button:hover { border-color: rgba(91,61,245,.5); }
.bt-grid button.on { background: var(--led); border-color: var(--led); color: #fff; }
.bt-grid button.taken { color: var(--led); border-color: rgba(91,61,245,.35); background: rgba(91,61,245,.07); }

.bt-btn {
  width: 100%; background: var(--led); color: #fff; border: none; border-radius: 12px;
  padding: 14px; font-size: 15.5px; font-weight: 700; font-family: inherit; cursor: pointer; letter-spacing: -.02em;
}
.bt-btn:disabled { background: rgba(27,20,54,.10); color: var(--faint); cursor: default; }
.bt-btn.ghost { background: transparent; color: var(--mute); border: 1px solid var(--line); }
.bt-btn.ghost:hover { border-color: rgba(91,61,245,.45); color: var(--led); }
.bt-btn.sm { padding: 11px; font-size: 13.5px; font-weight: 600; }
.bt-btn:focus-visible { outline: 2px solid var(--led); outline-offset: 2px; }
.bt-row { display: flex; gap: 8px; margin-top: 10px; }

.bt-card { border-top: 1px solid var(--line); padding: 13px 0 12px; }
.bt-card b { font-size: 16px; font-weight: 600; letter-spacing: -.025em; display: block; margin-top: 4px; }
.bt-tag { font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--faint); }

.bt-fader { display: flex; align-items: center; gap: 11px; margin: 10px 0; }
.bt-fader .nm { width: 74px; font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-fader .track { flex: 1; height: 6px; background: rgba(27,20,54,.10); border-radius: 3px; overflow: hidden; }
.bt-fader .fill { height: 100%; background: var(--led); border-radius: 3px; }
.bt-fader .pct { width: 40px; text-align: right; font-size: 13px; color: var(--mute); font-variant-numeric: tabular-nums; }

.bt-sec { margin-top: 28px; }
.bt-sec h3 { font-size: 17px; font-weight: 700; letter-spacing: -.03em; margin: 0 0 8px; }
.bt-split { color: var(--rust); }

.bt-list {
  display: block; width: 100%; text-align: left; background: rgba(27,20,54,.025);
  border: 1px solid var(--line); border-radius: 13px; padding: 14px 15px; margin-bottom: 8px;
  color: var(--cream); font-family: inherit; cursor: pointer; transition: border-color .15s ease, background .15s ease;
}
.bt-list:hover { border-color: rgba(91,61,245,.45); background: rgba(91,61,245,.05); }
.bt-list strong { display: block; font-size: 15.5px; font-weight: 600; letter-spacing: -.025em; margin-bottom: 3px; }
.bt-list.done { border-color: rgba(91,61,245,.38); background: rgba(91,61,245,.05); }
.bt-side { display: flex; gap: 10px; align-items: baseline; padding: 5px 0; font-size: 14px; line-height: 1.5; }
.bt-side span:first-child { width: 100px; flex-shrink: 0; font-weight: 600; }
.bt-hit { color: #33199E; background: var(--pop); border-radius: 5px; padding: 1px 6px; }
.bt-memo { font-size: 13.5px; line-height: 1.6; color: var(--mute); margin-top: 4px; padding-left: 11px; border-left: 2px solid rgba(91,61,245,.35); }

.bt-back {
  background: none; border: none; padding: 0 0 14px; margin: 0;
  color: var(--faint); font-family: inherit; font-size: 13.5px; font-weight: 600;
  cursor: pointer; display: block;
}
.bt-back:hover { color: var(--led); }
.bt-back:focus-visible { outline: 2px solid var(--led); outline-offset: 2px; border-radius: 6px; }

.bt-members { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 18px 0 14px; }
.bt-member {
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
  padding: 13px 14px; border: 1px solid var(--line); background: rgba(27,20,54,.025);
  border-radius: 14px; font-family: inherit; cursor: pointer; color: var(--cream);
  transition: border-color .15s ease, background .15s ease;
}
.bt-member:hover { border-color: rgba(91,61,245,.45); }
.bt-member.on { border-color: var(--led); background: rgba(91,61,245,.10); }
.bt-member .ico { font-size: 19px; line-height: 1.2; }
.bt-member .nm { font-size: 15.5px; font-weight: 700; letter-spacing: -.02em; }
.bt-member .st { font-size: 12px; color: var(--faint); }
.bt-member.on .st { color: var(--led); }

.bt-prog { margin: 14px 0 18px; }
.bt-prog-top { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: var(--mute); margin-bottom: 7px; }
.bt-prog-top b { color: var(--led); font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.bt-ptrack { height: 8px; background: rgba(27,20,54,.09); border-radius: 4px; overflow: hidden; }
.bt-pfill { display: block; height: 100%; background: var(--led); border-radius: 4px; transition: width .3s ease; }
.bt-mini { display: block; height: 3px; background: rgba(27,20,54,.09); border-radius: 2px; margin-top: 9px; overflow: hidden; }
.bt-mini i { display: block; height: 100%; background: var(--led); border-radius: 2px; }

.bt-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin: 12px 0 18px; }
.bt-swatch {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: none; border: none; padding: 4px 0; font-family: inherit; cursor: pointer; color: var(--cream);
}
.bt-swatch .chip {
  width: 100%; aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(27,20,54,.12);
  transition: transform .14s ease, box-shadow .14s ease;
}
.bt-swatch .nm { font-size: 11.5px; color: var(--faint); font-weight: 600; }
.bt-swatch.on .chip { box-shadow: 0 0 0 3px var(--panel), 0 0 0 5px var(--led); transform: scale(.94); }
.bt-swatch.on .nm { color: var(--led); }
.bt-swatch:disabled { opacity: .32; cursor: default; }
.bt-dot { width: 13px; height: 13px; border-radius: 50%; display: inline-block; border: 1px solid rgba(27,20,54,.12); }

.bt-count { font-size: 13px; color: var(--mute); margin-top: 14px; }
.bt-count b { color: var(--led); font-weight: 700; }
.bt-chips { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0 18px; }
.bt-chip {
  border: 1px solid var(--line); background: #FAF9FF; color: var(--cream);
  border-radius: 999px; padding: 9px 14px; font-size: 14.5px; font-weight: 600;
  font-family: inherit; cursor: pointer; transition: all .14s ease;
}
.bt-chip:hover:not(:disabled) { border-color: rgba(91,61,245,.5); }
.bt-chip.on { background: var(--led); border-color: var(--led); color: #fff; }
.bt-chip:disabled { opacity: .38; cursor: default; }
span.bt-chip { cursor: default; }

@media (prefers-reduced-motion: reduce) { .bt-pfill, .bt-choice, .bt-grid button, .bt-list, .bt-nav button { transition: none; } }
`;

const nowId = () => "r" + Date.now();
const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const emojiOf = (n) => (MEMBERS.find((m) => m.name === n) || {}).emoji || "";
const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, "");
const emptyEntry = () => ({ at: null, senses: {}, life: { island: "", song: "", movie: "" }, likes: [], colors: [], band: {}, food: {}, song: { words: [], title: "" }, lastmeal: { food: "", why: "" }, values: [], ko: { letter: "", item: "", memo: "" }, en: { letter: "", item: "", memo: "" }, num: { n: "" } });
const readPick = (E, key) => {
  const v = E && E[key];
  if (!v) return { letter: "", item: "", memo: "" };
  if (typeof v.letter === "string") return { letter: v.letter, item: v.item || "", memo: v.memo || "" };
  const first = Object.entries(v).find(([, val]) => typeof val === "string" && val.trim());
  return first ? { letter: first[0], item: first[1], memo: "" } : { letter: "", item: "", memo: "" };
};

export default function TasteArchive() {
  const [screen, setScreen] = useState("intro");
  const [section, setSection] = useState(null);
  const [name, setName] = useState("");
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState({});
  const [chipDraft, setChipDraft] = useState([]);
  const [colorDraft, setColorDraft] = useState([]);
  const [likeDraft, setLikeDraft] = useState([]);
  const [senseDraft, setSenseDraft] = useState({});
  const [lifeDraft, setLifeDraft] = useState({ island: "", song: "", movie: "" });
  const [mealDraft, setMealDraft] = useState({ food: "", why: "" });
  const [songDraft, setSongDraft] = useState({ words: [], title: "" });
  const [mixDraft, setMixDraft] = useState({ num: "", en: { letter: "", item: "", memo: "" }, ko: { letter: "", item: "", memo: "" } });
  const [store, setStore] = useState({ rounds: [], activeId: null });
  const [openRound, setOpenRound] = useState(null);
  const [openMember, setOpenMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    FONT_URLS.forEach((href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    });
  }, []);

  const freshStore = () => {
    const id = nowId();
    return { activeId: id, rounds: [{ id, title: "1회차", createdAt: Date.now(), entries: {} }] };
  };

  const SAVE_FAIL = "저장이 안 됐어요. 새로고침 후 다시 시도해주세요!";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStore(await loadStore(freshStore()));
    } catch (e) {
      setNote("불러오지 못했어요. 새로고침 후 다시 시도해주세요!");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveFields = async (fields) => {
    const me = name.trim();
    try {
      const latest = await loadStore(freshStore());
      const round = latest.rounds.find((r) => r.id === latest.activeId);
      const prev = (round && round.entries[me]) || emptyEntry();
      await saveEntry(me, latest.activeId, { ...prev, at: Date.now(), ...fields });
      setStore(await loadStore(freshStore()));
      setNote("");
    } catch (e) { setNote(SAVE_FAIL); }
    setScreen("hub");
    setSection(null);
  };

  const saveSection = (key, value) => saveFields({ [key]: value });

  const active = store.rounds.find((r) => r.id === store.activeId) || { entries: {}, title: "", createdAt: null };
  const entries = active.entries || {};
  const members = Object.keys(entries);
  const me = name.trim();
  const mine = entries[me] || emptyEntry();

  const doneCount = (ent, sec) => {
    if (!ent) return 0;
    if (sec.type === "balance") return Object.keys(ent[sec.key] || {}).length;
    if (sec.type === "chips") return (ent.values || []).length;
    if (sec.type === "meal") return ent.lastmeal && norm(ent.lastmeal.food) ? 1 : 0;
    if (sec.type === "song") return ((ent.song || {}).words || []).length;
    if (sec.type === "colors") return (ent.colors || []).length;
    if (sec.type === "likes") return (ent.likes || []).length;
    if (sec.type === "senses") return SENSE_GROUPS.filter((g) => norm((ent.senses || {})[g.key])).length;
    if (sec.type === "life") return LIFE_FIELDS.filter((f) => norm((ent.life || {})[f.key])).length;
    if (sec.type === "mix") {
      return (ent.num && norm(ent.num.n) ? 1 : 0)
        + (norm(readPick(ent, "en").item) ? 1 : 0)
        + (norm(readPick(ent, "ko").item) ? 1 : 0);
    }
    return 0;
  };

  const balanceResult = (ent, set, key) => {
    const names = Object.keys(ent);
    const unanimous = [], split = [];
    set.forEach((q) => {
      const aN = names.filter((m) => (ent[m][key] || {})[q.id] === "a");
      const bN = names.filter((m) => (ent[m][key] || {})[q.id] === "b");
      if (aN.length + bN.length < 2) return;
      if (aN.length === 0 || bN.length === 0) unanimous.push({ q, choice: aN.length ? q.a : q.b });
      else split.push({ q, aN, bN });
    });
    return { unanimous, split };
  };

  const pickRows = (ent, key) => {
    const names = Object.keys(ent);
    const byLetter = {};
    names.forEach((m) => {
      const v = readPick(ent[m], key);
      if (!norm(v.item)) return;
      const L = v.letter || "?";
      if (!byLetter[L]) byLetter[L] = [];
      byLetter[L].push({ who: m, item: v.item.trim(), memo: (v.memo || "").trim() });
    });
    return Object.entries(byLetter)
      .sort((x, y) => x[0].localeCompare(y[0]))
      .map(([L, picks]) => ({
        L,
        picks,
        sameItem: picks.length >= 2 && new Set(picks.map((p) => norm(p.item))).size === 1,
      }));
  };

  const songRows = (ent) => {
    const map = {}, titles = [];
    Object.keys(ent).forEach((m) => {
      const v = ent[m].song || {};
      (v.words || []).forEach((w) => {
        if (!map[w]) map[w] = { word: w, who: [] };
        map[w].who.push(m);
      });
      if (norm(v.title)) titles.push({ who: m, title: v.title.trim() });
    });
    return {
      words: Object.values(map).sort((x, y) => y.who.length - x.who.length || x.word.localeCompare(y.word)),
      titles,
    };
  };

  const mealRows = (ent) => {
    const map = {};
    Object.keys(ent).forEach((m) => {
      const v = ent[m].lastmeal;
      if (!v || !norm(v.food)) return;
      const k = norm(v.food);
      if (!map[k]) map[k] = { label: v.food.trim(), who: [], why: [] };
      map[k].who.push(m);
      if (norm(v.why)) map[k].why.push(`${m}: ${v.why.trim()}`);
    });
    return Object.values(map).sort((x, y) => y.who.length - x.who.length);
  };

  const senseRows = (ent) => {
    const names = Object.keys(ent);
    return SENSE_GROUPS.map((g) => {
      const map = {};
      names.forEach((m) => {
        const v = (ent[m].senses || {})[g.key];
        if (norm(v)) {
          if (!map[v]) map[v] = { value: v, who: [] };
          map[v].who.push(m);
        }
      });
      return { group: g, picks: Object.values(map).sort((x, y) => y.who.length - x.who.length) };
    }).filter((r) => r.picks.length);
  };

  const lifeRows = (ent) => {
    const names = Object.keys(ent);
    return LIFE_FIELDS.map((f) => ({
      field: f,
      answers: names.map((m) => ({ who: m, text: ((ent[m].life || {})[f.key] || "").trim() })).filter((a) => a.text),
    })).filter((r) => r.answers.length);
  };

  const likeRows = (ent) => {
    const map = {};
    Object.keys(ent).forEach((m) => {
      (ent[m].likes || []).forEach((w) => {
        if (!map[w]) map[w] = { word: w, who: [] };
        map[w].who.push(m);
      });
    });
    return Object.values(map).sort((x, y) => y.who.length - x.who.length || x.word.localeCompare(y.word));
  };

  const colorRows = (ent) => {
    const map = {};
    Object.keys(ent).forEach((m) => {
      (ent[m].colors || []).forEach((c) => {
        if (!map[c]) map[c] = { name: c, who: [] };
        map[c].who.push(m);
      });
    });
    return Object.values(map).sort((x, y) => y.who.length - x.who.length);
  };

  const valueRows = (ent) => {
    const names = Object.keys(ent);
    const map = {};
    names.forEach((m) => {
      (ent[m].values || []).forEach((w) => {
        if (!map[w]) map[w] = { word: w, who: [] };
        map[w].who.push(m);
      });
    });
    return Object.values(map).sort((x, y) => y.who.length - x.who.length || x.word.localeCompare(y.word));
  };

  const numberRows = (ent) => {
    const map = {};
    Object.keys(ent).forEach((m) => {
      const v = ent[m].num && norm(ent[m].num.n);
      if (!v) return;
      if (!map[v]) map[v] = { label: ent[m].num.n.trim(), who: [] };
      map[v].who.push(m);
    });
    return Object.values(map).sort((x, y) => y.who.length - x.who.length);
  };

  const matchPct = (ent) => {
    if (!ent[me]) return [];
    return Object.keys(ent).filter((m) => m !== me).map((m) => {
      let same = 0, total = 0;
      FOOD_Q.forEach((q) => {
        const x = (ent[me].food || {})[q.id], y = (ent[m].food || {})[q.id];
        if (x && y) { total += 1; if (x === y) same += 1; }
      });
      const ms = (ent[me].song || {}).words || [], os = (ent[m].song || {}).words || [];
      if (ms.length && os.length) { total += 5; same += ms.filter((w) => os.includes(w)).length; }
      const ml = ent[me].lastmeal, ol = ent[m].lastmeal;
      if (ml && ol && norm(ml.food) && norm(ol.food)) { total += 1; if (norm(ml.food) === norm(ol.food)) same += 1; }
      SENSE_GROUPS.forEach((g) => {
        const x = (ent[me].senses || {})[g.key], y = (ent[m].senses || {})[g.key];
        if (norm(x) && norm(y)) { total += 1; if (x === y) same += 1; }
      });
      const mk = ent[me].likes || [], ok = ent[m].likes || [];
      if (mk.length && ok.length) { total += 5; same += mk.filter((w) => ok.includes(w)).length; }
      const mc = ent[me].colors || [], oc = ent[m].colors || [];
      if (mc.length && oc.length) { total += 3; same += mc.filter((c) => oc.includes(c)).length; }
      const mv = ent[me].values || [], ov = ent[m].values || [];
      if (mv.length && ov.length) { total += 5; same += mv.filter((w) => ov.includes(w)).length; }
      ["en", "ko"].forEach((k) => {
        const x = readPick(ent[me], k), y = readPick(ent[m], k);
        if (norm(x.item) && norm(y.item) && x.letter === y.letter) {
          total += 1; if (norm(x.item) === norm(y.item)) same += 1;
        }
      });
      const mn = ent[me].num, on2 = ent[m].num;
      if (mn && on2 && norm(mn.n) && norm(on2.n)) { total += 1; if (norm(mn.n) === norm(on2.n)) same += 1; }
      return { name: m, pct: total ? Math.round((same / total) * 100) : 0 };
    }).sort((a, b) => b.pct - a.pct);
  };

  const exportRound = (r) => {
    const ent = r.entries, names = Object.keys(ent);
    const lines = [`[${r.title}] ${fmt(r.createdAt)}`, `참여: ${names.join(", ")}`, ""];
    [["음식 밸런스 게임", FOOD_Q, "food"]].forEach(([title, set, key]) => {
      lines.push(`— ${title}`);
      set.forEach((q, i) => {
        const aN = names.filter((m) => (ent[m][key] || {})[q.id] === "a");
        const bN = names.filter((m) => (ent[m][key] || {})[q.id] === "b");
        lines.push(`${String(i + 1).padStart(2, "0")}. ${q.prompt}`);
        lines.push(`   ${q.a}: ${aN.join(", ") || "없음"} / ${q.b}: ${bN.join(", ") || "없음"}`);
      });
      lines.push("");
    });
    lines.push("— 어떤 음악을 하고 싶어요?");
    names.forEach((m) => {
      const v = ent[m].song || {};
      if ((v.words || []).length || norm(v.title)) {
        lines.push(`${m}: ${(v.words || []).join(", ")}${norm(v.title) ? ` / 곡: ${v.title.trim()}` : ""}`);
      }
    });
    lines.push("", "— 마지막 한 끼");
    names.forEach((m) => {
      const v = ent[m].lastmeal;
      if (v && norm(v.food)) lines.push(`${m}: ${v.food.trim()}${v.why ? ` — ${v.why.trim()}` : ""}`);
    });
    lines.push("", "— 감각 취향");
    names.forEach((m) => {
      const v = ent[m].senses || {};
      const row = SENSE_GROUPS.filter((g) => norm(v[g.key])).map((g) => `${g.label.replace("좋아하는 ", "")}: ${v[g.key]}`);
      if (row.length) lines.push(`${m} · ${row.join(" / ")}`);
    });
    lines.push("", "— 인생 셋");
    names.forEach((m) => {
      const v = ent[m].life || {};
      const row = LIFE_FIELDS.filter((f) => norm(v[f.key])).map((f) => `${f.label}: ${v[f.key].trim()}`);
      if (row.length) lines.push(`${m} · ${row.join(" / ")}`);
    });
    lines.push("", "— 요즘 빠진 것");
    names.forEach((m) => {
      if ((ent[m].likes || []).length) lines.push(`${m}: ${ent[m].likes.join(", ")}`);
    });
    lines.push("", "— 좋아하는 색 3개");
    names.forEach((m) => {
      if ((ent[m].colors || []).length) lines.push(`${m}: ${ent[m].colors.join(", ")}`);
    });
    lines.push("", "— 가치 단어 5개");
    names.forEach((m) => {
      if ((ent[m].values || []).length) lines.push(`${m}: ${ent[m].values.join(", ")}`);
    });
    lines.push("");
    lines.push("", "— 글자와 숫자");
    names.forEach((m) => {
      const en = readPick(ent[m], "en"), ko = readPick(ent[m], "ko");
      const bits = [];
      if (ent[m].num && norm(ent[m].num.n)) bits.push(`숫자 ${ent[m].num.n.trim()}`);
      if (norm(en.item)) bits.push(`${en.letter}: ${en.item.trim()}${en.memo ? ` (${en.memo.trim()})` : ""}`);
      if (norm(ko.item)) bits.push(`${ko.letter}: ${ko.item.trim()}${ko.memo ? ` (${ko.memo.trim()})` : ""}`);
      if (bits.length) lines.push(`${m} · ${bits.join(" / ")}`);
    });
    const text = lines.join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => setNote("기록을 클립보드에 복사했어요!"), () => setNote("복사가 안 됐어요"));
    else setNote("이 브라우저에서는 복사가 안 돼요");
  };

  const buildTable = (r) => {
    const ent = r.entries;
    const head = ["이름"];
    FOOD_Q.forEach((q, i) => head.push(`음식${String(i + 1).padStart(2, "0")} ${q.prompt}`));
    for (let i = 1; i <= 5; i++) head.push(`음악 키워드${i}`);
    head.push("음악 곡");
    head.push("마지막 한 끼", "마지막 한 끼 이유");
    for (let i = 1; i <= 5; i++) head.push(`내 취향${i}`);
    SENSE_GROUPS.forEach((g) => head.push(g.label));
    LIFE_FIELDS.forEach((f) => head.push(f.label));
    for (let i = 1; i <= 5; i++) head.push(`가치 단어${i}`);
    for (let i = 1; i <= 3; i++) head.push(`좋아하는 색${i}`);
    head.push("좋아하는 숫자", "알파벳", "알파벳 답", "알파벳 메모", "자음", "자음 답", "자음 메모");

    const clean = (v) => String(v == null ? "" : v).replace(/[\t\r\n]+/g, " ").trim();
    const rows = MEMBERS.map((mb) => {
      const E = ent[mb.name];
      const row = [mb.name];
      if (!E) return row.concat(new Array(head.length - 1).fill(""));
      FOOD_Q.forEach((q) => { const pk = (E.food || {})[q.id]; row.push(pk ? q[pk] : ""); });
      const sg = E.song || {};
      for (let i = 0; i < 5; i++) row.push((sg.words || [])[i] || "");
      row.push(sg.title || "");
      row.push((E.lastmeal || {}).food || "", (E.lastmeal || {}).why || "");
      for (let i = 0; i < 5; i++) row.push((E.likes || [])[i] || "");
      SENSE_GROUPS.forEach((g) => row.push((E.senses || {})[g.key] || ""));
      LIFE_FIELDS.forEach((f) => row.push((E.life || {})[f.key] || ""));
      for (let i = 0; i < 5; i++) row.push((E.values || [])[i] || "");
      for (let i = 0; i < 3; i++) row.push((E.colors || [])[i] || "");
      row.push((E.num || {}).n || "");
      const en = readPick(E, "en"), ko = readPick(E, "ko");
      row.push(en.letter, en.item, en.memo, ko.letter, ko.item, ko.memo);
      return row.map(clean);
    });
    return [head].concat(rows);
  };

  const copyTable = (r) => {
    const tsv = buildTable(r).map((row) => row.join("\t")).join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tsv).then(
        () => setNote("표를 복사했어요! 스프레드시트에 그대로 붙여넣으면 돼요"),
        () => setNote("복사가 안 됐어요")
      );
    } else setNote("이 브라우저에서는 복사가 안 돼요");
  };

  const downloadCsv = (r) => {
    try {
      const csv = buildTable(r)
        .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `밴드취향_${r.title}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setNote("CSV를 내려받았어요");
    } catch (e) {
      setNote("내려받기가 안 돼요. 표로 복사를 써주세요");
    }
  };

  const closeRound = async () => {
    try {
      const meta = await loadMeta(freshStore());
      const n = meta.rounds.length + 1, id = nowId();
      await saveMeta({ activeId: id, rounds: [...meta.rounds, { id, title: `${n}회차`, createdAt: Date.now() }] });
      setStore(await loadStore(freshStore()));
    } catch (e) { setNote(SAVE_FAIL); return; }
    setScreen("intro");
    setNote("새 회차를 열었어요. 이전 회차는 아카이브에 남아 있어요");
  };

  const startSection = (sec) => {
    setSection(sec);
    if (sec.type === "balance") { setDraft({ ...(mine[sec.key] || {}) }); setIdx(0); setScreen("balance"); }
    else if (sec.type === "chips") { setChipDraft([...(mine.values || [])]); setScreen("chips"); }
    else if (sec.type === "colors") { setColorDraft([...(mine.colors || [])]); setScreen("colors"); }
    else if (sec.type === "likes") { setLikeDraft([...(mine.likes || [])]); setScreen("likes"); }
    else if (sec.type === "senses") { setSenseDraft({ ...(mine.senses || {}) }); setScreen("senses"); }
    else if (sec.type === "life") { setLifeDraft({ island: "", song: "", movie: "", ...(mine.life || {}) }); setScreen("life"); }
    else if (sec.type === "meal") { setMealDraft({ ...(mine.lastmeal || { food: "", why: "" }) }); setScreen("meal"); }
    else if (sec.type === "song") { const v = mine.song || { words: [], title: "" }; setSongDraft({ words: [...(v.words || [])], title: v.title || "" }); setScreen("song"); }
    else if (sec.type === "mix") {
      setMixDraft({
        num: ((mine.num || {}).n) || "",
        en: readPick(mine, "en"),
        ko: readPick(mine, "ko"),
      });
      setScreen("mix");
    }
  };

  const pick = (choice) => {
    const q = section.set[idx];
    const next = { ...draft, [q.id]: choice };
    setDraft(next);
    if (idx + 1 < section.set.length) setIdx(idx + 1);
    else saveSection(section.key, next);
  };

  const takenOf = (key) => {
    const t = {};
    members.forEach((m) => {
      const v = readPick(entries[m], key);
      if (norm(v.item) && v.letter && m !== me) t[v.letter] = (t[v.letter] || 0) + 1;
    });
    return t;
  };
  const takenEn = takenOf("en"), takenKo = takenOf("ko");

  const foodRes = balanceResult(entries, FOOD_Q, "food");
  const vals = valueRows(entries);
  const cols = colorRows(entries);
  const likes = likeRows(entries);
  const senses = senseRows(entries);
  const lifes = lifeRows(entries);
  const meals = mealRows(entries);
  const songs = songRows(entries);
  const alpha = pickRows(entries, "en");
  const koAlpha = pickRows(entries, "ko");
  const nums = numberRows(entries);
  const matches = matchPct(entries);

  const goBack = () => {
    if (screen === "hub") { setName(""); setScreen("intro"); return; }
    if (screen === "balance") {
      if (Object.keys(draft).length) saveSection(section.key, draft);
      else { setSection(null); setScreen("hub"); }
      return;
    }
    if (screen === "round") {
      if (openMember) { setOpenMember(null); return; }
      setScreen("archive");
      return;
    }
    if (screen === "archive" || screen === "result") { setScreen(me ? "hub" : "intro"); return; }
    setSection(null);
    setScreen("hub");
  };

  const Nav = () => (
    <div className="bt-nav">
      <button className={screen === "intro" || screen === "hub" ? "on" : ""} onClick={() => setScreen(me ? "hub" : "intro")}>참여</button>
      <button className={screen === "result" ? "on" : ""} onClick={() => setScreen("result")}>결과</button>
      <button className={screen === "archive" || screen === "round" ? "on" : ""} onClick={() => { setOpenRound(null); setOpenMember(null); setScreen("archive"); }}>아카이브</button>
    </div>
  );

  return (
    <div className="bt-root">
      <style>{CSS}</style>
      <div className="bt-wrap">
        {screen !== "balance" && <Nav />}
        <div className="bt-panel">
          {screen !== "intro" && (
            <button className="bt-back" onClick={goBack}>← 돌아가기</button>
          )}
          {note && <p style={{ color: "var(--led)", fontSize: 13, marginTop: 0 }}>{note}</p>}

          {screen === "intro" && (
            <>
              <div className="bt-eyebrow">소요시간 10분</div>
              <div className="bt-title">진짜 밴드 이름 정하기</div>
              <p className="bt-p">우리 이제 정말 이름을 정해 보아요! 그 전에 좋아하는 것들을 모아서 ᕕ( ᐛ )ᕗ<br />아래에서 이름을 먼저 골라주세요!</p>
              <div className="bt-members">
                {MEMBERS.map((mb) => {
                  const E = entries[mb.name];
                  const st = SECTIONS.map((sec) => {
                    const t = sec.type === "balance" ? sec.set.length
                      : sec.type === "chips" || sec.type === "song" || sec.type === "likes" ? 5
                      : sec.type === "colors" ? 3
                      : sec.type === "senses" ? SENSE_GROUPS.length
                      : sec.type === "life" ? LIFE_FIELDS.length
                      : sec.type === "mix" ? 3 : 1;
                    return { t, d: E ? Math.min(doneCount(E, sec), t) : 0 };
                  });
                  const pct = Math.round((st.reduce((a, x) => a + x.d, 0) / st.reduce((a, x) => a + x.t, 0)) * 100);
                  return (
                    <button
                      key={mb.name}
                      className={"bt-member" + (name === mb.name ? " on" : "")}
                      onClick={() => setName(mb.name)}
                    >
                      <span className="ico">{mb.emoji}</span>
                      <span className="nm">{mb.name}</span>
                      <span className="st">{pct > 0 ? `${pct}% 완료` : "기다리는 중"}</span>
                    </button>
                  );
                })}
              </div>
              <button className="bt-btn" disabled={!name} onClick={() => setScreen("hub")}>시작하기</button>
              <p className="bt-p bt-dim" style={{ fontSize: 12.5, marginTop: 18 }}>
                입력한 내용은 모든 멤버에게 공개됩니다.
              </p>
            </>
          )}

          {screen === "hub" && (
            <>
              <div className="bt-eyebrow">{emojiOf(me)} {me}</div>
              <div className="bt-title">취향을 나눠주세요!</div>
              {(() => {
                const stats = SECTIONS.map((sec) => {
                  const total = sec.type === "balance" ? sec.set.length : sec.type === "chips" || sec.type === "song" || sec.type === "likes" ? 5 : sec.type === "colors" ? 3 : sec.type === "senses" ? SENSE_GROUPS.length : sec.type === "life" ? LIFE_FIELDS.length : sec.type === "mix" ? 3 : 1;
                  const done = Math.min(doneCount(mine, sec), total);
                  return { sec, total, done };
                });
                const sumDone = stats.reduce((a, x) => a + x.done, 0);
                const sumTotal = stats.reduce((a, x) => a + x.total, 0);
                const pct = Math.round((sumDone / sumTotal) * 100);
                const finished = stats.filter((x) => x.done === x.total).length;
                return (
                  <>
                    <div className="bt-prog">
                      <div className="bt-prog-top">
                        <span>코너 {finished} / {SECTIONS.length} 완료</span>
                        <b>{pct}%</b>
                      </div>
                      <div className="bt-ptrack"><span className="bt-pfill" style={{ width: pct + "%" }} /></div>
                    </div>
                    {stats.map(({ sec, total, done }) => (
                      <button key={sec.key} className={"bt-list" + (done === total ? " done" : "")} onClick={() => startSection(sec)}>
                        <strong>{sec.label}{done === total ? " ✓" : ""}</strong>
                        <span className="bt-dim" style={{ fontSize: 13 }}>
                          {sec.desc} · {done ? (total > 1 ? `${done}/${total} 채움` : "채움") : "아직 안 함"}
                        </span>
                        <span className="bt-mini"><i style={{ width: Math.round((done / total) * 100) + "%" }} /></span>
                      </button>
                    ))}
                  </>
                );
              })()}
              <button className="bt-btn ghost sm" style={{ marginTop: 12 }} onClick={() => setScreen("result")}>결과 보기</button>
            </>
          )}

          {screen === "balance" && section && (
            <>
              <div className="bt-eyebrow bt-num">{String(idx + 1).padStart(2, "0")} / {section.set.length} · {section.set[idx].tag}</div>
              <div className="bt-q">{section.set[idx].prompt}</div>
              <div className="bt-choices">
                {["a", "b"].map((k) => (
                  <button key={k} className={"bt-choice" + (draft[section.set[idx].id] === k ? " on" : "")} onClick={() => pick(k)}>
                    <span className="dot" />{section.set[idx][k]}
                  </button>
                ))}
              </div>
              <div className="bt-strip">{section.set.map((q, i) => <i key={q.id} className={i < idx ? "on" : ""} />)}</div>
              <div className="bt-row">
                {idx > 0 && <button className="bt-btn ghost sm" onClick={() => setIdx(idx - 1)}>이전</button>}
                <button className="bt-btn ghost sm" onClick={() => saveSection(section.key, draft)}>여기까지 저장</button>
              </div>
            </>
          )}

          {screen === "song" && (
            <>
              <div className="bt-eyebrow">어떤 음악을 하고 싶어요? · {me}</div>
              <div className="bt-title">어떤 음악을<br />하고 싶어요?</div>
              <p className="bt-p">끌리는 키워드를 다섯 개까지 골라주세요! 떠오르는 곡이 있으면 아래에 적어주셔도 좋아요 ᕕ( ᐛ )ᕗ</p>
              <div className="bt-count">선택 <b>{songDraft.words.length}</b> / 5</div>
              <div className="bt-chips">
                {SONG_WORDS.map((w) => {
                  const on = songDraft.words.includes(w);
                  return (
                    <button
                      key={w}
                      className={"bt-chip" + (on ? " on" : "")}
                      disabled={!on && songDraft.words.length >= 5}
                      onClick={() => setSongDraft({ ...songDraft, words: on ? songDraft.words.filter((x) => x !== w) : [...songDraft.words, w] })}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <input
                className="bt-input"
                value={songDraft.title}
                maxLength={40}
                placeholder="떠오르는 곡 (예: 히게단 - Pretender)"
                onChange={(e) => setSongDraft({ ...songDraft, title: e.target.value })}
              />
              <button className="bt-btn" disabled={!songDraft.words.length && !songDraft.title.trim()} onClick={() => saveSection("song", songDraft)}>저장하기</button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "meal" && (
            <>
              <div className="bt-eyebrow">마지막 한 끼 · {me}</div>
              <div className="bt-title">죽기 전에<br />딱 한 끼만 먹는다면?</div>
              <p className="bt-p">메뉴 하나랑 왜 그건지 적어주세요! 가게 이름을 적어주셔도 좋아요</p>
              <input
                className="bt-input"
                value={mealDraft.food}
                maxLength={30}
                placeholder="예: 엄마가 해준 김치찌개"
                onChange={(e) => setMealDraft({ ...mealDraft, food: e.target.value })}
              />
              <textarea
                className="bt-area"
                value={mealDraft.why}
                maxLength={200}
                placeholder="왜 그건지, 누구랑 먹고 싶은지, 아무거나"
                onChange={(e) => setMealDraft({ ...mealDraft, why: e.target.value })}
              />
              <button className="bt-btn" disabled={!mealDraft.food.trim()} onClick={() => saveSection("lastmeal", mealDraft)}>저장하기</button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "senses" && (
            <>
              <div className="bt-eyebrow">감각 취향 · {me}</div>
              <div className="bt-title">어떤 순간을<br />좋아해요?</div>
              <p className="bt-p">시간대, 계절, 날씨, 향에서 하나씩 골라주세요! 건너뛰어도 괜찮아요</p>
              {SENSE_GROUPS.map((g) => (
                <div key={g.key} style={{ marginTop: 18 }}>
                  <span className="bt-tag">{g.label}</span>
                  <div className="bt-chips" style={{ marginTop: 8, marginBottom: 0 }}>
                    {g.options.map((o) => (
                      <button
                        key={o}
                        className={"bt-chip" + (senseDraft[g.key] === o ? " on" : "")}
                        onClick={() => setSenseDraft({ ...senseDraft, [g.key]: senseDraft[g.key] === o ? "" : o })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="bt-btn"
                style={{ marginTop: 20 }}
                disabled={!SENSE_GROUPS.some((g) => norm(senseDraft[g.key]))}
                onClick={() => saveSection("senses", senseDraft)}
              >
                저장하기
              </button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "life" && (
            <>
              <div className="bt-eyebrow">인생 셋 · {me}</div>
              <div className="bt-title">인생에서<br />딱 하나씩</div>
              <p className="bt-p">고민 오래 하지 말고 지금 떠오르는 걸로 적어주세요! 비워두셔도 괜찮아요</p>
              {LIFE_FIELDS.map((f) => (
                <div key={f.key} style={{ marginTop: 14 }}>
                  <span className="bt-tag">{f.label}</span>
                  <input
                    className="bt-input"
                    value={lifeDraft[f.key] || ""}
                    maxLength={40}
                    placeholder={f.placeholder}
                    onChange={(e) => setLifeDraft({ ...lifeDraft, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <button
                className="bt-btn"
                style={{ marginTop: 16 }}
                disabled={!LIFE_FIELDS.some((f) => norm(lifeDraft[f.key]))}
                onClick={() => saveSection("life", lifeDraft)}
              >
                저장하기
              </button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "likes" && (
            <>
              <div className="bt-eyebrow">요즘 빠진 것 · {me}</div>
              <div className="bt-title">요즘 뭐에<br />빠져 있어요?</div>
              <p className="bt-p">정답 없어요! 요즘 마음 가는 걸 다섯 개까지 편하게 골라주세요 ᕕ( ᐛ )ᕗ</p>
              <div className="bt-count">선택 <b>{likeDraft.length}</b> / 5</div>
              <div className="bt-chips">
                {LIKE_WORDS.map((w) => {
                  const on = likeDraft.includes(w);
                  return (
                    <button
                      key={w}
                      className={"bt-chip" + (on ? " on" : "")}
                      disabled={!on && likeDraft.length >= 5}
                      onClick={() => setLikeDraft(on ? likeDraft.filter((x) => x !== w) : [...likeDraft, w])}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <button className="bt-btn" disabled={!likeDraft.length} onClick={() => saveSection("likes", likeDraft)}>저장하기</button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "colors" && (
            <>
              <div className="bt-eyebrow">좋아하는 색 · {me}</div>
              <div className="bt-title">좋아하는 색 세 개</div>
              <p className="bt-p">팔레트에서 내가 좋아하는 색 세 개를 골라주세요! 다시 누르면 취소돼요</p>
              <div className="bt-count">선택 <b>{colorDraft.length}</b> / 3</div>
              <div className="bt-swatches">
                {PALETTE.map((c) => {
                  const on = colorDraft.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      className={"bt-swatch" + (on ? " on" : "")}
                      disabled={!on && colorDraft.length >= 3}
                      onClick={() => setColorDraft(on ? colorDraft.filter((x) => x !== c.name) : [...colorDraft, c.name])}
                    >
                      <span className="chip" style={{ background: c.hex }} />
                      <span className="nm">{c.name}</span>
                    </button>
                  );
                })}
              </div>
              <button className="bt-btn" disabled={colorDraft.length !== 3} onClick={() => saveSection("colors", colorDraft)}>
                {colorDraft.length === 3 ? "저장하기" : `${3 - colorDraft.length}개 더 고르기`}
              </button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "chips" && (
            <>
              <div className="bt-eyebrow">가치 단어 · {me}</div>
              <div className="bt-title">나를 남기는<br />단어 다섯 개</div>
              <p className="bt-p">60개 중에서 나랑 제일 가까운 다섯 개만 골라주세요! 다시 누르면 취소돼요</p>
              <div className="bt-count">선택 <b>{chipDraft.length}</b> / 5</div>
              <div className="bt-chips">
                {VALUE_WORDS.map((w) => {
                  const on = chipDraft.includes(w);
                  return (
                    <button
                      key={w}
                      className={"bt-chip" + (on ? " on" : "")}
                      disabled={!on && chipDraft.length >= 5}
                      onClick={() => setChipDraft(on ? chipDraft.filter((x) => x !== w) : [...chipDraft, w])}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <button className="bt-btn" disabled={chipDraft.length !== 5} onClick={() => saveSection("values", chipDraft)}>
                {chipDraft.length === 5 ? "저장하기" : `${5 - chipDraft.length}개 더 고르기`}
              </button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "mix" && (
            <>
              <div className="bt-eyebrow">글자와 숫자 · {me}</div>
              <div className="bt-title">숫자 하나,<br />글자 하나씩</div>
              <p className="bt-p">좋아하는 숫자를 적고, 알파벳과 자음도 하나씩 골라주세요! 고른 글자에만 메모를 남기면 돼요</p>

              <div style={{ marginTop: 20 }}>
                <span className="bt-tag">좋아하는 숫자</span>
                <input
                  className="bt-input"
                  value={mixDraft.num}
                  maxLength={10}
                  placeholder="예: 7"
                  onChange={(e) => setMixDraft({ ...mixDraft, num: e.target.value })}
                />
              </div>

              {[
                { key: "en", label: "A부터 Z까지", letters: EN_LETTERS, taken: takenEn, cols: 6 },
                { key: "ko", label: "ㄱ부터 ㅎ까지", letters: KO_LETTERS, taken: takenKo, cols: 7 },
              ].map((blk) => {
                const cur = mixDraft[blk.key];
                return (
                  <div key={blk.key} style={{ marginTop: 24 }}>
                    <span className="bt-tag">{blk.label}</span>
                    <div className="bt-grid" style={{ gridTemplateColumns: `repeat(${blk.cols}, 1fr)` }}>
                      {blk.letters.map((L) => (
                        <button
                          key={L}
                          className={cur.letter === L ? "on" : blk.taken[L] ? "taken" : ""}
                          onClick={() => setMixDraft({ ...mixDraft, [blk.key]: { ...cur, letter: cur.letter === L ? "" : L } })}
                        >
                          {L}
                        </button>
                      ))}
                    </div>
                    {cur.letter && (
                      <>
                        <input
                          className="bt-input"
                          value={cur.item}
                          maxLength={30}
                          placeholder={`${cur.letter}로 시작하는 좋아하는 것`}
                          onChange={(e) => setMixDraft({ ...mixDraft, [blk.key]: { ...cur, item: e.target.value } })}
                        />
                        <textarea
                          className="bt-area"
                          value={cur.memo}
                          maxLength={200}
                          placeholder="메모. 왜 좋아하는지, 언제부터인지, 아무거나"
                          onChange={(e) => setMixDraft({ ...mixDraft, [blk.key]: { ...cur, memo: e.target.value } })}
                        />
                      </>
                    )}
                  </div>
                );
              })}

              <p className="bt-p bt-dim" style={{ fontSize: 12.5, marginTop: 10 }}>연보라로 칠해진 글자는 다른 멤버가 이미 고른 글자예요</p>
              <button
                className="bt-btn"
                style={{ marginTop: 12 }}
                disabled={!norm(mixDraft.num) && !norm(mixDraft.en.item) && !norm(mixDraft.ko.item)}
                onClick={() => saveFields({ num: { n: mixDraft.num }, en: mixDraft.en, ko: mixDraft.ko })}
              >
                저장하기
              </button>
              <button className="bt-btn ghost sm" style={{ marginTop: 8 }} onClick={() => setScreen("hub")}>돌아가기</button>
            </>
          )}

          {screen === "result" && (
            <>
              <div className="bt-eyebrow">결과 · 멤버 {members.length}명</div>
              <div className="bt-title">겹친 취향</div>
              {members.length < 2 && <p className="bt-p">아직 한 명뿐이에요. 다른 멤버가 답하면 겹치는 항목이 여기에 쌓여요</p>}
              {members.length >= 2 && (
                <>
                  {entries[me] && matches.length > 0 && (
                    <div className="bt-sec">
                      <h3>{me}와의 취향 일치율</h3>
                      {matches.map((m) => (
                        <div className="bt-fader" key={m.name}>
                          <span className="nm">{m.name}</span>
                          <span className="track"><span className="fill" style={{ width: m.pct + "%" }} /></span>
                          <span className="pct">{m.pct}%</span>
                        </div>
                      ))}
                      <p className="bt-p bt-dim" style={{ fontSize: 12.5 }}>둘 다 답한 항목끼리만 비교한 값이에요</p>
                    </div>
                  )}

                  {[["음식 밸런스 게임", foodRes]].map(([title, res]) => (
                    <div className="bt-sec" key={title}>
                      <h3>{title} 전원 일치 {res.unanimous.length}개</h3>
                      {res.unanimous.length === 0 && <p className="bt-p">아직 없어요</p>}
                      {res.unanimous.map(({ q, choice }) => (
                        <div className="bt-card" key={q.id}>
                          <span className="bt-tag">{q.tag}</span>
                          <b>{choice}</b>
                          <span className="bt-dim" style={{ fontSize: 13 }}>{q.prompt}</span>
                        </div>
                      ))}
                      {res.split.length > 0 && <p className="bt-split" style={{ fontSize: 13.5, marginTop: 10 }}>갈린 문항 {res.split.length}개는 아카이브에서 볼 수 있어요</p>}
                    </div>
                  ))}

                  <div className="bt-sec">
                    <h3>어떤 음악을 하고 싶어요?</h3>
                    {songs.words.length === 0 && songs.titles.length === 0 && <p className="bt-p">아직 아무도 안 골랐어요</p>}
                    {songs.words.map((v) => (
                      <div className="bt-side" key={v.word}>
                        <span className={v.who.length >= 2 ? "bt-hit" : ""}>{v.word}</span>
                        <span className="bt-dim">{v.who.join(", ")}</span>
                      </div>
                    ))}
                    {songs.titles.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <span className="bt-tag">올라온 곡</span>
                        {songs.titles.map((t, i) => (
                          <div className="bt-side" key={i}><span>{t.title}</span><span className="bt-dim">{t.who}</span></div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bt-sec">
                    <h3>어떤 음악을 하고 싶어요?</h3>
                    {((E.song || {}).words || []).length ? (
                      <div className="bt-chips">
                        {E.song.words.map((w) => <span className="bt-chip on" key={w}>{w}</span>)}
                      </div>
                    ) : null}
                    {norm((E.song || {}).title) ? <p className="bt-p">곡: {E.song.title}</p> : null}
                    {!((E.song || {}).words || []).length && !norm((E.song || {}).title) && <p className="bt-p">안 골랐어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>마지막 한 끼</h3>
                    {meals.length === 0 && <p className="bt-p">아직 아무도 안 적었어요</p>}
                    {meals.map((g, i) => (
                      <div className="bt-card" key={i}>
                        <span className="bt-tag">{g.who.length >= 2 ? "겹침" : "단독"}</span>
                        <b className={g.who.length >= 2 ? "bt-hit" : ""}>{g.label}</b>
                        <span className="bt-dim" style={{ fontSize: 13 }}>{g.who.join(", ")}</span>
                        {g.why.map((w, j) => <div className="bt-memo" key={j}>{w}</div>)}
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>감각 취향</h3>
                    {senses.length === 0 && <p className="bt-p">아직 아무도 안 골랐어요</p>}
                    {senses.map(({ group, picks }) => (
                      <div className="bt-card" key={group.key}>
                        <span className="bt-tag">{group.label}</span>
                        {picks.map((p) => (
                          <div className="bt-side" key={p.value}>
                            <span className={p.who.length >= 2 ? "bt-hit" : ""}>{p.value}</span>
                            <span className="bt-dim">{p.who.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>인생 셋</h3>
                    {lifes.length === 0 && <p className="bt-p">아직 아무도 안 적었어요</p>}
                    {lifes.map(({ field, answers }) => (
                      <div className="bt-card" key={field.key}>
                        <span className="bt-tag">{field.label}</span>
                        {answers.map((a, i) => (
                          <div className="bt-side" key={i}>
                            <span>{a.text}</span>
                            <span className="bt-dim">{a.who}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>요즘 빠진 것 겹친 것 {likes.filter((v) => v.who.length >= 2).length}개</h3>
                    {likes.length === 0 && <p className="bt-p">아직 아무도 안 골랐어요</p>}
                    {likes.map((v) => (
                      <div className="bt-side" key={v.word}>
                        <span className={v.who.length >= 2 ? "bt-hit" : ""}>{v.word}</span>
                        <span className="bt-dim">{v.who.join(", ")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>가치 단어 겹친 것 {vals.filter((v) => v.who.length >= 2).length}개</h3>
                    {vals.length === 0 && <p className="bt-p">아직 아무도 안 골랐어요</p>}
                    {vals.map((v) => (
                      <div className="bt-side" key={v.word}>
                        <span className={v.who.length >= 2 ? "bt-hit" : ""}>{v.word}</span>
                        <span className="bt-dim">{v.who.join(", ")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>글자와 숫자</h3>
                    {nums.length === 0 && alpha.length === 0 && koAlpha.length === 0 && <p className="bt-p">아직 아무도 안 적었어요</p>}
                    {nums.length > 0 && (
                      <div className="bt-card">
                        <span className="bt-tag">좋아하는 숫자</span>
                        {nums.map((g, i) => (
                          <div className="bt-side" key={i}>
                            <span className={g.who.length >= 2 ? "bt-hit" : ""}>{g.label}</span>
                            <span className="bt-dim">{g.who.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {[["A부터 Z까지", alpha], ["ㄱ부터 ㅎ까지", koAlpha]].map(([label, rows]) => (
                      rows.length > 0 ? (
                        <div className="bt-card" key={label}>
                          <span className="bt-tag">{label}</span>
                          {rows.map((row) => (
                            <div key={row.L} style={{ marginTop: 8 }}>
                              <span className="bt-tag">{row.L}{row.picks.length >= 2 ? (row.sameItem ? " · 같은 답" : " · 같은 글자") : ""}</span>
                              {row.picks.map((pk, i) => (
                                <div key={i} style={{ marginTop: 4 }}>
                                  <b className={row.sameItem ? "bt-hit" : ""}>{pk.item}</b>
                                  <span className="bt-dim" style={{ fontSize: 13 }}> {pk.who}</span>
                                  {pk.memo && <div className="bt-memo">{pk.memo}</div>}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : null
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>좋아하는 색 겹친 것 {cols.filter((c) => c.who.length >= 2).length}개</h3>
                    {cols.length === 0 && <p className="bt-p">아직 아무도 안 골랐어요</p>}
                    {cols.map((c) => (
                      <div className="bt-side" key={c.name}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="bt-dot" style={{ background: hexOf(c.name) }} />
                          <span className={c.who.length >= 2 ? "bt-hit" : ""}>{c.name}</span>
                        </span>
                        <span className="bt-dim">{c.who.join(", ")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bt-sec">
                    <h3>좋아하는 색 3개</h3>
                    {(E.colors || []).length ? (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {E.colors.map((c) => (
                          <span key={c} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14 }}>
                            <span className="bt-dot" style={{ background: hexOf(c) }} />{c}
                          </span>
                        ))}
                      </div>
                    ) : <p className="bt-p">안 골랐어요</p>}
                  </div>
                </>
              )}
              <div className="bt-row">
                <button className="bt-btn ghost sm" onClick={load}>새로고침</button>
                <button className="bt-btn ghost sm" onClick={() => setScreen(me ? "hub" : "intro")}>이어서 하기</button>
              </div>
            </>
          )}

          {screen === "archive" && (
            <>
              <div className="bt-eyebrow">아카이브 · 회차 {store.rounds.length}개</div>
              <div className="bt-title">지난 기록</div>
              <p className="bt-p" style={{ marginBottom: 14 }}>회차를 열면 누가 뭘 골랐는지 전부 남아 있어요</p>
              {store.rounds.slice().reverse().map((r) => (
                <button key={r.id} className="bt-list" onClick={() => { setOpenRound(r.id); setOpenMember(null); setScreen("round"); }}>
                  <strong>{r.title}{r.id === store.activeId ? " (진행 중)" : ""}</strong>
                  <span className="bt-dim" style={{ fontSize: 13 }}>
                    {fmt(r.createdAt)} · {Object.keys(r.entries).length}명 {Object.keys(r.entries).length ? "· " + Object.keys(r.entries).join(", ") : ""}
                  </span>
                </button>
              ))}
              <button className="bt-btn ghost sm" style={{ marginTop: 12 }} onClick={closeRound}>이번 회차 마감하고 새 회차 열기</button>
            </>
          )}

          {screen === "round" && (() => {
            const r = store.rounds.find((x) => x.id === openRound);
            if (!r) return <p className="bt-p">회차를 찾을 수 없어요</p>;
            const ent = r.entries, names = Object.keys(ent);

            if (openMember && ent[openMember]) {
              const E = ent[openMember], en = readPick(E, "en"), ko = readPick(E, "ko");
              return (
                <>
                  <div className="bt-eyebrow">{r.title} · {openMember}</div>
                  <div className="bt-title">{openMember}의 답</div>
                  <p className="bt-p bt-dim" style={{ fontSize: 13 }}>{E.at ? fmt(E.at) + " 기록" : "기록 시각 없음"}</p>
                  {[["음식 밸런스 게임", FOOD_Q, "food"]].map(([title, set, key]) => (
                    <div className="bt-sec" key={key}>
                      <h3>{title}</h3>
                      {set.map((q, i) => {
                        const p = (E[key] || {})[q.id];
                        return (
                          <div className="bt-card" key={q.id}>
                            <span className="bt-tag bt-num">{String(i + 1).padStart(2, "0")} · {q.tag}</span>
                            <b>{p ? q[p] : "무응답"}</b>
                            <span className="bt-dim" style={{ fontSize: 13 }}>{q.prompt}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="bt-sec">
                    <h3>마지막 한 끼</h3>
                    {E.lastmeal && norm(E.lastmeal.food) ? (
                      <>
                        <b style={{ display: "block", fontSize: 16 }}>{E.lastmeal.food}</b>
                        {E.lastmeal.why && <div className="bt-memo">{E.lastmeal.why}</div>}
                      </>
                    ) : <p className="bt-p">안 적었어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>감각 취향</h3>
                    {SENSE_GROUPS.filter((g) => norm((E.senses || {})[g.key])).length ? SENSE_GROUPS.map((g) => (
                      norm((E.senses || {})[g.key]) ? (
                        <div className="bt-side" key={g.key}>
                          <span>{g.label.replace("좋아하는 ", "")}</span>
                          <span className="bt-dim">{E.senses[g.key]}</span>
                        </div>
                      ) : null
                    )) : <p className="bt-p">안 골랐어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>인생 셋</h3>
                    {LIFE_FIELDS.filter((f) => norm((E.life || {})[f.key])).length ? LIFE_FIELDS.map((f) => (
                      norm((E.life || {})[f.key]) ? (
                        <div className="bt-side" key={f.key}>
                          <span>{f.label.replace("무인도에 하나만 가져간다면", "무인도")}</span>
                          <span className="bt-dim">{E.life[f.key]}</span>
                        </div>
                      ) : null
                    )) : <p className="bt-p">안 적었어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>요즘 빠진 것</h3>
                    {(E.likes || []).length ? (
                      <div className="bt-chips">
                        {E.likes.map((w) => <span className="bt-chip on" key={w}>{w}</span>)}
                      </div>
                    ) : <p className="bt-p">안 골랐어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>가치 단어 5개</h3>
                    {(E.values || []).length ? (
                      <div className="bt-chips">
                        {E.values.map((w) => <span className="bt-chip on" key={w}>{w}</span>)}
                      </div>
                    ) : <p className="bt-p">안 골랐어요</p>}
                  </div>
                  <div className="bt-sec">
                    <h3>글자와 숫자</h3>
                    <div className="bt-side">
                      <span>좋아하는 숫자</span>
                      <span className="bt-dim">{E.num && norm(E.num.n) ? E.num.n : "안 적었어요"}</span>
                    </div>
                    {[["A부터 Z까지", en], ["ㄱ부터 ㅎ까지", ko]].map(([label, v]) => (
                      <div key={label} style={{ marginTop: 10 }}>
                        <span className="bt-tag">{label}</span>
                        {norm(v.item) ? (
                          <>
                            <b style={{ display: "block", fontSize: 16, marginTop: 4 }}>{v.letter} · {v.item}</b>
                            {v.memo && <div className="bt-memo">{v.memo}</div>}
                          </>
                        ) : <p className="bt-p">안 골랐어요</p>}
                      </div>
                    ))}
                  </div>
                  <button className="bt-btn ghost sm" style={{ marginTop: 16 }} onClick={() => setOpenMember(null)}>회차로 돌아가기</button>
                </>
              );
            }

            return (
              <>
                <div className="bt-eyebrow">{fmt(r.createdAt)} · {names.length}명</div>
                <div className="bt-title">{r.title}</div>
                <div className="bt-sec">
                  <h3>멤버별 기록</h3>
                  {names.length === 0 && <p className="bt-p">아직 참여한 멤버가 없어요</p>}
                  {names.map((m) => {
                    const filled = SECTIONS.filter((s) => doneCount(ent[m], s) > 0).map((s) => s.label);
                    return (
                      <button key={m} className="bt-list" onClick={() => setOpenMember(m)}>
                        <strong>{m}</strong>
                        <span className="bt-dim" style={{ fontSize: 13 }}>
                          {filled.length ? filled.join(", ") : "기록 없음"} {ent[m].at ? "· " + fmt(ent[m].at) : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {names.length >= 2 && [["음식 밸런스 게임", FOOD_Q, "food"]].map(([title, set, key]) => (
                  <div className="bt-sec" key={key}>
                    <h3>{title} 문항별 선택</h3>
                    {set.map((q, i) => {
                      const aN = names.filter((m) => (ent[m][key] || {})[q.id] === "a");
                      const bN = names.filter((m) => (ent[m][key] || {})[q.id] === "b");
                      if (!aN.length && !bN.length) return null;
                      const all = aN.length === 0 || bN.length === 0;
                      return (
                        <div className="bt-card" key={q.id}>
                          <span className="bt-tag bt-num">{String(i + 1).padStart(2, "0")} · {q.tag}{all ? " · 전원 일치" : ""}</span>
                          <b>{q.prompt}</b>
                          <div className="bt-side"><span>{q.a}</span><span className="bt-dim">{aN.join(", ") || "없음"}</span></div>
                          <div className="bt-side"><span>{q.b}</span><span className="bt-dim">{bN.join(", ") || "없음"}</span></div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="bt-row">
                  <button className="bt-btn ghost sm" onClick={() => copyTable(r)}>표로 복사</button>
                  <button className="bt-btn ghost sm" onClick={() => downloadCsv(r)}>CSV 받기</button>
                </div>
                <div className="bt-row">
                  <button className="bt-btn ghost sm" onClick={() => exportRound(r)}>텍스트로 복사</button>
                  <button className="bt-btn ghost sm" onClick={() => setScreen("archive")}>목록으로</button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
