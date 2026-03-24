using Microsoft.EntityFrameworkCore;
using Randall.Domain.Reservations;
using Randall.Domain.Users;
using Randall.Domain.Workplaces;

namespace Randall.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Workplace> Workplaces => Set<Workplace>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Workplace>(entity =>
        {
            entity.HasKey(w => w.Id);
            entity.Property(w => w.Name).IsRequired().HasMaxLength(100);
            entity.Property(w => w.Location).IsRequired().HasMaxLength(200);
            entity.Property(w => w.IsActive).IsRequired();
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.WorkplaceId).IsRequired();
            entity.Property(r => r.EmployeeEmail).IsRequired().HasMaxLength(200);
            entity.Property(r => r.EmployeeName).IsRequired().HasMaxLength(200);
            entity.Property(r => r.Date).IsRequired();
            entity.Property(r => r.Status).IsRequired();
            entity.Property(r => r.CreatedAt).IsRequired();

            entity.HasIndex(r => new { r.WorkplaceId, r.Date });
            entity.HasIndex(r => new { r.EmployeeEmail, r.Date });
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(200);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.IsApproved).IsRequired();
            entity.Property(u => u.IsAdmin).IsRequired();
            entity.HasIndex(u => u.Email).IsUnique();
        });
    }
}
