/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/common/Toast';

// Dashboards
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';

// Existing Modules
import { ClassList } from './components/classes/ClassList';
import { StudentList } from './components/students/StudentList';
import { TeacherList } from './components/teachers/TeacherList';
import { GradebookView } from './components/gradebook/GradebookView';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { AssignmentList } from './components/assignments/AssignmentList';
import { AnnouncementList } from './components/announcements/AnnouncementList';
import { SystemDataView } from './components/system/SystemDataView';

// New Modules from User Screenshot
import { QuizModule } from './components/quiz/QuizModule';
import { QuestionBankModule } from './components/questionbank/QuestionBankModule';
import { DigitalResourcesModule } from './components/resources/DigitalResourcesModule';
import { AIAssistantModule } from './components/ai/AIAssistantModule';
import { BehaviorDisciplineModule } from './components/behavior/BehaviorDisciplineModule';
import { SmartAlertsModule } from './components/alerts/SmartAlertsModule';
import { ClassroomToolsModule } from './components/tools/ClassroomToolsModule';
import { SummaryReportsModule } from './components/reports/SummaryReportsModule';
import { TimetableModule } from './components/timetable/TimetableModule';
import { SubjectsManagementModule } from './components/subjects/SubjectsManagementModule';

const MainAppLayout: React.FC = () => {
  const { activeUser } = useApp();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderDashboardByRole = () => {
    switch (activeUser.role) {
      case 'admin':
        return <AdminDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'teacher':
        return <TeacherDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'student':
        return <StudentDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'parent':
        return <ParentDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      default:
        return <AdminDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'classes':
        return <ClassList />;
      case 'students':
        return <StudentList />;
      case 'teachers':
        return <TeacherList />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'timetable':
        return <TimetableModule />;
      case 'assignments':
        return <AssignmentList />;
      case 'quiz':
        return <QuizModule />;
      case 'question_bank':
        return <QuestionBankModule onNavigateToSubjects={() => setCurrentTab('subjects_management')} />;
      case 'digital_resources':
        return <DigitalResourcesModule />;
      case 'ai_assistant':
        return <AIAssistantModule />;
      case 'subjects_management':
        return <SubjectsManagementModule onNavigateToQuestionBank={() => setCurrentTab('question_bank')} />;
      case 'gradebook':
        return <GradebookView />;
      case 'behavior_discipline':
        return <BehaviorDisciplineModule />;
      case 'smart_alerts':
        return <SmartAlertsModule />;
      case 'classroom_tools':
        return <ClassroomToolsModule initialTool="tools_hub" />;
      case 'lucky_wheel':
        return <ClassroomToolsModule initialTool="wheel" />;
      case 'random_student':
        return <ClassroomToolsModule initialTool="random_student" />;
      case 'classroom_timer':
        return <ClassroomToolsModule initialTool="timer" />;
      case 'announcements':
        return <AnnouncementList />;
      case 'reports':
        return <SummaryReportsModule />;
      case 'system_data':
        return <SystemDataView />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
