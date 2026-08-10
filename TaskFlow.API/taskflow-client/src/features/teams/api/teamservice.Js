import api from "@/api/client/axios";

const unwrapResponse = (response, fallback = null) => {
  return response.data?.data ?? response.data ?? fallback;
};

// Database Teams CRUD API Calls
export const getTeams = async () => {
  const response = await api.get("/teams");
  return unwrapResponse(response, []);
};

export const createTeam = async (teamData) => {
  const response = await api.post("/teams", teamData);
  return unwrapResponse(response);
};

export const getTeamById = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return unwrapResponse(response);
};

export const deleteTeam = async (teamId) => {
  await api.delete(`/teams/${teamId}`);
  return true;
};

// Database Team Members API Calls
export const getTeamMembers = async (teamId) => {
  const url = teamId ? `/Team/team/${teamId}` : "/Team";
  const response = await api.get(url);
  return unwrapResponse(response, []);
};

export const getTeamMemberById = async (id) => {
  const response = await api.get(`/Team/${id}`);
  return unwrapResponse(response);
};

export const addTeamMember = async (memberData) => {
  const response = await api.post("/Team", memberData);
  return unwrapResponse(response);
};

export const inviteTeamMember = async (memberData) => {
  const response = await api.post("/Team/invite", memberData);
  return unwrapResponse(response);
};

export const updateTeamMember = async (id, updatedFields) => {
  const response = await api.put(`/Team/${id}`, updatedFields);
  return unwrapResponse(response);
};

export const deleteTeamMember = async (id) => {
  await api.delete(`/Team/${id}`);
  return true;
};
