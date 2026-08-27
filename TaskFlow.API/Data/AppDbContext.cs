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
    public DbSet<CustomCategory> CustomCategories { get; set; }

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

    public DbSet<MySpaceFolder> MySpaceFolders { get; set; }
    public DbSet<MySpacePage> MySpacePages { get; set; }

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

        

        // TaskItem -> CustomCategory relation
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed default CustomCategories
        modelBuilder.Entity<CustomCategory>().HasData(
            new CustomCategory { Id = 1001, Name = "Personal", UserId = null },
            new CustomCategory { Id = 1002, Name = "Work", UserId = null },
            new CustomCategory { Id = 1003, Name = "Study", UserId = null },
            new CustomCategory { Id = 1004, Name = "Shopping", UserId = null },
            new CustomCategory { Id = 1005, Name = "Health", UserId = null },
            new CustomCategory { Id = 1006, Name = "General", UserId = null },
            new CustomCategory { Id = 1007, Name = "Design System", UserId = null },
            new CustomCategory { Id = 1008, Name = "Backend", UserId = null },
            new CustomCategory { Id = 1009, Name = "Frontend", UserId = null },
            new CustomCategory { Id = 1010, Name = "Marketing", UserId = null },
            new CustomCategory { Id = 1011, Name = "QA", UserId = null },
            new CustomCategory { Id = 1012, Name = "Team Sync", UserId = null }
        );

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

        // MySpace Relationships
        modelBuilder.Entity<MySpacePage>()
            .HasOne(p => p.Folder)
            .WithMany(f => f.Pages)
            .HasForeignKey(p => p.FolderId)
            // Gvenli iliki: Klasr silindiinde iindeki sayfalar silinmesin (cascade olmasn).
            // DeleteBehavior.Restrict ile klasr silinmesi engellenebilir veya
            // DeleteBehavior.SetNull ile sayfalar root'a (FolderId = null) denbilir.
            // "cascade yerine gvenli bir iliki tercih et" ve "root sayfalar desteklensin" 
            // kurallarna istinaden sayfalarn kaybolmamas iin Restrict kullanlyoruz. 
            // Bylece klasr silinmeden nce sayfalarn manuel olarak baka yere tanmas/karlmas istenir.
            .OnDelete(DeleteBehavior.Restrict);
    }
}


