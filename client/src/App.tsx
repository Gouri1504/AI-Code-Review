import { AuthPage } from './auth/AuthPage';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { CursorGlow } from './components/CursorGlow';
import { CTA, Footer } from './components/landing/CTA';
import { Docs } from './components/landing/Docs';
import { FeaturesGrid } from './components/landing/FeaturesGrid';
import { Pipeline } from './components/landing/Pipeline';
import { WorkspacePreview } from './components/landing/WorkspacePreview';
import { Hero } from './components/hero/Hero';
import { Navbar } from './components/Navbar';
import { MouseProvider } from './hooks/useMouse';
import { useInitialHashScroll, useLocation } from './router';
import { Workspace } from './workspace/Workspace';

function Landing() {
  useInitialHashScroll();
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <Pipeline />
        <FeaturesGrid />
        <WorkspacePreview />
        <Docs />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function Routes() {
  const path = useLocation().pathname.replace(/\/+$/, '');
  switch (path) {
    case '/workspace':
      return (
        <ProtectedRoute>
          <Workspace />
        </ProtectedRoute>
      );
    case '/login':
      return <AuthPage mode="login" />;
    case '/signup':
      return <AuthPage mode="signup" />;
    default:
      return <Landing />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <MouseProvider>
        <CursorGlow />
        <Routes />
      </MouseProvider>
    </AuthProvider>
  );
}
