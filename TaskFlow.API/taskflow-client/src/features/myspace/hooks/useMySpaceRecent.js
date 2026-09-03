import { useState, useEffect } from "react";
import * as mySpaceService from "../api/mySpaceService";

export default function useMySpaceRecent() {
  const [data, setData] = useState({
    folders: [],
    pages: [],
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([mySpaceService.getFolders(), mySpaceService.getPages()])
      .then(([fRes, pRes]) => {
        if (!isMounted) return;
        setData({
          folders: fRes.data?.success ? fRes.data.data : [],
          pages: pRes.data?.success ? pRes.data.data : [],
          loading: false,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setData({ folders: [], pages: [], loading: false });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
