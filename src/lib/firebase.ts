import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { QuestionItem } from '../components/questionbank/QuestionBankModule';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider prompts
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline client mode. Please check Firebase configuration.');
    }
    return false;
  }
}

// ============================================================================
// GENERIC FIRESTORE SERVICES FOR ALL APPLICATION TABLES
// ============================================================================

export const FIRESTORE_COLLECTIONS = {
  CLASSES: 'classes',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  SUBJECTS: 'subjects',
  GRADES: 'grades',
  ATTENDANCE: 'attendance',
  ASSIGNMENTS: 'assignments',
  SUBMISSIONS: 'submissions',
  ANNOUNCEMENTS: 'announcements',
  QUESTIONS: 'questions',
  USERS: 'users'
} as const;

export type FirestoreCollectionKey = keyof typeof FIRESTORE_COLLECTIONS;

/**
 * Lấy toàn bộ tài liệu từ một collection bất kỳ trên Firestore
 */
export async function fetchCollectionFromFirestore<T extends { id?: string }>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const results: T[] = [];
    snap.forEach((d) => {
      const data = d.data() as T;
      results.push({
        ...data,
        id: (data as any).id || d.id
      });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

/**
 * Lưu hoặc cập nhật một tài liệu trong Firestore collection
 */
export async function saveDocToFirestore<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  const docRef = doc(db, collectionName, item.id);
  try {
    const payload = JSON.parse(JSON.stringify(item));
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

/**
 * Lưu hàng loạt tài liệu vào Firestore theo lô (batch)
 */
export async function batchSaveToFirestore<T extends { id: string }>(collectionName: string, items: T[]): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    // Firestore batch limit is 500 writes
    const CHUNK_SIZE = 450;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, JSON.parse(JSON.stringify(item)), { merge: true });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

/**
 * Xóa một tài liệu khỏi Firestore
 */
export async function deleteDocFromFirestore(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// ============================================================================
// QUESTION BANK FIRESTORE SERVICES
// ============================================================================

const QUESTIONS_COLLECTION = 'questions';

/**
 * Lấy danh sách toàn bộ câu hỏi từ Cloud Firestore
 */
export async function fetchQuestionsFromFirestore(): Promise<QuestionItem[]> {
  try {
    const qRef = collection(db, QUESTIONS_COLLECTION);
    const snap = await getDocs(qRef);
    const results: QuestionItem[] = [];

    snap.forEach((d) => {
      const data = d.data() as QuestionItem;
      results.push({
        ...data,
        id: d.id
      });
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, QUESTIONS_COLLECTION);
  }
}

/**
 * Lưu hoặc cập nhật một câu hỏi vào Cloud Firestore
 */
export async function saveQuestionToFirestore(question: QuestionItem): Promise<void> {
  const docId = question.id || `qb-${Date.now()}`;
  const docRef = doc(db, QUESTIONS_COLLECTION, docId);

  try {
    const payload: QuestionItem = {
      ...question,
      id: docId,
      authorId: question.authorId || auth.currentUser?.uid || 'system',
      authorEmail: question.authorEmail || auth.currentUser?.email || undefined,
      updatedAt: new Date().toISOString()
    };

    // Remove any undefined fields to prevent Firestore serialization errors
    const cleanedPayload = JSON.parse(JSON.stringify(payload));
    await setDoc(docRef, cleanedPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${QUESTIONS_COLLECTION}/${docId}`);
  }
}

/**
 * Lưu hàng loạt câu hỏi vào Cloud Firestore
 */
export async function saveQuestionsBatchToFirestore(questions: QuestionItem[]): Promise<void> {
  if (questions.length === 0) return;
  try {
    const batch = writeBatch(db);
    questions.forEach((q) => {
      const docId = q.id || `qb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, QUESTIONS_COLLECTION, docId);
      const payload: QuestionItem = {
        ...q,
        id: docId,
        authorId: q.authorId || auth.currentUser?.uid || 'system',
        authorEmail: q.authorEmail || auth.currentUser?.email || undefined,
        updatedAt: new Date().toISOString()
      };
      batch.set(docRef, JSON.parse(JSON.stringify(payload)), { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, QUESTIONS_COLLECTION);
  }
}

/**
 * Xóa một câu hỏi khỏi Cloud Firestore
 */
export async function deleteQuestionFromFirestore(questionId: string): Promise<void> {
  const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${QUESTIONS_COLLECTION}/${questionId}`);
  }
}

/**
 * Khởi tạo dữ liệu mẫu lên Cloud Firestore nếu bộ sưu tập đang trống
 */
export async function seedQuestionsIfEmpty(initialQuestions: QuestionItem[]): Promise<QuestionItem[]> {
  try {
    const existing = await fetchQuestionsFromFirestore();
    if (existing.length > 0) {
      return existing;
    }

    // Nếu chưa có câu hỏi nào trên Firestore, tự động đồng bộ danh sách ban đầu lên
    await saveQuestionsBatchToFirestore(initialQuestions);
    return initialQuestions;
  } catch (error) {
    console.warn('Lỗi khi seed câu hỏi lên Firestore (có thể do chưa đăng nhập):', error);
    return initialQuestions;
  }
}

/**
 * Đọc số lượng tài liệu của tất cả các bảng trên Cloud Firestore
 */
export async function getFirestoreTableCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const [key, colName] of Object.entries(FIRESTORE_COLLECTIONS)) {
    try {
      const snap = await getDocs(collection(db, colName));
      counts[colName] = snap.size;
    } catch {
      counts[colName] = -1; // -1 biểu thị chưa truy cập hoặc cần đăng nhập
    }
  }
  return counts;
}

// ============================================================================
// FIRESTORE CRUD DIAGNOSTIC SELF-TEST
// ============================================================================

export interface FirestoreTestStepResult {
  step: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  title: string;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface FirestoreFullTestResult {
  overallSuccess: boolean;
  projectId: string;
  databaseId: string;
  currentUser: {
    uid?: string;
    email?: string | null;
    isAnonymous: boolean;
  } | null;
  steps: FirestoreTestStepResult[];
  testedAt: string;
}

/**
 * Chạy quy trình kiểm thử toàn diện 4 bước (Tạo -> Đọc -> Sửa -> Xóa) trên Cloud Firestore
 */
export async function runQuestionBankFirestoreTest(): Promise<FirestoreFullTestResult> {
  const testId = `test-qb-${Date.now()}`;
  const testDocRef = doc(db, QUESTIONS_COLLECTION, testId);
  const steps: FirestoreTestStepResult[] = [];
  const now = new Date().toISOString();

  const testQuestion: QuestionItem = {
    id: testId,
    subject: 'Toán học',
    grade: 10,
    type: 'pick_one',
    difficulty: 'Thông hiểu',
    chapter: 'Kiểm thử Firestore',
    content: '[Test Tự Động] Cho phương trình x² - 4 = 0. Nghiệm dương của phương trình là?',
    options: ['x = 2', 'x = -2', 'x = 4', 'x = 0'],
    correctAnswer: 0,
    explanation: 'Phương trình x² = 4 có nghiệm dương là x = 2.',
    authorId: auth.currentUser?.uid || 'test-runner',
    authorEmail: auth.currentUser?.email || 'test@edumanage.local',
    updatedAt: now
  };

  // BƯỚC 1: TẠO (CREATE)
  try {
    await setDoc(testDocRef, JSON.parse(JSON.stringify(testQuestion)));
    steps.push({
      step: 'CREATE',
      title: 'Tạo câu hỏi thử nghiệm',
      success: true,
      message: `Đã ghi thành công tài liệu id: "${testId}" lên collection "questions".`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  } catch (err) {
    steps.push({
      step: 'CREATE',
      title: 'Tạo câu hỏi thử nghiệm',
      success: false,
      message: `Thất bại: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
    return {
      overallSuccess: false,
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId,
      currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email, isAnonymous: auth.currentUser.isAnonymous } : null,
      steps,
      testedAt: new Date().toLocaleString('vi-VN')
    };
  }

  // BƯỚC 2: ĐỌC (READ)
  try {
    const snap = await getDoc(testDocRef);
    if (snap.exists() && snap.data().chapter === 'Kiểm thử Firestore') {
      steps.push({
        step: 'READ',
        title: 'Đọc lại dữ liệu câu hỏi',
        success: true,
        message: `Đã đọc thành công dữ liệu từ Firestore. Nội dung: "${snap.data().content.substring(0, 40)}..."`,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
    } else {
      throw new Error('Tài liệu đọc về không khớp dữ liệu vừa tạo.');
    }
  } catch (err) {
    steps.push({
      step: 'READ',
      title: 'Đọc lại dữ liệu câu hỏi',
      success: false,
      message: `Thất bại khi đọc: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  }

  // BƯỚC 3: SỬA (UPDATE)
  try {
    const updatedContent = '[Test Tự Động - ĐÃ CẬP NHẬT] Nghiệm dương của x² - 4 = 0:';
    await updateDoc(testDocRef, {
      content: updatedContent,
      updatedAt: new Date().toISOString()
    });
    const reSnap = await getDoc(testDocRef);
    if (reSnap.data()?.content === updatedContent) {
      steps.push({
        step: 'UPDATE',
        title: 'Chỉnh sửa câu hỏi thử nghiệm',
        success: true,
        message: `Đã cập nhật thành công trường content và xác minh dữ liệu mới trên Firestore.`,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
    } else {
      throw new Error('Dữ liệu sau khi cập nhật không khớp.');
    }
  } catch (err) {
    steps.push({
      step: 'UPDATE',
      title: 'Chỉnh sửa câu hỏi thử nghiệm',
      success: false,
      message: `Thất bại khi sửa: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  }

  // BƯỚC 4: XÓA (DELETE)
  try {
    await deleteDoc(testDocRef);
    const finalCheck = await getDoc(testDocRef);
    if (!finalCheck.exists()) {
      steps.push({
        step: 'DELETE',
        title: 'Xóa câu hỏi thử nghiệm (Dọn dẹp)',
        success: true,
        message: `Đã xóa sạch tài liệu thử nghiệm "${testId}" khỏi Firestore. Không để lại rác dữ liệu.`,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
    } else {
      throw new Error('Tài liệu vẫn còn tồn tại sau lệnh deleteDoc.');
    }
  } catch (err) {
    steps.push({
      step: 'DELETE',
      title: 'Xóa câu hỏi thử nghiệm (Dọn dẹp)',
      success: false,
      message: `Thất bại khi xóa: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    });
  }

  const overallSuccess = steps.every((s) => s.success);

  return {
    overallSuccess,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
    currentUser: auth.currentUser
      ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          isAnonymous: auth.currentUser.isAnonymous
        }
      : null,
    steps,
    testedAt: new Date().toLocaleString('vi-VN')
  };
}

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Tự động đồng bộ thông tin tài khoản người dùng vào Firestore users collection
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const isAdmin = user.email === 'kimtrong16490@gmail.com';
        await setDoc(userDocRef, {
          id: user.uid,
          name: user.displayName || 'Người dùng Google',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'teacher',
          avatar: user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Không thể ghi user profile vào Firestore:', e);
    }

    return user;
  } catch (error) {
    console.error('Lỗi khi đăng nhập bằng Google:', error);
    throw error;
  }
}

export async function signOutGoogle() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    throw error;
  }
}

export { type User, onAuthStateChanged, signInWithPopup, signOut };
