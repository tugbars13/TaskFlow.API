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
  if (!teamId) throw new Error("teamId is required to fetch members.");
  const response = await api.get(`/teams/${teamId}/members`);
  return unwrapResponse(response, []);
};

export const addTeamMember = async (teamId, memberData) => {
  const response = await api.post(`/teams/${teamId}/members`, memberData);
  return unwrapResponse(response);
};

export const inviteTeamMember = async (teamId, userId) => {
  const response = await api.post(`/teams/${teamId}/members/${userId}/invite`);
  return unwrapResponse(response);
};

export const updateTeamMember = async (teamId, memberId, updatedFields) => {
  const response = await api.put(`/teams/${teamId}/members/${memberId}`, updatedFields);
  return unwrapResponse(response);
};

export const deleteTeamMember = async (teamId, memberId) => {
  await api.delete(`/teams/${teamId}/members/${memberId}`);
  return true;
};

export const acceptTeamInvitation = async (teamId) => {
  const response = await api.post(`/teams/${teamId}/invitations/accept`);
  return unwrapResponse(response);
};

export const rejectTeamInvitation = async (teamId) => {
  const response = await api.post(`/teams/${teamId}/invitations/reject`);
  return unwrapResponse(response);
};

export const getInvitableUsers = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/invitable-users`);
  return unwrapResponse(response, []);
};

export const getTeamAnalytics = async (teamId, period = "weekly") => {
  const response = await api.get(`/teams/${teamId}/analytics`, { params: { period } });
  return unwrapResponse(response);
};
