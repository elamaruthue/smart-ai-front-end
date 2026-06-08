import api from './client';
import type {
  PathData,
  SkillData,
  QuizQuestion,
  InterviewQuestion,
  MockQuestion,
} from '../data/courseData';

export interface CourseDataPayload {
  paths:               PathData[];
  skills:              Record<string, SkillData>;
  quizBank:            Record<string, QuizQuestion[]>;
  interviewQuestions:  Record<string, Record<string, InterviewQuestion[]>>;
  mockTestQuestions:   MockQuestion[];
}

export const getCourseDataApi = (): Promise<CourseDataPayload> =>
  api.get<CourseDataPayload>('/course').then((r) => r.data);

export const updateCourseSection = (
  section: string,
  data: unknown
): Promise<{ ok: boolean; section: string }> =>
  api.put(`/course/${section}`, data).then((r) => r.data);
