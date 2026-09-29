using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Visitors;
using ChurchManagement.API.Services;

namespace ChurchManagement.Tests;

public class VisitorServiceTests
{
    [Fact]
    public async Task CreateVisitor_ShouldDefaultFollowUpToPending()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new VisitorService(context);

        var request = new CreateVisitorRequest
        {
            FirstName = "Jane",
            LastName = "Smith",
            Phone = "0123456789",
            VisitDate = DateTime.UtcNow
        };

        var result = await service.CreateAsync(request);

        Assert.NotNull(result);
        Assert.Equal(
            "Pending",
            result.FollowUpStatus);
    }

    [Fact]
    public async Task UpdateFollowUp_ShouldRejectInvalidStatus()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new VisitorService(context);

        var visitor = await service.CreateAsync(
            new CreateVisitorRequest
            {
                FirstName = "Jane",
                LastName = "Smith",
                VisitDate = DateTime.UtcNow
            });

        var request = new UpdateVisitorFollowUpRequest
        {
            FollowUpStatus = "Something Invalid"
        };

        await Assert.ThrowsAsync<ArgumentException>(
            () => service.UpdateFollowUpAsync(
                visitor.VisitorId,
                request));
    }
}