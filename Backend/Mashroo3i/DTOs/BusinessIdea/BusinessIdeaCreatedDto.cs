namespace Mashroo3i.DTOs.BusinessIdea
{
    public class BusinessIdeaCreatedDto
    {
        public Guid IdeaId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
