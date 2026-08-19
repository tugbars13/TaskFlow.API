using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamAnalyticsSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TeamAnalyticsSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    PeriodType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MemberCount = table.Column<int>(type: "int", nullable: false),
                    CompletedTasks = table.Column<int>(type: "int", nullable: false),
                    InProgressTasks = table.Column<int>(type: "int", nullable: false),
                    OverdueTasks = table.Column<int>(type: "int", nullable: false),
                    CompletionRate = table.Column<int>(type: "int", nullable: false),
                    PreviousPeriodCompletionRate = table.Column<int>(type: "int", nullable: false),
                    ProgressTrendJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActiveMembersJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OverdueTasksListJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamAnalyticsSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamAnalyticsSnapshots_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeamAnalyticsSnapshots_TeamId",
                table: "TeamAnalyticsSnapshots",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeamAnalyticsSnapshots");
        }
    }
}
