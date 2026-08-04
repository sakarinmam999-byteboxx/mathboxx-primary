import React, { useState } from 'react';

// Layout Wrappers
import { PublicLayout } from './layouts/PublicLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PricingPage } from './pages/public/PricingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';

// Teacher Pages
import { DashboardPage } from './pages/teacher/DashboardPage';
import { WorksheetBuilderPage } from './pages/teacher/WorksheetBuilderPage';
import { WorksheetPreviewPage } from './pages/teacher/WorksheetPreviewPage';
import { MyWorksheetsPage } from './pages/teacher/MyWorksheetsPage';
import { QuestionBankPage } from './pages/teacher/QuestionBankPage';
import { CurriculumPage } from './pages/teacher/CurriculumPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';
import { SubscriptionPage } from './pages/teacher/SubscriptionPage';
import { PaymentPage } from './pages/teacher/PaymentPage';
import { AccountSettingsPage } from './pages/teacher/AccountSettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminCurriculumPage } from './pages/admin/AdminCurriculumPage';
import { AdminUsageStatsPage } from './pages/admin/AdminUsageStatsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Detect password recovery redirect from email link
    const hash = window.location.hash || '';
    const path = window.location.pathname || '';
    if (hash.includes('type=recovery') || path === '/reset-password') {
      return '/reset-password';
    }
    return '/';
  });

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine Layout Group based on Route Prefix
  const isPublicRoute = ['/', '/pricing', '/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
  const isAdminRoute = currentPath.startsWith('/admin');
  const isTeacherRoute = currentPath.startsWith('/app');

  const renderContent = () => {
    switch (currentPath) {
      // Public Routes
      case '/':
        return <LandingPage onNavigate={handleNavigate} />;
      case '/pricing':
        return <PricingPage onNavigate={handleNavigate} />;
      case '/login':
        return <LoginPage onNavigate={handleNavigate} />;
      case '/register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case '/reset-password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;

      // Teacher Routes
      case '/app/dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case '/app/builder':
        return <WorksheetBuilderPage onNavigate={handleNavigate} />;
      case '/app/preview':
        return <WorksheetPreviewPage onNavigate={handleNavigate} />;
      case '/app/worksheets':
        return <MyWorksheetsPage onNavigate={handleNavigate} />;
      case '/app/question-bank':
        return <QuestionBankPage onNavigate={handleNavigate} />;
      case '/app/curriculum':
        return <CurriculumPage onNavigate={handleNavigate} />;
      case '/app/profile':
        return <TeacherProfilePage onNavigate={handleNavigate} />;
      case '/app/subscription':
        return <SubscriptionPage onNavigate={handleNavigate} />;
      case '/app/payment':
        return <PaymentPage onNavigate={handleNavigate} />;
      case '/app/settings':
        return <AccountSettingsPage onNavigate={handleNavigate} />;

      // Admin Routes
      case '/admin':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case '/admin/payments':
        return <AdminPaymentsPage onNavigate={handleNavigate} />;
      case '/admin/users':
        return <AdminUsersPage onNavigate={handleNavigate} />;
      case '/admin/subscriptions':
        return <AdminSubscriptionsPage onNavigate={handleNavigate} />;
      case '/admin/question-bank':
        return <AdminQuestionBankPage onNavigate={handleNavigate} />;
      case '/admin/curriculum':
        return <AdminCurriculumPage onNavigate={handleNavigate} />;
      case '/admin/usage-stats':
        return <AdminUsageStatsPage onNavigate={handleNavigate} />;
      case '/admin/settings':
        return <AdminSettingsPage onNavigate={handleNavigate} />;

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (isAdminRoute) {
    return (
      <AdminLayout currentPath={currentPath} onNavigate={handleNavigate}>
        {renderContent()}
      </AdminLayout>
    );
  }

  if (isTeacherRoute) {
    return (
      <TeacherLayout currentPath={currentPath} onNavigate={handleNavigate}>
        {renderContent()}
      </TeacherLayout>
    );
  }

  return (
    <PublicLayout currentPath={currentPath} onNavigate={handleNavigate}>
      {renderContent()}
    </PublicLayout>
  );
}

export default App;
