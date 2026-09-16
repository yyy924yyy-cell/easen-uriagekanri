import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Cast, Store, SalesRecord, GeneralSettings, StaffDisplaySettings, Role } from '../types';

const TRASH_RETENTION_DAYS = 30;

function purgeAtValue() {
  return Timestamp.fromDate(new Date(Date.now() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000));
}

const SOFT_DELETE_PATCH = { deletedAt: serverTimestamp(), purgeAt: purgeAtValue() };
const RESTORE_PATCH = { deletedAt: deleteField(), purgeAt: deleteField() };

// ---- Casts ----
export function subscribeCasts(cb: (casts: Cast[]) => void) {
  const q = query(collection(db, 'casts'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cast, 'id'>) }));
    cb(all.filter((c) => !c.deletedAt));
  });
}

export function subscribeDeletedCasts(cb: (casts: Cast[]) => void) {
  const q = query(collection(db, 'casts'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cast, 'id'>) }));
    cb(all.filter((c) => !!c.deletedAt));
  });
}

export async function addCast(name: string, commissionRate: number, order: number) {
  await addDoc(collection(db, 'casts'), {
    name,
    commissionRate,
    active: true,
    order,
    createdAt: Date.now(),
  });
}

export async function updateCast(id: string, patch: Partial<Cast>) {
  await updateDoc(doc(db, 'casts', id), patch as Record<string, unknown>);
}

export async function deleteCast(id: string) {
  await updateDoc(doc(db, 'casts', id), SOFT_DELETE_PATCH);
}

export async function restoreCast(id: string) {
  await updateDoc(doc(db, 'casts', id), RESTORE_PATCH);
}

export async function permanentlyDeleteCast(id: string) {
  await deleteDoc(doc(db, 'casts', id));
}

// ---- Stores ----
export function subscribeStores(cb: (stores: Store[]) => void) {
  const q = query(collection(db, 'stores'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Store, 'id'>) }));
    cb(all.filter((s) => !s.deletedAt));
  });
}

export function subscribeDeletedStores(cb: (stores: Store[]) => void) {
  const q = query(collection(db, 'stores'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Store, 'id'>) }));
    cb(all.filter((s) => !!s.deletedAt));
  });
}

export async function addStore(name: string, order: number) {
  await addDoc(collection(db, 'stores'), { name, order, createdAt: Date.now() });
}

export async function updateStore(id: string, patch: Partial<Store>) {
  await updateDoc(doc(db, 'stores', id), patch as Record<string, unknown>);
}

export async function deleteStore(id: string) {
  await updateDoc(doc(db, 'stores', id), SOFT_DELETE_PATCH);
}

export async function restoreStore(id: string) {
  await updateDoc(doc(db, 'stores', id), RESTORE_PATCH);
}

export async function permanentlyDeleteStore(id: string) {
  await deleteDoc(doc(db, 'stores', id));
}

// ---- Settings（オーナーのみ閲覧可） ----
const SETTINGS_DOC = 'settings/general';

export async function getSettings(): Promise<GeneralSettings> {
  const snap = await getDoc(doc(db, SETTINGS_DOC));
  if (snap.exists()) return snap.data() as GeneralSettings;
  return { nominationFee: 500 };
}

export function subscribeSettings(cb: (s: GeneralSettings) => void) {
  return onSnapshot(doc(db, SETTINGS_DOC), (snap) => {
    cb(snap.exists() ? (snap.data() as GeneralSettings) : { nominationFee: 500 });
  });
}

export async function updateSettings(patch: Partial<GeneralSettings>) {
  await setDoc(doc(db, SETTINGS_DOC), patch, { merge: true });
}

// ---- スタッフ選択画面の表示設定（オーナー・スタッフどちらも閲覧可、書き込みはオーナーのみ） ----
const STAFF_DISPLAY_SETTINGS_DOC = 'settings/staffDisplay';

export function subscribeStaffDisplaySettings(cb: (s: StaffDisplaySettings) => void) {
  return onSnapshot(doc(db, STAFF_DISPLAY_SETTINGS_DOC), (snap) => {
    cb(snap.exists() ? (snap.data() as StaffDisplaySettings) : {});
  });
}

export async function updateStaffDisplaySettings(patch: Partial<StaffDisplaySettings>) {
  await setDoc(doc(db, STAFF_DISPLAY_SETTINGS_DOC), patch, { merge: true });
}

// ---- Sales records ----
export function subscribeAllSalesRecords(cb: (records: SalesRecord[]) => void) {
  const q = query(collection(db, 'salesRecords'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SalesRecord, 'id'>) }));
    cb(all.filter((r) => !r.deletedAt));
  });
}

export function subscribeDeletedSalesRecords(cb: (records: SalesRecord[]) => void) {
  const q = query(collection(db, 'salesRecords'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SalesRecord, 'id'>) }));
    cb(all.filter((r) => !!r.deletedAt));
  });
}

export function subscribeCastSalesRecords(castId: string, cb: (records: SalesRecord[]) => void) {
  // where + orderBy の組み合わせはFirestoreの複合インデックス作成が必要になり、
  // 未作成の場合エラーになるため、orderByは使わずクライアント側で並び替える。
  const q = query(collection(db, 'salesRecords'), where('castId', '==', castId));
  return onSnapshot(q, (snap) => {
    const records = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<SalesRecord, 'id'>) }))
      .filter((r) => !r.deletedAt);
    records.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    cb(records);
  });
}

export interface NewSalesRecordInput {
  date: string;
  storeId: string;
  castId: string;
  treatmentAmount: number;
  treatmentMemo?: string;
  optionAmount: number;
  optionMemo?: string;
  pointsUsed: number;
  nominated: boolean;
  paymentMethod: SalesRecord['paymentMethod'];
  isPaid: boolean;
  createdBy: Role;
}

export async function addSalesRecord(input: NewSalesRecordInput) {
  const totalAmount = input.treatmentAmount + input.optionAmount;
  const paymentAmount = totalAmount - input.pointsUsed;
  await addDoc(collection(db, 'salesRecords'), {
    ...input,
    treatmentMemo: input.treatmentMemo ?? '',
    optionMemo: input.optionMemo ?? '',
    totalAmount,
    paymentAmount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSalesRecord(
  id: string,
  input: Omit<NewSalesRecordInput, 'createdBy'>
) {
  const totalAmount = input.treatmentAmount + input.optionAmount;
  const paymentAmount = totalAmount - input.pointsUsed;
  await updateDoc(doc(db, 'salesRecords', id), {
    ...input,
    treatmentMemo: input.treatmentMemo ?? '',
    optionMemo: input.optionMemo ?? '',
    totalAmount,
    paymentAmount,
    updatedAt: serverTimestamp(),
  });
}

// 削除（ゴミ箱へ移動。実際には消さず、30日後に自動削除される印をつける）
export async function deleteSalesRecord(id: string) {
  await updateDoc(doc(db, 'salesRecords', id), SOFT_DELETE_PATCH);
}

export async function restoreSalesRecord(id: string) {
  await updateDoc(doc(db, 'salesRecords', id), RESTORE_PATCH);
}

// ゴミ箱からの完全削除（元に戻せません。オーナーのみ）
export async function permanentlyDeleteSalesRecord(id: string) {
  await deleteDoc(doc(db, 'salesRecords', id));
}

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
