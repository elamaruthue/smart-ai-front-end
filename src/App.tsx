import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PathSelection from './pages/PathSelection';
import SkillSelection from './pages/SkillSelection';
import DayLearning from './pages/DayLearning';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Progress from './pages/Progress';
import InterviewPrep from './pages/InterviewPrep';
import AIAssistant from './pages/AIAssistant';
import MockTest from './pages/MockTest';
import MockTestResult from './pages/MockTestResult';
import Settings from './pages/Settings';
import CourseEditor    from './pages/CourseEditor';
import DayQuizEditor  from './pages/DayQuizEditor';
import QuestionSet    from './pages/QuestionSet';
import Layout from './components/Layout';
import GlobalLoader from './components/GlobalLoader';
import type { ReactNode } from 'react';
import NotFound from './pages/NotFound';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useApp();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

/** Only superuser or admin can access this route */
const SuperuserRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'superuser' && user.role !== 'admin') return <Navigate to="/path" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useApp();
  return (
    <Routes>
      <Route path="/login"  element={user ? <Navigate to="/path" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/path" replace /> : <Signup />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/path" replace />} />
        <Route path="path"       element={<PathSelection />} />
        <Route path="skills"     element={<SkillSelection />} />
        <Route path="learn"      element={<DayLearning />} />
        <Route path="quiz"       element={<Quiz />} />
        <Route path="result"     element={<Result />} />
        <Route path="progress"   element={<Progress />} />
        <Route path="interview"  element={<InterviewPrep />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="mock-test"  element={<MockTest />} />
        <Route path="mock-result" element={<MockTestResult />} />
        <Route path="settings"   element={<Settings />} />
        <Route path="question-set" element={<SuperuserRoute><QuestionSet /></SuperuserRoute>} />
        <Route path="course-editor"   element={<SuperuserRoute><CourseEditor /></SuperuserRoute>} />
        <Route path="day-quiz-editor" element={<SuperuserRoute><DayQuizEditor /></SuperuserRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <GlobalLoader />
      </BrowserRouter>
    </AppProvider>
  );
}
