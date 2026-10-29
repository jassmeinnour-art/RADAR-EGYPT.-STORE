import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MerchantTask } from '../types';

const TASKS_COLLECTION = 'tasks';

export const taskService = {
  async getTasks(userId: string): Promise<MerchantTask[]> {
    const q = query(
      collection(db, 'users', userId, TASKS_COLLECTION),
      orderBy('dueDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MerchantTask));
  },

  async addTask(userId: string, task: Omit<MerchantTask, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const tasksRef = collection(db, 'users', userId, TASKS_COLLECTION);
    const docRef = await addDoc(tasksRef, {
      ...task,
      userId,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateTask(userId: string, taskId: string, task: Partial<MerchantTask>): Promise<void> {
    const taskRef = doc(db, 'users', userId, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...task,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const taskRef = doc(db, 'users', userId, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  },

  async getOverdueTasks(userId: string): Promise<MerchantTask[]> {
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'users', userId, TASKS_COLLECTION),
      where('dueDate', '<', now),
      where('isCompleted', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MerchantTask));
  }
};
