import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedPage, updateSharedPage } from "../api/mySpaceService";
import BlockEditor from "../components/blockEditor/BlockEditor";
import { Spinner, Button } from "@/components/ui";
import useAuth from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/constants/routesConstants";

export default function SharedPageView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAuth();

  const [page, setPage] = useState(null);
  const [permission, setPermission] = useState("View");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await getSharedPage(token);
        if (response.data?.success && isMounted) {
          setPage(response.data.data);
          setPermission(response.data.data.permission);
        } else if (isMounted) {
          setError("Sayfa bulunamadı veya erişim izniniz yok.");
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Sayfa yüklenirken bir hata oluştu.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchPage();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSave = async (updatedData) => {
    try {
      const payload = {
        title: updatedData.title,
        icon: updatedData.icon,
        description: updatedData.description,
        content: updatedData.content,
      };
      await updateSharedPage(token, payload);
    } catch (err) {
      console.error("Sayfa kaydedilemedi:", err);
    }
  };

  const handleBack = () => {
    if (isAuthenticated) {
      navigate(ROUTES.MY_SPACE);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 gap-4">
        <span className="material-symbols-outlined text-[64px] text-gray-300">
          error
        </span>
        <h2 className="text-xl font-medium text-gray-700">
          {error || "Sayfa bulunamadı"}
        </h2>
        <Button onClick={handleBack} variant="secondary">
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const isReadOnly =
    permission === "View" || (permission === "Edit" && !isAuthenticated);

  return (
    <div className="flex flex-col h-screen bg-white">
      {permission === "Edit" && !isAuthenticated && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Bu sayfayı düzenleme izni verilmiş ancak giriş yapmadığınız için
            salt okunur modda görüntülüyorsunuz.
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              navigate(ROUTES.LOGIN, {
                state: { returnUrl: `/myspace/share/${token}` },
              })
            }
          >
            Giriş Yap
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-hidden relative">
        <BlockEditor
          page={page}
          onBack={handleBack}
          onChange={handleSave}
          readOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
