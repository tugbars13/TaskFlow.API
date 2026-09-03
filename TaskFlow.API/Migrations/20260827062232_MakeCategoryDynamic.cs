using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaskFlow.API.Migrations
{
    /// <inheritdoc />
    public partial class MakeCategoryDynamic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "UserCategoryBehaviors",
                newName: "CategoryId");




            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Tasks",
                newName: "CategoryId");

            migrationBuilder.Sql("UPDATE Tasks SET CategoryId = 6 WHERE CategoryId = 0;");
            migrationBuilder.Sql("UPDATE Tasks SET CategoryId = CategoryId + 1000 WHERE CategoryId > 0 AND CategoryId <= 12;");
            migrationBuilder.Sql("UPDATE UserCategoryBehaviors SET CategoryId = 6 WHERE CategoryId = 0;");
            migrationBuilder.Sql("UPDATE UserCategoryBehaviors SET CategoryId = CategoryId + 1000 WHERE CategoryId > 0 AND CategoryId <= 12;");




            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "CustomCategories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.InsertData(
                table: "CustomCategories",
                columns: new[] { "Id", "Name", "UserId" },
                values: new object[,]
                {
                    { 1001, "Personal", null },
                    { 1002, "Work", null },
                    { 1003, "Study", null },
                    { 1004, "Shopping", null },
                    { 1005, "Health", null },
                    { 1006, "General", null },
                    { 1007, "Design System", null },
                    { 1008, "Backend", null },
                    { 1009, "Frontend", null },
                    { 1010, "Marketing", null },
                    { 1011, "QA", null },
                    { 1012, "Team Sync", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_CategoryId",
                table: "Tasks",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks",
                column: "CategoryId",
                principalTable: "CustomCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_CustomCategories_CategoryId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_CategoryId",
                table: "Tasks");

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1002);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1003);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1004);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1005);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1006);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1007);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1008);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1009);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1010);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1011);

            migrationBuilder.DeleteData(
                table: "CustomCategories",
                keyColumn: "Id",
                keyValue: 1012);

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "UserCategoryBehaviors",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Tasks",
                newName: "Category");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "CustomCategories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
