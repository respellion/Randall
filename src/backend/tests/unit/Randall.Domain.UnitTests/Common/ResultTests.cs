using Randall.Domain.Common;

namespace Randall.Domain.UnitTests.Common;

public class ResultTests
{
    [Fact]
    public void Success_IsSuccessIsTrue()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.Null(result.Error);
    }

    [Fact]
    public void Failure_IsSuccessIsFalse()
    {
        var result = Result.Failure("Something went wrong");

        Assert.False(result.IsSuccess);
        Assert.Equal("Something went wrong", result.Error);
    }

    [Fact]
    public void SuccessOfT_ContainsValue()
    {
        var result = Result.Success(42);

        Assert.True(result.IsSuccess);
        Assert.Equal(42, result.Value);
        Assert.Null(result.Error);
    }

    [Fact]
    public void FailureOfT_ValueIsDefault()
    {
        var result = Result.Failure<int>("error");

        Assert.False(result.IsSuccess);
        Assert.Equal(default, result.Value);
        Assert.Equal("error", result.Error);
    }

    [Fact]
    public void FailureOfT_ReferenceType_ValueIsNull()
    {
        var result = Result.Failure<string>("error");

        Assert.False(result.IsSuccess);
        Assert.Null(result.Value);
    }
}
