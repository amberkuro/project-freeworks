"use client";
import { useAdminNav } from "./_hooks/AdminContext";
import { useApplications } from "./_hooks/useApplications";
import Dashboard from "./_components/Dashboard";
import ApplicationsManager from "./_components/ApplicationsManager";
import SamplesManager from "./_components/SamplesManager";
import MembersManager from "./_components/MembersManager";

/**
 * Admin 페이지 (라우팅 허브)
 * - 네비게이션 컨텍스트의 view 값에 따라 적절한 컴포넌트를 렌더링
 * - applications 데이터는 여기서 한 번만 fetch하여 Dashboard와 ApplicationsManager에 공유
 */
export default function AdminPage() {
  const { view, nav, pa, setPa, ps, setPs } = useAdminNav();
  const {
    apps,
    loading: appsLoading,
    error: appsError,
    fetchApps,
    updateLocal,
    updateRemote,
  } = useApplications();

  switch (view) {
    case "applications":
      if (appsLoading) {
        return (
          <div className="py-12 text-center text-sm text-gray-400">
            로딩 중...
          </div>
        );
      }
      if (appsError) {
        return (
          <div className="py-12 text-center">
            <p className="text-sm text-red-500 mb-3">{appsError}</p>
            <button
              onClick={fetchApps}
              className="text-sm text-[#1565c0] bg-[#e3f2fd] px-4 py-2 rounded-lg border-none cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        );
      }
      return (
        <ApplicationsManager
          apps={apps}
          updateLocal={updateLocal}
          updateRemote={updateRemote}
          initialDetail={pa}
          fetchApps={fetchApps}
        />
      );

    case "samples":
      return <SamplesManager initialDetail={ps} />;

    case "members":
      return <MembersManager apps={apps} fetchApps={fetchApps} />;

    default:
      return (
        <Dashboard
          apps={apps}
          onNavigate={nav}
          onSelectApp={setPa}
          onSelectSample={setPs}
        />
      );
  }
}
