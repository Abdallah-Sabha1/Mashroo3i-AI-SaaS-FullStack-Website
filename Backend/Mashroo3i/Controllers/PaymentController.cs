using Mashroo3i.Data;
using Mashroo3i.DTOs.Subscription;
using Mashroo3i.Enums;
using Mashroo3i.Models;
using Mashroo3i.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/payment")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IFakePaymentProvider _paymentProvider;

        public PaymentController(AppDbContext db, IFakePaymentProvider paymentProvider)
        {
            _db = db;
            _paymentProvider = paymentProvider;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ─────────────────────────────────────────────────────────────────
        // Credit packs available for purchase
        // ─────────────────────────────────────────────────────────────────
        private static readonly Dictionary<string, (int Credits, decimal Price)> Packs = new()
        {
            { "starter", (1, 3.00m)  },
            { "value",   (3, 8.00m)  },
            { "builder", (5, 12.00m) },
        };

        // ─────────────────────────────────────────────────────────────────
        // POST /api/payment/purchase
        // Body: { pack: "starter|value|builder", cardNumber, expiry, cvv }
        // Charges the user and adds evaluation credits to their account.
        // ─────────────────────────────────────────────────────────────────
        [HttpPost("purchase")]
        public async Task<IActionResult> Purchase([FromBody] PurchaseCreditsDto dto)
        {
            var userId = GetUserId();

            // Validate pack
            var packKey = dto.Pack?.ToLowerInvariant();
            if (packKey == null || !Packs.TryGetValue(packKey, out var pack))
                return BadRequest(new { message = "Invalid pack. Choose: starter, value, or builder." });

            // Charge via fake gateway
            var paymentResult = _paymentProvider.Charge(dto.CardNumber, pack.Price, "JOD");

            // Always record the payment attempt
            var payment = new Payment
            {
                UserId = userId,
                Amount = pack.Price,
                Currency = "JOD",
                Status = paymentResult.Status,
                TransactionRef = paymentResult.TransactionRef,
            };
            _db.Payments.Add(payment);

            if (paymentResult.Status == PaymentStatus.Failed)
            {
                await _db.SaveChangesAsync();
                return BadRequest(new { message = paymentResult.ErrorMessage ?? "Payment failed. Please check your card details." });
            }

            // Add credits to user
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.EvaluationCredits += pack.Credits;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = $"{pack.Credits} evaluation credit{(pack.Credits > 1 ? "s" : "")} added to your account.",
                creditsAdded = pack.Credits,
                totalCredits = user.EvaluationCredits,
                transactionRef = paymentResult.TransactionRef,
            });
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/payment/credits
        // Returns the current user's remaining evaluation credits.
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("credits")]
        public async Task<IActionResult> GetCredits()
        {
            var userId = GetUserId();
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new { credits = user.EvaluationCredits });
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/payment/history
        // Returns all payments for the current user, newest first.
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var userId = GetUserId();

            var payments = await _db.Payments
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    Provider = p.Provider,
                    Status = p.Status.ToString(),
                    TransactionRef = p.TransactionRef,
                    CreatedAt = p.CreatedAt,
                })
                .ToListAsync();

            return Ok(payments);
        }
    }

    // ── Request DTO ───────────────────────────────────────────────────────────
    public class PurchaseCreditsDto
    {
        public string Pack { get; set; } = string.Empty;  // starter | value | builder
        public string CardNumber { get; set; } = string.Empty;
        public string Expiry { get; set; } = string.Empty;
        public string Cvv { get; set; } = string.Empty;
    }
}