import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as mySpaceService from '@/features/myspace/api/mySpaceService';
const MySpaceContext = createContext();

export function MySpaceProvider({ children }) {
  const [folders, setFolders] = useState([]);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMySpaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [foldersRes, pagesRes] = await Promise.all([
        mySpaceService.getFolders(),
        mySpaceService.getPages()
      ]);
      
      if (foldersRes.data?.success) setFolders(foldersRes.data.data);
      if (pagesRes.data?.success) setPages(pagesRes.data.data);
      
    } catch (err) {
      console.error("Error loading MySpace data:", err);
      setError("Veriler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMySpaceData();
  }, [fetchMySpaceData]);

  const addFolder = async (name = "Yeni Klasör", parentFolderId = null) => {
    try {
      const response = await mySpaceService.createFolder({
        name,
        parentFolderId
      });
      if (response.data?.success) {
        setFolders(prev => [...prev, response.data.data]);
        return response.data.data;
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      throw err;
    }
  };

  const updateFolder = async (id, name) => {
    try {
      const response = await mySpaceService.updateFolder(id, { name });
      if (response.data?.success) {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
      }
    } catch (err) {
      console.error("Error updating folder:", err);
    }
  };

  const deleteFolder = async (id) => {
    try {
      const response = await mySpaceService.deleteFolder(id);
      if (response.data?.success) {
        setFolders(prev => prev.filter(f => f.id !== id));
        setPages(prev => prev.filter(p => p.folderId !== id)); // also clean up pages locally
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const addPage = async (folderId = null) => {
    try {
      const response = await mySpaceService.createPage({
        folderId,
        title: "İsimsiz Sayfa",
        content: ""
      });
      if (response.data?.success) {
        setPages(prev => [...prev, response.data.data]);
        return response.data.data;
      }
    } catch (err) {
      console.error("Error creating page:", err);
      throw err;
    }
  };

    const duplicatePage = async (pageToDuplicate) => {
    try {
      const title = pageToDuplicate.title ? pageToDuplicate.title + " (Kopya)" : "İsimsiz Sayfa";
      const response = await mySpaceService.createPage({
        folderId: pageToDuplicate.folderId,
        title: title,
        icon: pageToDuplicate.icon,
        description: pageToDuplicate.description,
        content: pageToDuplicate.content
      });
      if (response.data?.success) {
        setPages(prev => [...prev, response.data.data]);
        return response.data.data;
      }
    } catch (err) {
      console.error("Error duplicating page:", err);
      throw err;
    }
  };
  const updatePage = async (id, data) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

    try {
      const pageToUpdate = pages.find(p => p.id === id);
      const payload = {
        folderId: data.folderId !== undefined ? data.folderId : pageToUpdate.folderId,
        title: data.title !== undefined ? data.title : pageToUpdate.title,
        icon: data.icon !== undefined ? data.icon : pageToUpdate.icon,
        description: data.description !== undefined ? data.description : pageToUpdate.description,
        content: data.content !== undefined ? data.content : pageToUpdate.content
      };
      
      const response = await mySpaceService.updatePage(id, payload);
      if (response.data?.success) {
        setPages(prev => prev.map(p => p.id === id ? response.data.data : p));
      }
    } catch (err) {
      console.error("Error updating page:", err);
    }
  };

  const deletePage = async (id) => {
    try {
      const response = await mySpaceService.deletePage(id);
      if (response.data?.success) {
        setPages(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  return (
    <MySpaceContext.Provider value={{ 
      folders, 
      pages, 
      isLoading,
      error,
      addFolder, 
      updateFolder,
      deleteFolder,
      addPage,
      updatePage,
      deletePage,
      duplicatePage
    }}>
      {children}
    </MySpaceContext.Provider>
  );
}

export function useMySpace() {
  const context = useContext(MySpaceContext);
  if (!context) {
    throw new Error('useMySpace must be used within a MySpaceProvider');
  }
  return context;
}


