export interface Todo {
  id: number;
  documentId: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
