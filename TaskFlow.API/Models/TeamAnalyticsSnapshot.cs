using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskFlow.API.Models
{
    public class TeamAnalyticsSnapshot
    {
        [Key]
        public int Id { get; set; }

        public int TeamId { get; set; }
        [ForeignKey("TeamId")]
        public Team Team { get; set; } = null!;

        [Required]
        public string PeriodType { get; set; } = string.Empty; // daily, weekly, monthly

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int MemberCount { get; set; }
        public int CompletedTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int CompletionRate { get; set; }
        public int PreviousPeriodCompletionRate { get; set; }

        public string ProgressTrendJson { get; set; } = string.Empty;
        public string ActiveMembersJson { get; set; } = string.Empty;
        public string OverdueTasksListJson { get; set; } = string.Empty;

        public string AiSummary { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
