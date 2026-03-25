using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Randall.Api.IntegrationTests.Helpers;

// Local response DTOs — mirror the API's shape without coupling to production types
public record LoginResponse(string Token, string Name, string Email, bool IsAdmin);
public record RegisterResponse(string Message);
public record PendingUserResponse(Guid Id, string Name, string Email);
public record AdminUserResponse(Guid Id, string Name, string Email, bool IsApproved, bool IsAdmin);
public record WorkplaceResponse(Guid Id, string Name, string Location);
public record WorkplaceScheduleResponse(Guid Id, string Name, string Location, bool IsAvailable, string? ReservedBy);
public record CreatedReservationResponse(Guid Id, Guid WorkplaceId, string EmployeeName, string Date);
public record ReservationResponse(Guid Id, Guid WorkplaceId, string WorkplaceName, string WorkplaceLocation, string Date, string Status, DateTime CreatedAt);
public record ReservationDetailResponse(Guid Id, Guid WorkplaceId, string WorkplaceName, string WorkplaceLocation, string EmployeeName, string EmployeeEmail, string Date, string Status, DateTime CreatedAt);

public static class AuthHelper
{
    public const string AdminEmail = "admin@randall.local";
    public const string AdminPassword = "Admin@123";

    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task<LoginResponse> LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { Email = email, Password = password });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<LoginResponse>(JsonOptions))!;
    }

    public static Task<LoginResponse> LoginAsAdminAsync(HttpClient client) =>
        LoginAsync(client, AdminEmail, AdminPassword);

    public static void SetBearerToken(HttpClient client, string token) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    /// <summary>
    /// Registers a new user, approves them via the admin account, and returns their JWT token.
    /// </summary>
    public static async Task<string> CreateApprovedUserAndLoginAsync(
        CustomWebApplicationFactory factory,
        string email,
        string password = "Test@1234",
        string name = "Test User")
    {
        var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/auth/register", new { Email = email, Password = password, Name = name });

        var adminClient = factory.CreateClient();
        var adminLogin = await LoginAsAdminAsync(adminClient);
        SetBearerToken(adminClient, adminLogin.Token);

        var pending = await adminClient.GetFromJsonAsync<List<PendingUserResponse>>(
            "/api/admin/users/pending", JsonOptions);
        var user = pending!.First(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        await adminClient.PostAsync($"/api/admin/users/{user.Id}/approve", null);

        var loginClient = factory.CreateClient();
        var login = await LoginAsync(loginClient, email, password);
        return login.Token;
    }
}
