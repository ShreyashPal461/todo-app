import { Todo } from '../types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

async function request<T>(
  endpoint: string,
  method: string,
  token?: string | null,
  body?: any
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const todoApi = {
  getTodos: async (token: string): Promise<Todo[]> => {
    const response = await request<{ data: Todo[] }>('/api/todos?sort=createdAt:desc', 'GET', token);
    return response.data || [];
  },

  createTodo: async (
    token: string,
    title: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    category = 'Inbox'
  ): Promise<Todo> => {
    const response = await request<{ data: Todo }>('/api/todos', 'POST', token, {
      data: {
        title,
        isCompleted: false,
        priority,
        category,
      },
    });
    return response.data;
  },

  updateTodo: async (
    token: string,
    documentId: string,
    fields: Partial<Omit<Todo, 'id' | 'documentId'>>
  ): Promise<Todo> => {
    const response = await request<{ data: Todo }>(`/api/todos/${documentId}`, 'PUT', token, {
      data: fields,
    });
    return response.data;
  },

  deleteTodo: async (token: string, documentId: string): Promise<void> => {
    await request<void>(`/api/todos/${documentId}`, 'DELETE', token);
  },
};
