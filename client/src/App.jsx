import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerLayout from './components/ManagerLayout';
import LoginScreen from './pages/LoginScreen';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const CoPilotsPage = lazy(() => import('./pages/CoPilotsPage'));
const DocumentsLibrary = lazy(() => import('./pages/DocumentsLibrary'));
const DashboardsPage = lazy(() => import('./pages/DashboardsPage'));
const ReportBotPage = lazy(() => import('./pages/ReportBotPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CampusPage = lazy(() => import('./pages/CampusPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const DocsViewer = lazy(() => import('./pages/DocsViewer'));
const SmartFollowPage = lazy(() => import('./pages/SmartFollowPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const BrandingHubPage = lazy(() => import('./pages/BrandingHubPage'));
const AutomationsHubPage = lazy(() => import('./pages/AutomationsHubPage'));
const IntegrationsHubPage = lazy(() => import('./pages/IntegrationsHubPage'));

// Branded loading fallback with MicroMind logo + golden spinner
const LoadingFallback = () => (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page, #0F0F0F)',
        color: 'var(--text-primary, #F2F3EC)',
    }}>
        <div style={{ textAlign: 'center' }}>
            {/* Spinner ring + pulsing logo */}
            <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
            }}>
                {/* Spinning ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3px solid rgba(224,170,62,0.15)',
                    borderTopColor: '#E0AA3E',
                    animation: 'mm-spin 1s linear infinite',
                }} />
                {/* Logo in center */}
                <img
                    src="/assets/logo.png"
                    alt="MicroMind"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '40px',
                        height: '40px',
                        objectFit: 'contain',
                        animation: 'mm-pulse 2s ease-in-out infinite',
                    }}
                />
            </div>
            {/* Brand text */}
            <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#E0AA3E',
                marginBottom: '6px',
            }}>MicroMind</div>
            <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#555',
            }}>Business Suite</div>
        </div>
        {/* Keyframe animations injected via style tag */}
        <style>{`
            @keyframes mm-spin {
                to { transform: rotate(360deg); }
            }
            @keyframes mm-pulse {
                0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.92); }
            }
        `}</style>
    </div>
);

function App() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginScreen />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<ManagerLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/copilots" element={<CoPilotsPage />} />
                        <Route path="/documents" element={<DocumentsLibrary />} />
                        <Route path="/analytics/dashboards" element={<DashboardsPage />} />
                        <Route path="/report-bot" element={<ReportBotPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/smart-follow" element={<SmartFollowPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/branding-hub" element={<BrandingHubPage />} />
                        <Route path="/automations-hub" element={<AutomationsHubPage />} />
                        <Route path="/integrations" element={<IntegrationsHubPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/campus" element={<CampusPage />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/docs/:slug" element={<DocsViewer />} />
                    </Route>
                </Route>

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
