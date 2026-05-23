namespace Mashroo3i.DTOs.Auth
{ 
public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
}