using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskFlow.API.Models;

namespace TaskFlow.API.Models
{
    public class UserBehaviorProfile
    {
        [Key]
        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int LateTasks { get; set; }
        public int ProcrastinatedTasks { get; set; }
        public double OnTimeCompletionRate { get; set; }
        public double AverageCompletionDays { get; set; }
        public int CurrentOverdueTasks { get; set; }
        public DateTime LastCalculatedAt { get; set; }

        public ICollection<UserCategoryBehavior> CategoryBehaviors { get; set; } = new List<UserCategoryBehavior>();
    }
}
