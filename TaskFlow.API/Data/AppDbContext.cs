using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Models;

namespace TaskFlow.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // VeritabanÄ±ndaki Tasks tablosunu temsil eder.
    public DbSet<TaskItem> Tasks { get; set; }

    // VeritabanÄ±ndaki Users tablosunu temsil eder.
    public DbSet<User> Users { get; set; }

    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<TaskAssignee> TaskAssignees { get; set; }
    public DbSet<UserBehaviorProfile> UserBehaviorProfiles { get; set; }
    public DbSet<UserCategoryBehavior> UserCategoryBehaviors { get; set; }
    public DbSet<TeamAnalyticsSnapshot> TeamAnalyticsSnapshots { get; set; }

    // Model oluÅŸturulurken Ã§alÄ±ÅŸÄ±r.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserBehaviorProfile>()
            .HasMany(p => p.CategoryBehaviors)
            .WithOne(c => c.Profile)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // User (1) ---- (*) TaskItem iliÅŸkisini tanÄ±mlar.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)              // Her Task'Ä±n bir User'Ä± vardÄ±r.
            .WithMany(u => u.Tasks)           // Bir User'Ä±n birÃ§ok Task'Ä± olabilir.
            .HasForeignKey(t => t.UserId)     // Foreign Key alanÄ± UserId'dir.
            .OnDelete(DeleteBehavior.Cascade);// User silinirse Task'larÄ± da silinir.

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedUser)
            .WithMany()
            .HasForeignKey(t => t.AssignedUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // TaskItem self-referencing: Parent-Child (AI Task Breakdown)
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.ParentTask)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(t => t.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(tm => tm.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.User)
            .WithMany(u => u.TeamMemberships)
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Bir kullanÃ„Â±cÃ„Â± bir takÃ„Â±ma yalnÃ„Â±zca bir kez eklenebilir.
        modelBuilder.Entity<TeamMember>()
            .HasIndex(tm => new { tm.TeamId, tm.UserId })
            .IsUnique();

        modelBuilder.Entity<TaskAssignee>()
            .HasKey(ta => ta.Id);

        modelBuilder.Entity<TaskAssignee>()
            .HasIndex(ta => new { ta.TaskId, ta.UserId })
            .IsUnique();

        modelBuilder.Entity<TaskAssignee>()
            .HasOne(ta => ta.Task)
            .WithMany(t => t.Assignees)
            .HasForeignKey(ta => ta.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskAssignee>()
            .HasOne(ta => ta.User)
            .WithMany(u => u.TaskAssignees)
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

