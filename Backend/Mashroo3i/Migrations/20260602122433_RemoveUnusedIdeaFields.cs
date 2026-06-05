using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mashroo3i.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedIdeaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusinessType",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "BusinessTypeReason",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "ProblemStatement",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "Provinces",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "TargetAudience",
                table: "BusinessIdeas");

            migrationBuilder.DropColumn(
                name: "Usp",
                table: "BusinessIdeas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusinessType",
                table: "BusinessIdeas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BusinessTypeReason",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProblemStatement",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Provinces",
                table: "BusinessIdeas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TargetAudience",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Usp",
                table: "BusinessIdeas",
                type: "text",
                nullable: true);
        }
    }
}
