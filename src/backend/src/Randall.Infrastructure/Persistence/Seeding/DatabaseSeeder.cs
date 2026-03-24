using Microsoft.EntityFrameworkCore;
using Randall.Application.Common;
using Randall.Domain.Users;
using Randall.Domain.Workplaces;

namespace Randall.Infrastructure.Persistence.Seeding;

public static class DatabaseSeeder
{
    private static readonly (string Name, string Location)[] ExpectedWorkplaces =
    [
        ("D13", "Pod A"), ("D14", "Pod A"), ("D15", "Pod A"), ("D16", "Pod A"),
        ("D9",  "Pod A"), ("D10", "Pod A"), ("D11", "Pod A"), ("D12", "Pod A"),
        ("D5",  "Pod B"), ("D6",  "Pod B"), ("D7",  "Pod B"), ("D8",  "Pod B"),
        ("D1",  "Pod B"), ("D2",  "Pod B"), ("D3",  "Pod B"), ("D4",  "Pod B"),
    ];

    private const string AdminEmail = "admin@randall.local";
    private const string AdminPassword = "Admin@123";

    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.MigrateAsync();

        // Seed workplaces
        var existing = await context.Workplaces.ToListAsync();
        var expectedSet = ExpectedWorkplaces.Select(w => w.Name + w.Location).ToHashSet();
        var existingSet = existing.Select(w => w.Name + w.Location).ToHashSet();

        if (!expectedSet.SetEquals(existingSet))
        {
            context.Workplaces.RemoveRange(existing);
            await context.SaveChangesAsync();

            var workplaces = ExpectedWorkplaces.Select(w => new Workplace(w.Name, w.Location));
            context.Workplaces.AddRange(workplaces);
            await context.SaveChangesAsync();
        }

        // Seed admin user
        var adminExists = await context.Users.AnyAsync(u => u.Email == AdminEmail);
        if (!adminExists)
        {
            var hash = passwordHasher.Hash(AdminPassword);
            var admin = User.Create(AdminEmail, "Admin", hash, isAdmin: true).Value!;
            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
