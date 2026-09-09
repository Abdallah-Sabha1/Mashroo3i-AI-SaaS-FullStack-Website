using Mashroo3i.Data;
using Mashroo3i.DTOs.BusinessIdea;
using Mashroo3i.Models;
using Mashroo3i.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessIdeaController : ControllerBase
    {
        private readonly BusinessIdeaService _service;
        public BusinessIdeaController(BusinessIdeaService service)
        {
            _service = service;
        }

        // POST /api/business-idea
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBusinessIdeaDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _service.CreateAsync(dto, userId.Value);

            return CreatedAtAction(nameof(GetById), new { id = idea.IdeaId }, new BusinessIdeaCreatedDto
            {
                IdeaId = idea.IdeaId,
                Title = idea.Title,
                Status = idea.Status
            });
        }

        // GET /api/business-idea
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var ideas = await _service.GetAllAsync(userId.Value);

            return Ok(ideas);
        }

        // GET /api/business-idea/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _service.GetByIdAsync(id, userId.Value);

            if (idea == null) return NotFound();

            return Ok(idea);
        }

        // DELETE /api/business-idea/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var result = await _service.DeleteAsync(id, userId.Value);

            if (result == BusinessIdeaDeleteResult.NotFound)
                return NotFound(new { message = "Idea not found." });

            if (result == BusinessIdeaDeleteResult.Analyzing)
                return Conflict(new { message = "Cannot delete an idea while it is being analyzed. Wait for evaluation to finish." });

            return NoContent(); // 204
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}
