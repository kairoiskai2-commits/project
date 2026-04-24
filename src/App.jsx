import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ContactDevelopers from './pages/ContactDevelopers';
import EgyptPrices from './pages/EgyptPrices';
import AutoDiscover from './pages/AutoDiscover';
import Feed from './pages/Feed';
import Memories from './pages/Memories';
import Museum3D from './pages/Museum3D';
import AIStoryTeller from './pages/AIStoryTeller';
import ArtificialGuide from './pages/ArtificialGuide';
import Login from './pages/Login';
import Signup from './pages/Signup';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
/** @type {React.ComponentType<any>} */
const MainPage = mainPageKey ? Pages[mainPageKey] : () => <></>;

/**
 * @param {{ children: React.ReactNode, currentPageName: string }} props
 * @returns {React.ReactElement}
 */
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/**
 * @param {{ children: React.ReactNode, isAuthenticated: boolean, isLoading: boolean }} props
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated, authError } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError && isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Render the main app
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        </ProtectedRoute>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="/ContactDevelopers" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="ContactDevelopers"><ContactDevelopers /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/EgyptPrices" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="EgyptPrices"><EgyptPrices /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/AutoDiscover" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="AutoDiscover"><AutoDiscover /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/Feed" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Feed"><Feed /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/Memories" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Memories"><Memories /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/Museum3D" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="Museum3D"><Museum3D /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/AIStoryTeller" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="AIStoryTeller"><AIStoryTeller /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/ArtificialGuide" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoadingAuth}>
          <LayoutWrapper currentPageName="ArtificialGuide"><ArtificialGuide /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App