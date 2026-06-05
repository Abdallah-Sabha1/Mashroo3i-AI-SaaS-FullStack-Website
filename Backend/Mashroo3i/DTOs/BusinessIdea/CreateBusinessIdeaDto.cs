using System.ComponentModel.DataAnnotations;

namespace Mashroo3i.DTOs.BusinessIdea
{
    public class CreateBusinessIdeaDto
    {
        [Required, MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(20), MaxLength(800)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Sector { get; set; } = "other";

        [Required, Range(1, double.MaxValue)]
        public decimal EstimatedBudget { get; set; }
    }
}