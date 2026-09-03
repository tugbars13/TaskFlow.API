using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Models;

namespace TaskFlow.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Veritabanı tabloları
    public DbSet<TaskItem> Tasks { get; set; }
    public DbSet<CustomCategory> CustomCategories { get; set; }
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
    public DbSet<NotificationPreference> NotificationPreferences { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ============================================================
        // USER BEHAVIOR
        // ============================================================

        modelBuilder.Entity<UserBehaviorProfile>()
            .HasMany(p => p.CategoryBehaviors)
            .WithOne(c => c.Profile)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // TASK -> USER
        // ============================================================

        // Kullanıcı silinirse kendi görevleri de silinsin.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // TASK -> CUSTOM CATEGORY
        // ============================================================

        // Kategori silinirse görev silinmez.
        // Sadece CategoryId NULL olur.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // CUSTOM CATEGORY -> USER
        // ============================================================

        // Kullanıcı silinse bile kategori otomatik silinmesin.
        // Böylece User -> Task -> Category üzerinden cascade path oluşmaz.
        modelBuilder.Entity<CustomCategory>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // DEFAULT CUSTOM CATEGORIES
        // ============================================================

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


        // ============================================================
        // TASK -> PARENT TASK
        // ============================================================

        // Parent task silinirse alt görevler otomatik silinmez.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.ParentTask)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(t => t.ParentTaskId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // TEAM MEMBER -> TEAM
        // ============================================================

        // Team silinirse TeamMember kayıtları silinsin.
        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.Team)
            .WithMany(t => t.Members)
            .HasForeignKey(tm => tm.TeamId)
            .OnDelete(DeleteBehavior.Cascade);


        // ============================================================
        // TEAM MEMBER -> USER
        // ============================================================

        // Kullanıcı silinirse TeamMembership kayıtları silinsin.
        modelBuilder.Entity<TeamMember>()
            .HasOne(tm => tm.User)
            .WithMany(u => u.TeamMemberships)
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // Bir kullanıcı aynı takıma yalnızca bir kez eklenebilir.
        modelBuilder.Entity<TeamMember>()
            .HasIndex(tm => new { tm.TeamId, tm.UserId })
            .IsUnique();


        // ============================================================
        // TASK ASSIGNEE
        // ============================================================

        modelBuilder.Entity<TaskAssignee>()
            .HasKey(ta => ta.Id);

        modelBuilder.Entity<TaskAssignee>()
            .HasIndex(ta => new { ta.TaskId, ta.UserId })
            .IsUnique()
            .HasFilter("[UserId] IS NOT NULL");


        // TaskAssignee -> Task
        // Task silinirse atama kaydı silinsin.
        modelBuilder.Entity<TaskAssignee>()
            .HasOne(ta => ta.Task)
            .WithMany(t => t.Assignees)
            .HasForeignKey(ta => ta.TaskId)
            .OnDelete(DeleteBehavior.Cascade);


        // TaskAssignee -> User
        // User silinirse TaskAssignee otomatik silinmesin.
        // Multiple cascade path oluşmasını engelliyoruz.
        modelBuilder.Entity<TaskAssignee>()
            .HasOne(ta => ta.User)
            .WithMany(u => u.TaskAssignees)
            .HasForeignKey(ta => ta.UserId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // TASK -> TEAM
        // ============================================================

        // Team silinirse görev takımsız kalsın.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Team)
            .WithMany()
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // USER EMAIL UNIQUE
        // ============================================================

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();


        // ============================================================
        // MY SPACE FOLDER -> USER
        // ============================================================

        // User silinince MySpace klasörleri otomatik silinmesin.
        // Multiple cascade path oluşmasını engelliyoruz.
        modelBuilder.Entity<MySpaceFolder>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.NoAction);


        // ============================================================
        // MY SPACE PAGE -> FOLDER
        // ============================================================

        // Folder silinirse Page'in FolderId değeri NULL olur.
        modelBuilder.Entity<MySpacePage>()
            .HasOne(p => p.Folder)
            .WithMany(f => f.Pages)
            .HasForeignKey(p => p.FolderId)
            .OnDelete(DeleteBehavior.NoAction);

        // ============================================================
        // NOTIFICATION PREFERENCE -> USER
        // ============================================================

        modelBuilder.Entity<NotificationPreference>()
            .HasOne(np => np.User)
            .WithOne(u => u.NotificationPreference)
            .HasForeignKey<NotificationPreference>(np => np.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotificationPreference>()
            .HasIndex(np => np.UserId)
            .IsUnique();
    }
}