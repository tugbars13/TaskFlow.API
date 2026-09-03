using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFolderHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentFolderId",
                table: "MySpaceFolders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MySpaceFolders_ParentFolderId",
                table: "MySpaceFolders",
                column: "ParentFolderId");

            migrationBuilder.AddForeignKey(
                name: "FK_MySpaceFolders_MySpaceFolders_ParentFolderId",
                table: "MySpaceFolders",
                column: "ParentFolderId",
                principalTable: "MySpaceFolders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MySpaceFolders_MySpaceFolders_ParentFolderId",
                table: "MySpaceFolders");

            migrationBuilder.DropIndex(
                name: "IX_MySpaceFolders_ParentFolderId",
                table: "MySpaceFolders");

            migrationBuilder.DropColumn(
                name: "ParentFolderId",
                table: "MySpaceFolders");
        }
    }
}
