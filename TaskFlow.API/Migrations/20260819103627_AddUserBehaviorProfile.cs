using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserBehaviorProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserBehaviorProfiles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TotalTasks = table.Column<int>(type: "int", nullable: false),
                    CompletedTasks = table.Column<int>(type: "int", nullable: false),
                    LateTasks = table.Column<int>(type: "int", nullable: false),
                    ProcrastinatedTasks = table.Column<int>(type: "int", nullable: false),
                    OnTimeCompletionRate = table.Column<double>(type: "float", nullable: false),
                    AverageCompletionDays = table.Column<double>(type: "float", nullable: false),
                    CurrentOverdueTasks = table.Column<int>(type: "int", nullable: false),
                    LastCalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBehaviorProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserBehaviorProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCategoryBehaviors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    TotalTasks = table.Column<int>(type: "int", nullable: false),
                    CompletedTasks = table.Column<int>(type: "int", nullable: false),
                    LateTasks = table.Column<int>(type: "int", nullable: false),
                    ProcrastinatedTasks = table.Column<int>(type: "int", nullable: false),
                    OnTimeCompletionRate = table.Column<double>(type: "float", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastCalculatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCategoryBehaviors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCategoryBehaviors_UserBehaviorProfiles_UserId",
                        column: x => x.UserId,
                        principalTable: "UserBehaviorProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCategoryBehaviors_UserId",
                table: "UserCategoryBehaviors",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCategoryBehaviors");

            migrationBuilder.DropTable(
                name: "UserBehaviorProfiles");
        }
    }
}
