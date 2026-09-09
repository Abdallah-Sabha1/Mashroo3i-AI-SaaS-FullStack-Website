using System.ComponentModel.DataAnnotations;
using Mashroo3i.DTOs.Auth;
using Xunit;

namespace Mashroo3i.Tests.DTOs;

public class RegisterDtoTests
{
    [Fact]
    public void Validate_WithStrongPassword_HasNoValidationErrors()
    {
        var dto = CreateValidDto();

        var errors = Validate(dto);

        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_WithWeakPassword_ReturnsPasswordError()
    {
        var dto = CreateValidDto();
        dto.Password = "password";

        var errors = Validate(dto);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(RegisterDto.Password)));
    }

    [Fact]
    public void Validate_WithInvalidEmail_ReturnsEmailError()
    {
        var dto = CreateValidDto();
        dto.Email = "not-an-email";

        var errors = Validate(dto);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(RegisterDto.Email)));
    }

    private static RegisterDto CreateValidDto() => new()
    {
        FullName = "Demo Entrepreneur",
        Email = "demo@example.com",
        Password = "Demo@1234",
        Education = "Computer Science",
        Experience = "Fresh graduate",
        BusinessInterest = "Technology"
    };

    private static List<ValidationResult> Validate(RegisterDto dto)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);
        return results;
    }
}
