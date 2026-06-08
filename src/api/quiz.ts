import api from './client';

export interface DBQuestion {
  _id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export async function getQuizQuestions(skill: string, day: number): Promise<DBQuestion[]> {
  const res = await api.get<DBQuestion[]>('/quiz/questions', { params: { skill, day } });
  return res.data;
}

export async function submitQuizResult(
  skill: string,
  day: number,
  score: number,
  total: number
): Promise<void> {
  await api.post('/quiz', { skill, day, score, total });
}

export async function submitMockResult(payload: {
  score: number;
  total: number;
  accuracy: number;
  timeTaken: number;
  weakAreas: string[];
}): Promise<void> {
  await api.post('/quiz/mock', payload);
}
