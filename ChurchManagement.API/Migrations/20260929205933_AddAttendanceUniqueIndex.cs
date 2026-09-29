using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChurchManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attendance_MemberId",
                table: "Attendance");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_MemberId_EventId",
                table: "Attendance",
                columns: new[] { "MemberId", "EventId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attendance_MemberId_EventId",
                table: "Attendance");

            migrationBuilder.CreateIndex(
                name: "IX_Attendance_MemberId",
                table: "Attendance",
                column: "MemberId");
        }
    }
}
