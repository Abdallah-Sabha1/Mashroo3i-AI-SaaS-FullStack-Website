using Mashroo3i.Data;
using Mashroo3i.DTOs.Auth;
using Mashroo3i.Interfaces;
using Mashroo3i.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IJwtTokenService _jwt;

        public AuthController(AppDbContext db, IJwtTokenService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
                return BadRequest(new { message = "Email already in use." });

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Education = dto.Education!,
                Experience = dto.Experience!,
                BusinessInterest = dto.BusinessInterest!,
                Role = "Entrepreneur"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials." });

            if (!user.IsActive)
                return Unauthorized(new { message = "Account is disabled." });

            var token = _jwt.GenerateAccessToken(user);

            return Ok(new AuthResponseDto
            {
                AccessToken = token,
                Role = user.Role,
                FullName = user.FullName,
            });
        }

        // GET /api/auth/me  — returns the full profile of the currently logged-in user
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(claim, out var userId))
                return Unauthorized();

            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            return Ok(new
            {
                user.FullName,
                user.Email,
                user.Role,
                user.Education,
                user.Experience,
                user.BusinessInterest,
                user.CreatedAt,
            });
        }
    }
}