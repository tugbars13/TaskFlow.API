import { Routes, Route } from "react-router-dom";
import { MySpaceProvider } from "../context/MySpaceContext";
import MySpaceSidebar from "../components/MySpaceSidebar";
import WorkspaceHome from "./WorkspaceHome";
import FolderView from "./FolderView";
import PageView from "./PageView";
import FoldersView from "./FoldersView";
import PagesView from "./PagesView";

export default function MySpacePage() {
  return (
    <MySpaceProvider>
      <div className="flex h-full bg-white overflow-hidden">
        <MySpaceSidebar />
        <Routes>
          <Route path="/" element={<WorkspaceHome />} />
          <Route path="/folders" element={<FoldersView />} />
          <Route path="/pages" element={<PagesView />} />
          <Route path="/folder/:id" element={<FolderView />} />
          <Route path="/page/:id" element={<PageView />} />
        </Routes>
      </div>
    </MySpaceProvider>
  );
}
