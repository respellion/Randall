using System.Net;
using System.Net.Http.Json;
using Randall.Api.IntegrationTests.Helpers;

namespace Randall.Api.IntegrationTests.Workplaces;

public class WorkplaceTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly string _today = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd");
    private readonly string _yesterday = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1).ToString("yyyy-MM-dd");

    [Fact]
    public async Task GetAll_WithoutAuth_Returns401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/workplaces");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithAuth_ReturnsAllSeededWorkplaces()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);

        Assert.NotNull(workplaces);
        Assert.Equal(16, workplaces.Count);
        Assert.All(workplaces, w =>
        {
            Assert.NotEqual(Guid.Empty, w.Id);
            Assert.NotEmpty(w.Name);
            Assert.NotEmpty(w.Location);
        });
    }

    [Fact]
    public async Task GetAvailable_WithPastDate_ReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var response = await client.GetAsync($"/api/workplaces/available?date={_yesterday}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAvailable_ForTodayWithNoReservations_ReturnsAllWorkplaces()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            $"/api/workplaces/available?date={_today}", AuthHelper.JsonOptions);

        Assert.NotNull(workplaces);
        Assert.Equal(16, workplaces.Count);
    }

    [Fact]
    public async Task GetSchedule_WithoutAuth_Returns401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/workplaces/schedule?date={_today}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetSchedule_ForTodayWithNoReservations_ReturnsAllAsAvailable()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var schedule = await client.GetFromJsonAsync<List<WorkplaceScheduleResponse>>(
            $"/api/workplaces/schedule?date={_today}", AuthHelper.JsonOptions);

        Assert.NotNull(schedule);
        Assert.Equal(16, schedule.Count);
        Assert.All(schedule, s =>
        {
            Assert.True(s.IsAvailable);
            Assert.Null(s.ReservedBy);
        });
    }

    [Fact]
    public async Task GetSchedule_AfterReservation_ShowsWorkplaceAsUnavailable()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var userToken = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email, name: "Schedule Tester");

        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, userToken);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);
        var workplaceId = workplaces![0].Id;

        // Reserve for a date unique to this test to avoid conflicts
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(7);
        var dateStr = date.ToString("yyyy-MM-dd");

        await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });

        var schedule = await client.GetFromJsonAsync<List<WorkplaceScheduleResponse>>(
            $"/api/workplaces/schedule?date={dateStr}", AuthHelper.JsonOptions);

        var entry = schedule!.First(s => s.Id == workplaceId);
        Assert.False(entry.IsAvailable);
        Assert.Equal("Schedule Tester", entry.ReservedBy);
    }
}
