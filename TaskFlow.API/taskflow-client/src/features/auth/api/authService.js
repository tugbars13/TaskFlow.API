import api from "@/api/client/axios";

export const loginRequest = async (email, password) => {
    const response = await api.post("/Auth/login", {
        email,
        password
    });

    return response.data;
};

export const registerRequest = async (user) => {
    const response = await api.post("/Auth/register", user);

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/Auth/me");
    return response.data;
};