using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseInMemoryDatabase(databaseName: "TestDb")
    .Options;

using var context = new AppDbContext(options);

// Users
context.Users.Add(new User { Id = 1, FullName = "Current User", Email = "current@test.com", PasswordHash = "hash", CreatedDate = DateTime.UtcNow });
context.Users.Add(new User { Id = 2, FullName = "Other User", Email = "other@test.com", PasswordHash = "hash", CreatedDate = DateTime.UtcNow });

// Teams
context.Teams.Add(new Team { Id = 1, Name = "Team A", CreatedDate = DateTime.UtcNow });

context.SaveChanges();

// 1. Personal task for current user
context.Tasks.Add(new TaskItem { Id = 1, Title = "Personal Task", AssignedUserId = 1, UserId = 1, IsDeleted = false, CreatedDate = DateTime.UtcNow, Priority = TaskPriority.Medium, Category = TaskCategory.Personal });

// 2. Team task assigned to current user in Team A
context.Tasks.Add(new TaskItem { Id = 2, Title = "Team Task Current User", AssignedUserId = 1, UserId = 1, TeamId = 1, IsDeleted = false, CreatedDate = DateTime.UtcNow, Priority = TaskPriority.Medium, Category = TaskCategory.Work });

// 3. Team task assigned to other user in Team A
context.Tasks.Add(new TaskItem { Id = 3, Title = "Team Task Other User", AssignedUserId = 2, UserId = 1, TeamId = 1, IsDeleted = false, CreatedDate = DateTime.UtcNow, Priority = TaskPriority.Medium, Category = TaskCategory.Work });

context.SaveChanges();

var repo = new TaskRepository(context);

// Test My Tasks for user 1
var myTasks = await repo.GetAllByUserIdAsync(1);
Console.WriteLine("My Tasks count: " + myTasks.Count);
Console.WriteLine("My Tasks: " + string.Join(", ", myTasks.Select(t => t.Title)));

// Test Team A tasks
var teamTasks = await repo.GetByTeamIdAsync(1);
Console.WriteLine("Team Tasks count: " + teamTasks.Count);
Console.WriteLine("Team Tasks: " + string.Join(", ", teamTasks.Select(t => t.Title)));
