import api from "@/api/client/axios";

export const uploadFile = async (formData) => {
  const response = await api.post("upload/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await api.post("upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
