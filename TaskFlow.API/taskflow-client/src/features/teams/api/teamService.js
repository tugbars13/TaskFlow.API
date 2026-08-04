import api from "@/api/axios";

// Database Teams CRUD API Calls
export const getTeams = async () => {
  const response = await api.get("/teams");
  return response.data?.data || response.data || [];
};

export const createTeam = async (teamData) => {
  const response = await api.post("/teams", teamData);
  return response.data?.data || response.data;
};

export const getTeamById = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data?.data || response.data;
};

export const deleteTeam = async (teamId) => {
  await api.delete(`/teams/${teamId}`);
  return true;
};

// Database Team Members API Calls
export const getTeamMembers = async (teamId) => {
  const url = teamId ? `/Team/team/${teamId}` : "/Team";
  const response = await api.get(url);
  return response.data?.data || response.data || [];
};

export const getTeamMemberById = async (id) => {
  const response = await api.get(`/Team/${id}`);
  return response.data?.data || response.data;
};

export const addTeamMember = async (memberData) => {
  const response = await api.post("/Team", memberData);
  return response.data?.data || response.data;
};

export const inviteTeamMember = async (memberData) => {
  const response = await api.post("/Team/invite", memberData);
  return response.data?.data || response.data;
};

export const updateTeamMember = async (id, updatedFields) => {
  const response = await api.put(`/Team/${id}`, updatedFields);
  return response.data?.data || response.data;
};

export const deleteTeamMember = async (id) => {
  await api.delete(`/Team/${id}`);
  return true;
};
