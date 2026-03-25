using System.Net;
using System.Net.Http.Json;
using Randall.Api.IntegrationTests.Helpers;

namespace Randall.Api.IntegrationTests.Admin;

public class AdminTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task GetAllUsers_WithoutAuth_Returns401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/admin/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAllUsers_WithNonAdmin_Returns403()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var token = await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);

        var client = factory.CreateClient();
        AuthHelper.SetBearerToken(client, token);

        var response = await client.GetAsync("/api/admin/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAllUsers_WithAdmin_ReturnsUserList()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var users = await client.GetFromJsonAsync<List<AdminUserResponse>>(
            "/api/admin/users", AuthHelper.JsonOptions);

        Assert.NotNull(users);
        Assert.Contains(users, u => u.Email == AuthHelper.AdminEmail && u.IsAdmin);
    }

    [Fact]
    public async Task GetPendingUsers_ShowsNewlyRegisteredUser()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var registerClient = factory.CreateClient();
        await registerClient.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "Pending User" });

        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var pending = await client.GetFromJsonAsync<List<PendingUserResponse>>(
            "/api/admin/users/pending", AuthHelper.JsonOptions);

        Assert.NotNull(pending);
        Assert.Contains(pending, u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task ApproveUser_AllowsSubsequentLogin()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        var registerClient = factory.CreateClient();
        await registerClient.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "Pending User" });

        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var pending = await client.GetFromJsonAsync<List<PendingUserResponse>>(
            "/api/admin/users/pending", AuthHelper.JsonOptions);
        var userId = pending!.First(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)).Id;

        var approveResponse = await client.PostAsync($"/api/admin/users/{userId}/approve", null);
        Assert.Equal(HttpStatusCode.NoContent, approveResponse.StatusCode);

        // User can now login
        var loginClient = factory.CreateClient();
        var login = await AuthHelper.LoginAsync(loginClient, email, "Test@1234");
        Assert.NotEmpty(login.Token);
    }

    [Fact]
    public async Task MakeAdmin_ElevatesUserToAdmin()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);

        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var users = await client.GetFromJsonAsync<List<AdminUserResponse>>(
            "/api/admin/users", AuthHelper.JsonOptions);
        var userId = users!.First(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)).Id;

        var response = await client.PostAsync($"/api/admin/users/{userId}/make-admin", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify the user is now admin
        var updated = await client.GetFromJsonAsync<List<AdminUserResponse>>(
            "/api/admin/users", AuthHelper.JsonOptions);
        Assert.True(updated!.First(u => u.Id == userId).IsAdmin);
    }

    [Fact]
    public async Task DeleteUser_NonAdminUser_Returns204()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);

        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var users = await client.GetFromJsonAsync<List<AdminUserResponse>>(
            "/api/admin/users", AuthHelper.JsonOptions);
        var userId = users!.First(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)).Id;

        var response = await client.DeleteAsync($"/api/admin/users/{userId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_Self_ReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var adminLogin = await AuthHelper.LoginAsAdminAsync(client);
        AuthHelper.SetBearerToken(client, adminLogin.Token);

        var users = await client.GetFromJsonAsync<List<AdminUserResponse>>(
            "/api/admin/users", AuthHelper.JsonOptions);
        var adminId = users!.First(u => u.Email == AuthHelper.AdminEmail).Id;

        var response = await client.DeleteAsync($"/api/admin/users/{adminId}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
