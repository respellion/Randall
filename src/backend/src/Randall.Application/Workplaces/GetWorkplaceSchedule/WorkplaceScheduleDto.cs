namespace Randall.Application.Workplaces.GetWorkplaceSchedule;

public record WorkplaceScheduleDto(
    Guid Id,
    string Name,
    string Location,
    bool IsAvailable,
    string? ReservedBy);
