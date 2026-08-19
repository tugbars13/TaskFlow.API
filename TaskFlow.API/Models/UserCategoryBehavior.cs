using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskFlow.API.Models;

namespace TaskFlow.API.Models
{
    public class UserCategoryBehavior
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public UserBehaviorProfile Profile { get; set; } = null!;

        public TaskCategory Category { get; set; }
        
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int LateTasks { get; set; }
        public int ProcrastinatedTasks { get; set; }
        public double OnTimeCompletionRate { get; set; }
        
        public string RiskLevel { get; set; } = "DÜŞÜK"; // YÜKSEK, ORTA, DÜŞÜK

        public DateTime LastCalculatedAt { get; set; }
    }
}
