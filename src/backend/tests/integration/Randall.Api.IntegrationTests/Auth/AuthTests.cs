using System.Net;
using System.Net.Http.Json;
using Randall.Api.IntegrationTests.Helpers;

namespace Randall.Api.IntegrationTests.Auth;

public class AuthTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Register_WithValidData_ReturnsOk()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Email = $"{Guid.NewGuid():N}@test.com", Password = "Test@1234", Name = "New User" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<RegisterResponse>(AuthHelper.JsonOptions);
        Assert.NotNull(body?.Message);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "First" });

        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "Second" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsBadRequest()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Email = "nobody@test.com", Password = "Test@1234" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsBadRequest()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "Test User" });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Email = email, Password = "WrongPassword" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithUnapprovedUser_ReturnsBadRequest()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { Email = email, Password = "Test@1234", Name = "Test User" });

        // Attempt login without approval
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { Email = email, Password = "Test@1234" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_AsAdmin_ReturnsTokenWithAdminFlag()
    {
        var response = await AuthHelper.LoginAsAdminAsync(_client);

        Assert.NotEmpty(response.Token);
        Assert.True(response.IsAdmin);
        Assert.Equal(AuthHelper.AdminEmail, response.Email);
    }

    [Fact]
    public async Task Login_AsApprovedNonAdminUser_ReturnsTokenWithoutAdminFlag()
    {
        var email = $"{Guid.NewGuid():N}@test.com";
        await AuthHelper.CreateApprovedUserAndLoginAsync(factory, email);

        var login = await AuthHelper.LoginAsync(_client, email, "Test@1234");

        Assert.NotEmpty(login.Token);
        Assert.False(login.IsAdmin);
    }
}
