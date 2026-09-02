using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class FixAuditConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MySpacePages_MySpaceFolders_FolderId",
                table: "MySpacePages");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignees_Users_UserId",
                table: "TaskAssignees");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Tasks_ParentTaskId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_TaskAssignees_TaskId_UserId",
                table: "TaskAssignees");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Tasks",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "TaskAssignees",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignees_TaskId_UserId",
                table: "TaskAssignees",
                columns: new[] { "TaskId", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MySpaceFolders_UserId",
                table: "MySpaceFolders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomCategories_UserId",
                table: "CustomCategories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomCategories_Users_UserId",
                table: "CustomCategories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MySpaceFolders_Users_UserId",
                table: "MySpaceFolders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MySpacePages_MySpaceFolders_FolderId",
                table: "MySpacePages",
                column: "FolderId",
                principalTable: "MySpaceFolders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignees_Users_UserId",
                table: "TaskAssignees",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks",
                column: "CategoryId",
                principalTable: "CustomCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Tasks_ParentTaskId",
                table: "Tasks",
                column: "ParentTaskId",
                principalTable: "Tasks",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomCategories_Users_UserId",
                table: "CustomCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MySpaceFolders_Users_UserId",
                table: "MySpaceFolders");

            migrationBuilder.DropForeignKey(
                name: "FK_MySpacePages_MySpaceFolders_FolderId",
                table: "MySpacePages");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskAssignees_Users_UserId",
                table: "TaskAssignees");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Tasks_ParentTaskId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_TaskAssignees_TaskId_UserId",
                table: "TaskAssignees");

            migrationBuilder.DropIndex(
                name: "IX_MySpaceFolders_UserId",
                table: "MySpaceFolders");

            migrationBuilder.DropIndex(
                name: "IX_CustomCategories_UserId",
                table: "CustomCategories");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Tasks",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "TaskAssignees",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignees_TaskId_UserId",
                table: "TaskAssignees",
                columns: new[] { "TaskId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MySpacePages_MySpaceFolders_FolderId",
                table: "MySpacePages",
                column: "FolderId",
                principalTable: "MySpaceFolders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignees_Users_UserId",
                table: "TaskAssignees",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks",
                column: "CategoryId",
                principalTable: "CustomCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Tasks_ParentTaskId",
                table: "Tasks",
                column: "ParentTaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
