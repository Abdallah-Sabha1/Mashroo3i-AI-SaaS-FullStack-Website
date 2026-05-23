using Mashroo3i.Models;

namespace Mashroo3i.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateAccessToken(User user);
    }
}