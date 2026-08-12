using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Models;

namespace TaskFlow.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // Veritabanındaki Tasks tablosunu temsil eder.
    public DbSet<TaskItem> Tasks { get; set; }

    // Veritabanındaki Users tablosunu temsil eder.
    public DbSet<User> Users { get; set; }

    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<TaskAssignee> TaskAssignees { get; set; }

    // Model oluşturulurken çalışır.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User (1) ---- (*) TaskItem ilişkisini tanımlar.
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)              // Her Task'ın bir User'ı vardır.
            .WithMany(u => u.Tasks)           // Bir User'ın birçok Task'ı olabilir.
            .HasForeignKey(t => t.UserId)     // Foreign Key alanı UserId'dir.
            .OnDelete(DeleteBehavior.Cascade);// User silinirse Task'ları da silinir.

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedUser)
            .WithMany()
            .HasForeignKey(t => t.AssignedUserId)
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

        // Bir kullanÄ±cÄ± bir takÄ±ma yalnÄ±zca bir kez eklenebilir.
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