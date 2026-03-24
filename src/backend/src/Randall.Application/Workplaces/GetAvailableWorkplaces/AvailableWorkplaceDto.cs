namespace Randall.Application.Workplaces.GetAvailableWorkplaces;

public record AvailableWorkplaceDto(
    Guid Id,
    string Name,
    string Location);
