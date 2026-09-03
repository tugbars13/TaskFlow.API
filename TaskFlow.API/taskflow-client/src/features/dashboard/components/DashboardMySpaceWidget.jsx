import { ROUTES } from "@/constants/routesConstants";
import DashboardSectionHeader from "./DashboardSectionHeader";

function FolderRow({ folder, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container/30 transition-colors text-left"
    >
      <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <span
          className="material-symbols-outlined text-[15px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          folder
        </span>
      </div>
      <span className="text-[13px] font-medium text-on-surface truncate">
        {folder.name}
      </span>
    </button>
  );
}

function PageRow({ page, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container/30 transition-colors text-left"
    >
      <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">
        {page.icon || "description"}
      </span>
      <span className="text-[13px] font-medium text-on-surface truncate">
        {page.title || "İsimsiz Sayfa"}
      </span>
    </button>
  );
}

export default function DashboardMySpaceWidget({ mySpace, navigate }) {
  const recentFolders = mySpace.folders.slice(0, 3);
  const recentPages = mySpace.pages.slice(0, 3);

  return (
    <div className="col-span-2 flex flex-col gap-4">
      {/* Klasörler */}
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden">
        <DashboardSectionHeader
          icon="folder_open"
          label="Klasörler"
          onViewAll={() => navigate(ROUTES.MY_SPACE + "/folders")}
        />
        <div className="divide-y divide-outline-variant/10">
          {mySpace.loading ? (
            <div className="px-4 py-3 space-y-2 animate-pulse">
              {[0, 1].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : recentFolders.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-[12px] text-on-surface-variant/40">
                Klasör yok
              </p>
            </div>
          ) : (
            recentFolders.map((f) => (
              <FolderRow
                key={f.id}
                folder={f}
                onClick={() => navigate("/myspace/folder/" + f.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Sayfalar */}
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden">
        <DashboardSectionHeader
          icon="description"
          label="Sayfalar"
          onViewAll={() => navigate(ROUTES.MY_SPACE + "/pages")}
        />
        <div className="divide-y divide-outline-variant/10">
          {mySpace.loading ? (
            <div className="px-4 py-3 space-y-2 animate-pulse">
              {[0, 1].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : recentPages.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-[12px] text-on-surface-variant/40">
                Sayfa yok
              </p>
            </div>
          ) : (
            recentPages.map((p) => (
              <PageRow
                key={p.id}
                page={p}
                onClick={() => navigate("/myspace/page/" + p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
