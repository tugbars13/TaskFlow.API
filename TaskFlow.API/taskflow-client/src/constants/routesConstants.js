export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  TASKS: "/tasks",
  CALENDAR: "/calendar",
  ANALYTICS: "/analytics",
  TEAM: "/team",
  TEAM_TASKS: "/teams/:teamId/tasks",
  MY_SPACE: "/myspace",
  SETTINGS: "/settings",
  PROFILE: "/profile",

  teamTasks: (teamId) => `/teams/${teamId}/tasks`,
};

