namespace Mashroo3i.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Entrepreneur";
        public string Education { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public string BusinessInterest { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Number of AI evaluations the user has purchased and not yet used.
        /// Incremented by PaymentController.Purchase, decremented by EvaluationController.Start.
        /// </summary>
        public int EvaluationCredits { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}