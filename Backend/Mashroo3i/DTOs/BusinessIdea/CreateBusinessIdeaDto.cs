using System.ComponentModel.DataAnnotations;

namespace Mashroo3i.DTOs.BusinessIdea
{
    public class CreateBusinessIdeaDto
    {
        [Required, MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(20), MaxLength(800)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(400)]
        public string? ProblemStatement { get; set; }

        [MaxLength(200)]
        public string? TargetAudience { get; set; }

        [MaxLength(300)]
        public string? Usp { get; set; }

        [Required]
        public string BusinessType { get; set; } = "B2C";

        [Required]
        public string Sector { get; set; } = "other";

        [MaxLength(300)]
        public string? BusinessTypeReason { get; set; }

        [Required, Range(1, double.MaxValue)]
        public decimal EstimatedBudget { get; set; }
    }
}
