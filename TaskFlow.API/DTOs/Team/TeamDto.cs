namespace TaskFlow.API.DTOs.Team
{
    public class TeamDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedDate { get; set; }

        public int MemberCount { get; set; }

        /// <summary>
        /// The current authenticated user's TeamRole in this team (Owner / Admin / Member).
        /// Empty string if the user is not a member of this team.
        /// </summary>
        public string UserRole { get; set; } = string.Empty;
    }
}