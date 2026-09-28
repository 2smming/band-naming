// Firestore 저장소. firebase-config.js에 적힌 프로젝트의 bandtaste 컬렉션을 쓴다.
//   - 멤버 한 명당 문서 하나: data = { [회차 id]: 그 회차의 답 }
//   - 회차 목록은 예약된 문서 "_meta": data = { activeId, rounds: [{ id, title, createdAt }] }
// 멤버마다 자기 문서만 쓰니까 두 사람이 동시에 저장해도 서로 덮어쓰지 않는다.
// SDK 없이 REST API로 부르고, data는 JSON 문자열 필드 하나로 저장한다.
import { FIREBASE } from "./firebase-config.js";

const COLLECTION = "bandtaste";
const META = "_meta";

const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/${COLLECTION}`;
const docUrl = (id) => `${base}/${encodeURIComponent(id)}?key=${FIREBASE.apiKey}`;
const encode = (data) => JSON.stringify({ fields: { data: { stringValue: JSON.stringify(data) } } });
const decode = (doc) => JSON.parse((doc.fields && doc.fields.data && doc.fields.data.stringValue) || "null");
const idOf = (doc) => decodeURIComponent(doc.name.split("/").pop());

const readDoc = async (id) => {
  const res = await fetch(docUrl(id));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`firestore get ${res.status}`);
  return decode(await res.json());
};

const writeDoc = async (id, data) => {
  const res = await fetch(docUrl(id), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: encode(data) });
  if (!res.ok) throw new Error(`firestore set ${res.status}`);
};

const listDocs = async () => {
  const docs = [];
  let pageToken = "";
  do {
    const res = await fetch(`${base}?key=${FIREBASE.apiKey}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`);
    if (!res.ok) throw new Error(`firestore list ${res.status}`);
    const body = await res.json();
    docs.push(...(body.documents || []));
    pageToken = body.nextPageToken || "";
  } while (pageToken);
  return docs.map((d) => ({ id: idOf(d), data: decode(d) }));
};

// 회차 목록을 읽는다. 없으면 fresh로 만들되, 동시에 누가 먼저 만들었으면(409) 그걸 쓴다.
export const loadMeta = async (fresh) => {
  const meta = await readDoc(META);
  if (meta) return meta;
  const init = { activeId: fresh.activeId, rounds: fresh.rounds.map(({ entries, ...r }) => r) };
  const res = await fetch(`${base}?documentId=${META}&key=${FIREBASE.apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: encode(init),
  });
  if (res.status === 409) return readDoc(META);
  if (!res.ok) throw new Error(`firestore create ${res.status}`);
  return init;
};

export const saveMeta = (meta) => writeDoc(META, meta);

// 앱이 원래 쓰던 모양 { activeId, rounds: [{ id, title, createdAt, entries }] }으로 조립한다.
export const loadStore = async (fresh) => {
  const meta = await loadMeta(fresh);
  const docs = (await listDocs()).filter((d) => d.id !== META);
  const rounds = (meta.rounds || []).map((r) => {
    const entries = {};
    docs.forEach(({ id, data }) => {
      if (data && data[r.id]) entries[id] = data[r.id];
    });
    return { ...r, entries };
  });
  return { activeId: meta.activeId, rounds };
};

// 한 멤버의 한 회차 답만 바꾼다. 다른 회차 답은 그대로 둔다.
export const saveEntry = async (member, roundId, entry) => {
  const prev = (await readDoc(member)) || {};
  await writeDoc(member, { ...prev, [roundId]: entry });
};
