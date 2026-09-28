# 밴드 취향 매치

Vite + React 앱. Firebase 프로젝트 `band-naming`으로 배포한다.

- 저장소: Firestore `bandtaste` 컬렉션
- 주소: `https://band-naming.web.app`

| 문서 id | `data` 필드 (JSON 문자열) |
|---|---|
| `동진`, `원택`, … (멤버 이름) | `{ "<회차 id>": { 그 회차 답 } }` |
| `_meta` | `{ "activeId": "...", "rounds": [{ "id", "title", "createdAt" }] }` |

멤버마다 자기 문서만 고쳐 쓰기 때문에 여럿이 동시에 저장해도 서로 덮어쓰지 않는다.

## 처음 한 번: Firebase 프로젝트 준비

1. console.firebase.google.com에서 새 프로젝트를 만든다 (Spark 무료 요금제로 충분).
2. 빌드 > Firestore Database > 데이터베이스 만들기 (위치는 `asia-northeast3` 서울 추천).
3. 프로젝트 설정 > 일반 > 내 앱에서 웹 앱(`</>`)을 추가하고, 나오는 `firebaseConfig`의 `projectId`, `apiKey`를
   - `src/firebase-config.js`에 넣고,
   - `.firebaserc`의 `projectId`도 같은 값이어야 한다 (지금은 `band-naming`).

## 로컬 실행

```bash
npm install
npm run dev
```

로컬에서도 실제 Firestore에 저장되니 테스트할 때 주의.

## 배포

```bash
npm install -g firebase-tools   # 처음 한 번
firebase login                  # 처음 한 번, 위 프로젝트를 만든 구글 계정으로
firebase deploy
```

`firebase.json`의 predeploy가 빌드를 먼저 돌리고, 호스팅과 `firestore.rules`를 함께 올린다.

## 참고

- 링크를 아는 사람은 누구나 읽고 쓸 수 있다. 원래 아티팩트와 같은 공개 범위이고, 삭제만 막아뒀다.
- 아티팩트(`window.storage`)에 있던 기존 기록은 자동으로 넘어오지 않는다. 필요하면 아카이브의 "텍스트로 복사"로 백업해 둘 것.
