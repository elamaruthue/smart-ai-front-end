import api from './client';

export interface Question {
  _id: string;
  skill: string;
  day: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  created_by: string;
  createdAt: string;
}

export type QuestionPayload = Omit<Question, '_id' | 'created_by' | 'createdAt'>;

export async function getQuestions(): Promise<Question[]> {
  const res = await api.get<Question[]>('/questions');
  return res.data;
}

export async function createQuestion(payload: QuestionPayload): Promise<Question> {
  const res = await api.post<Question>('/questions', payload);
  return res.data;
}

export async function updateQuestion(id: string, payload: Partial<QuestionPayload>): Promise<Question> {
  const res = await api.put<Question>(`/questions/${id}`, payload);
  return res.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/questions/${id}`);
}
