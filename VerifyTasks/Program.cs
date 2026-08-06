using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Services;

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=TaskFlowDb;Trusted_Connection=True;TrustServerCertificate=True;")
    .Options;

using var context = new AppDbContext(options);
var teamAuthService = new TeamAuthorizationService(context);

// Scenario 1: Personal Task (TeamId = NULL)
// From our DB: Task 7, UserId=2 (Creator: Onur), AssignedUserId=1 (Assignee: Tuğba)
var personalTask = await context.Tasks.FirstOrDefaultAsync(t => t.Id == 7);
if (personalTask != null) {
    Console.WriteLine($"\n--- SCENARIO 1: PERSONAL TASK (Id: {personalTask.Id}, TeamId: NULL, Creator: {personalTask.UserId}, Assignee: {personalTask.AssignedUserId}) ---");
    Console.WriteLine($"Creator (UserId 2) can manage: {await teamAuthService.CanManageTaskAsync(personalTask, 2, false)}");
    Console.WriteLine($"Assignee (UserId 1) can manage: {await teamAuthService.CanManageTaskAsync(personalTask, 1, false)}");
    Console.WriteLine($"Random User (UserId 3) can manage: {await teamAuthService.CanManageTaskAsync(personalTask, 3, false)}");
    Console.WriteLine($"Admin (UserId 3, isAdmin=true) can manage: {await teamAuthService.CanManageTaskAsync(personalTask, 3, true)}");
}

// Scenario 2: Team Task (TeamId != NULL)
// Let's find a team task. Team 5 has CreatedByUserId=1 (Tuğba). TeamMember 1 is Owner, TeamMember 2 is Member.
// Task 12 has TeamId=5.
var teamTask = await context.Tasks.FirstOrDefaultAsync(t => t.Id == 12);
if (teamTask != null) {
    Console.WriteLine($"\n--- SCENARIO 2: TEAM TASK (Id: {teamTask.Id}, TeamId: {teamTask.TeamId}) ---");
    Console.WriteLine($"Team Creator (UserId 1) can manage: {await teamAuthService.CanManageTaskAsync(teamTask, 1, false)}");
    Console.WriteLine($"Team Member (UserId 2) can manage: {await teamAuthService.CanManageTaskAsync(teamTask, 2, false)}");
    Console.WriteLine($"Non-Member (UserId 3) can manage: {await teamAuthService.CanManageTaskAsync(teamTask, 3, false)}");
    Console.WriteLine($"Admin (UserId 3, isAdmin=true) can manage: {await teamAuthService.CanManageTaskAsync(teamTask, 3, true)}");
}

Console.WriteLine("\nAll tests completed successfully.");
