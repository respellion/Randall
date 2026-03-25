using System.Net;
using System.Net.Http.Json;
using Randall.Api.IntegrationTests.Helpers;

namespace Randall.Api.IntegrationTests.Reservations;

public class ReservationTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task Create_WithoutAuth_Returns401()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = Guid.NewGuid(), Date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1) });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidReservation_Returns201WithDetails()
    {
        var (client, workplaceId, date) = await SetupUserWithWorkplaceAsync(daysOffset: 1);

        var response = await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<CreatedReservationResponse>(AuthHelper.JsonOptions);
        Assert.NotEqual(Guid.Empty, created!.Id);
        Assert.Equal(workplaceId, created.WorkplaceId);
        Assert.Equal(date.ToString("yyyy-MM-dd"), created.Date);
    }

    [Fact]
    public async Task GetById_ForExistingReservation_ReturnsDetails()
    {
        var (client, workplaceId, date) = await SetupUserWithWorkplaceAsync(daysOffset: 2);

        var createResponse = await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });
        var created = await createResponse.Content.ReadFromJsonAsync<CreatedReservationResponse>(AuthHelper.JsonOptions);

        var response = await client.GetAsync($"/api/reservations/{created!.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var detail = await response.Content.ReadFromJsonAsync<ReservationDetailResponse>(AuthHelper.JsonOptions);
        Assert.Equal(created.Id, detail!.Id);
        Assert.Equal(workplaceId, detail.WorkplaceId);
        Assert.Equal("Active", detail.Status);
    }

    [Fact]
    public async Task GetById_ForNonExistentReservation_Returns404()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var response = await client.GetAsync($"/api/reservations/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetMy_ReturnsOnlyOwnReservations()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var token = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);
        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, token);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(3);
        await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaces![1].Id, Date = date });

        var response = await client.GetAsync("/api/reservations/my");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var reservations = await response.Content.ReadFromJsonAsync<List<ReservationResponse>>(AuthHelper.JsonOptions);
        Assert.NotNull(reservations);
        Assert.NotEmpty(reservations);
        Assert.All(reservations, r => Assert.Equal("Active", r.Status));
    }

    [Fact]
    public async Task Create_SameWorkplaceSameDay_ReturnsBadRequest()
    {
        // Two different users try to reserve the same workplace on the same day
        var email1 = $"{Guid.NewGuid():N}@test.com";
        var email2 = $"{Guid.NewGuid():N}@test.com";
        var token1 = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email1);
        var token2 = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email2);

        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, token1);
        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);
        var workplaceId = workplaces![2].Id;
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(4);

        await client.PostAsJsonAsync("/api/reservations", new { WorkplaceId = workplaceId, Date = date });

        var client2 = factory.CreateClient();
        AuthHelper.SetBearerToken(client2, token2);
        var response = await client2.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_SameEmployeeSameDay_ReturnsBadRequest()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var token = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);
        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, token);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);
        var date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(5);

        // First reservation succeeds
        await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaces![3].Id, Date = date });

        // Same employee, different workplace, same day
        var response = await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaces[4].Id, Date = date });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Cancel_OwnReservation_Returns204()
    {
        var (client, workplaceId, date) = await SetupUserWithWorkplaceAsync(daysOffset: 6);

        var createResponse = await client.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });
        var created = await createResponse.Content.ReadFromJsonAsync<CreatedReservationResponse>(AuthHelper.JsonOptions);

        var response = await client.DeleteAsync($"/api/reservations/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Cancel_AnotherUsersReservation_ReturnsBadRequest()
    {
        // User 1 creates a reservation
        var (client1, workplaceId, date) = await SetupUserWithWorkplaceAsync(daysOffset: 8);
        var createResponse = await client1.PostAsJsonAsync("/api/reservations",
            new { WorkplaceId = workplaceId, Date = date });
        var created = await createResponse.Content.ReadFromJsonAsync<CreatedReservationResponse>(AuthHelper.JsonOptions);

        // User 2 tries to cancel it
        var email2 = $"{Guid.NewGuid():N}@test.com";
        var token2 = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email2);
        var client2 = factory.CreateClient();
        AuthHelper.SetBearerToken(client2, token2);

        var response = await client2.DeleteAsync($"/api/reservations/{created!.Id}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // Helper: creates a fresh approved user and returns their authenticated client,
    // the first available workplace ID, and a future date unique to the test.
    private async Task<(HttpClient client, Guid workplaceId, DateOnly date)> SetupUserWithWorkplaceAsync(int daysOffset)
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var token = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);

        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, token);

        var workplaces = await client.GetFromJsonAsync<List<WorkplaceResponse>>(
            "/api/workplaces", AuthHelper.JsonOptions);

        return (client, workplaces![0].Id, DateOnly.FromDateTime(DateTime.UtcNow).AddDays(daysOffset));
    }
}
