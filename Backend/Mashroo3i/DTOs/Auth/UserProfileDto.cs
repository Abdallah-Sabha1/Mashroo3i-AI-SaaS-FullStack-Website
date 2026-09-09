namespace Mashroo3i.DTOs.Auth;

public class UserProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Education { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public string BusinessInterest { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
