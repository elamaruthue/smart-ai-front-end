import { useAppSelector } from '../store/hooks';

export function useCourseData() {
  const paths              = useAppSelector((s) => s.courseData.paths);
  const skills             = useAppSelector((s) => s.courseData.skills);
  const quizBank           = useAppSelector((s) => s.courseData.quizBank);
  const interviewQuestions = useAppSelector((s) => s.courseData.interviewQuestions);
  const mockTestQuestions  = useAppSelector((s) => s.courseData.mockTestQuestions);
  const loading            = useAppSelector((s) => s.courseData.loading);
  const error              = useAppSelector((s) => s.courseData.error);

  return { paths, skills, quizBank, interviewQuestions, mockTestQuestions, loading, error };
}
