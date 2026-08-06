namespace TaskFlow.API.DTOs.Team
{
    public class CreateTeamMemberDto
    {
        public int UserId { get; set; }

        public int TeamId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public int ActiveProjects { get; set; }

        public int Workload { get; set; }

        public string Status { get; set; } = "Active";

        public string AvatarUrl { get; set; } = string.Empty;
    }
}