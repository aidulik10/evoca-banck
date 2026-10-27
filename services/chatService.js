// src/services/chatService.js
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";

/**
 * Сохраняет / обновляет профиль текущего пользователя в коллекции "users".
 */
export async function registerUserInFirestore(user) {
  if (!user?.id) return;
  const userRef = doc(db, "users", String(user.id));
  await setDoc(
    userRef,
    {
      id: user.id,
      name: user.name || user.email || "Անանուն",
      email: user.email || null,
      photoURL: user.picture || null,
      isOnline: true,
      lastSeen: serverTimestamp()
    },
    { merge: true }
  );
}

/** Помечает пользователя оффлайн (вызывать при закрытии/логауте) */
export async function setUserOffline(userId) {
  if (!userId) return;
  const userRef = doc(db, "users", String(userId));
  await updateDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() });
}

/** Подписка на список всех зарегистрированных пользователей в реальном времени */
export function subscribeToUsers(currentUserId, callback) {
  const usersRef = collection(db, "users");
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs
      .map((d) => d.data())
      .filter((u) => String(u.id) !== String(currentUserId));
    callback(users);
  });
}

/** Генерирует стабильный ID чата для пары пользователей */
export function getChatId(uid1, uid2) {
  return [String(uid1), String(uid2)].sort().join("_");
}

/** Подписка на сообщения конкретного чата в реальном времени */
export function subscribeToMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

/** Отправляет сообщение в чат */
export async function sendMessageToFirestore(chatId, senderId, text) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId: String(senderId),
    text,
    createdAt: serverTimestamp()
  });
}

// ===== ЗВОНКИ (WebRTC напрямую, без сторонних сайтов) =====

const CALL_DOC_ID = "current";

function callDocRef(chatId) {
  return doc(db, "chats", chatId, "call", CALL_DOC_ID);
}

function candidatesRef(chatId, role) {
  // role: "caller" | "callee"
  return collection(db, "chats", chatId, "call", CALL_DOC_ID, `${role}Candidates`);
}

/** Звонящий создаёт вызов вместе со своим SDP-предложением (offer) */
export async function createCallOffer(chatId, callerId, calleeId, type, offer) {
  await setDoc(callDocRef(chatId), {
    status: "ringing",
    callerId: String(callerId),
    calleeId: String(calleeId),
    type,
    offer,
    startedAt: serverTimestamp()
  });
}

/** Принимающий сохраняет свой SDP-ответ и переводит звонок в активный */
export async function setCallAnswer(chatId, answer) {
  await updateDoc(callDocRef(chatId), { answer, status: "active" });
}

/** Подписка на состояние звонка */
export function subscribeToCall(chatId, callback) {
  return onSnapshot(callDocRef(chatId), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

/** Сохранить свой ICE-кандидат (кусочек данных для установления соединения) */
export async function addIceCandidate(chatId, role, candidate) {
  await addDoc(candidatesRef(chatId, role), candidate);
}

/** Подписка на ICE-кандидаты другой стороны в реальном времени */
export function subscribeToIceCandidates(chatId, role, callback) {
  return onSnapshot(candidatesRef(chatId, role), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        callback(change.doc.data());
      }
    });
  });
}

/** Полностью завершить и удалить звонок (документ + все ICE-кандидаты) */
export async function endCall(chatId) {
  try {
    const [callerSnap, calleeSnap] = await Promise.all([
      getDocs(candidatesRef(chatId, "caller")),
      getDocs(candidatesRef(chatId, "callee"))
    ]);
    await Promise.all([
      ...callerSnap.docs.map((d) => deleteDoc(d.ref)),
      ...calleeSnap.docs.map((d) => deleteDoc(d.ref))
    ]);
  } catch {
    // ничего страшного, если кандидатов уже не было
  }
  await deleteDoc(callDocRef(chatId)).catch(() => {});
}