import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import KpiCard from '@/components/KpiCard';
import GeographicSection from '@/components/GeographicSection';
import AttributeChart from '@/components/AttributeChart';
import CorporateHierarchySection from '@/components/CorporateHierarchySection';
import TotalRecordsModal from '@/components/TotalRecordsModal';
import CoverageModal from '@/components/CoverageModal';
import JobStatusDashboard from '@/components/JobStatusDashboard';
import HITLReviewScreen from '@/components/HITLReviewScreen';
import AccuracyModal from '@/components/AccuracyModal';
import CompletenessModal from '@/components/CompletenessModal';
import { ThemeProvider } from '@/contexts/ThemeContext';

function DashboardContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('metrics');
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <Header onToggleSidebar={() => setSidebarCollapsed(prev => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} activeItem={activeItem} onItemClick={setActiveItem} />
        <main className="flex-1 overflow-y-auto p-3">
          {activeItem === 'metrics' && (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-4 gap-2.5 mb-3">
                <KpiCard
                  label="Total records processed"
                  value="98.7M"
                  delta="1.2M"
                  subtitle="All segments combined"
                  icon={<svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]"><ellipse cx="10" cy="6" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M3 6v4c0 1.4 3.1 2.5 7 2.5S17 11.4 17 10V6" stroke="currentColor" strokeWidth="1.4" /><path d="M3 10v4c0 1.4 3.1 2.5 7 2.5S17 15.4 17 14v-4" stroke="currentColor" strokeWidth="1.4" /></svg>}
                  onClick={() => setModal('total')}
                />
                <KpiCard
                  label="Comprehensiveness score"
                  value="94.2%"
                  delta="1.4%"
                  subtitle="% of required attributes"
                  icon={<svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M6 7h8M6 10h8M6 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
                  onClick={() => setModal('coverage')}
                />
                <KpiCard
                  label="Accuracy score"
                  value="97.1%"
                  delta="0.3%"
                  subtitle="Data correctness rate"
                  icon={<svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]"><path d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3Z" stroke="currentColor" strokeWidth="1.4" /><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  onClick={() => setModal('accuracy')}
                />
                <KpiCard
                  label="Completeness score"
                  value="91.8%"
                  delta="0.8%"
                  subtitle="Field population rate"
                  icon={<svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]"><rect x="3" y="11" width="3" height="6" rx="1" fill="currentColor" opacity=".35" /><rect x="8.5" y="7" width="3" height="10" rx="1" fill="currentColor" opacity=".6" /><rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor" opacity=".85" /></svg>}
                  onClick={() => setModal('completeness')}
                />
              </div>

              <GeographicSection />
              <AttributeChart />
              <CorporateHierarchySection />
            </>
          )}

          {activeItem === 'jobs' && <JobStatusDashboard />}
          {activeItem === 'hitl' && <HITLReviewScreen />}
        </main>
      </div>

      {/* Modals */}
      {modal === 'total' && <TotalRecordsModal onClose={() => setModal(null)} />}
      {modal === 'coverage' && <CoverageModal onClose={() => setModal(null)} />}
      {modal === 'accuracy' && <AccuracyModal onClose={() => setModal(null)} />}
      {modal === 'completeness' && <CompletenessModal onClose={() => setModal(null)} />}
    </div>
  );
}

const Index = () => (
  <ThemeProvider>
    <DashboardContent />
  </ThemeProvider>
);

export default Index;
