import { useAppSelector } from '../store/hooks';

export function useCourseData() {
  const paths              = useAppSelector((s) => s.courseData.paths);
  const skills             = useAppSelector((s) => s.courseData.skills);
  const quizBank           = useAppSelector((s) => s.courseData.quizBank);
  // Prefer interviewQuestions from the admin/interviewData slice when available
  const interViewInterviewQuestions = useAppSelector((s: any) => s.interViewData?.interviewQuestions ?? null);
  // If the admin/interview slice exists but is an empty object, treat it as absent
  const useInterView = interViewInterviewQuestions && Object.keys(interViewInterviewQuestions).length > 0;
  const interviewQuestions = useInterView
    ? interViewInterviewQuestions
    : useAppSelector((s) => s.courseData.interviewQuestions);
  const mockTestQuestions  = useAppSelector((s) => s.courseData.mockTestQuestions);
  const loading            = useAppSelector((s) => s.courseData.loading);
  const error              = useAppSelector((s) => s.courseData.error);

  return { paths, skills, quizBank, interviewQuestions, mockTestQuestions, loading, error };
}
