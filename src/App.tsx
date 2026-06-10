import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { lazy, Suspense, type ReactNode } from 'react';

import Layout from './components/Layout';
import GlobalLoader from './components/GlobalLoader';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PathSelection = lazy(() => import('./pages/PathSelection'));
const SkillSelection = lazy(() => import('./pages/SkillSelection'));
const DayLearning = lazy(() => import('./pages/DayLearning'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Result = lazy(() => import('./pages/Result'));
const Progress = lazy(() => import('./pages/Progress'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const MockTest = lazy(() => import('./pages/MockTest'));
const MockTestResult = lazy(() => import('./pages/MockTestResult'));
const Settings = lazy(() => import('./pages/Settings'));
const CourseEditor = lazy(() => import('./pages/CourseEditor'));
const DayQuizEditor = lazy(() => import('./pages/DayQuizEditor'));
const QuestionSet = lazy(() => import('./pages/QuestionSet'));
const NotFound = lazy(() => import('./pages/NotFound'));

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useApp();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const SuperuserRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'superuser' && user.role !== 'admin') {
    return <Navigate to="/path" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useApp();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/path" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/path" replace /> : <Signup />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/path" replace />} />

        <Route path="path" element={<PathSelection />} />
        <Route path="skills" element={<SkillSelection />} />
        <Route path="learn" element={<DayLearning />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="result" element={<Result />} />
        <Route path="progress" element={<Progress />} />
        <Route path="interview" element={<InterviewPrep />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="mock-test" element={<MockTest />} />
        <Route path="mock-result" element={<MockTestResult />} />
        <Route path="settings" element={<Settings />} />

        {/* Admin/Superuser Routes */}
        <Route
          path="question-set"
          element={
            <SuperuserRoute>
              <QuestionSet />
            </SuperuserRoute>
          }
        />
        <Route
          path="course-editor"
          element={
            <SuperuserRoute>
              <CourseEditor />
            </SuperuserRoute>
          }
        />
        <Route
          path="day-quiz-editor"
          element={
            <SuperuserRoute>
              <DayQuizEditor />
            </SuperuserRoute>
          }
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<GlobalLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}