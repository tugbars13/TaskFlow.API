namespace TaskFlow.API.DTOs.Team
{
    public class CreateTeamMemberDto
    {
        public int UserId { get; set; }

        public int TeamId { get; set; }

        public string Role { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";
    }
}