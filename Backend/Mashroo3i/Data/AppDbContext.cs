using Mashroo3i.Models;
using Microsoft.EntityFrameworkCore;

namespace Mashroo3i.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<BusinessIdea> BusinessIdeas => Set<BusinessIdea>();
        public DbSet<EvaluationScores> EvaluationScores => Set<EvaluationScores>();
        public DbSet<SwotAnalysis> SwotAnalyses => Set<SwotAnalysis>();
        public DbSet<MarketAnalysis> MarketAnalyses => Set<MarketAnalysis>();
        public DbSet<FinancialProjection> FinancialPlans => Set<FinancialProjection>();
        public DbSet<Payment> Payments => Set<Payment>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.Property(u => u.Id).HasColumnName("Id");
                e.HasIndex(u => u.Email).IsUnique();
                e.Property(u => u.Email).IsRequired().HasMaxLength(255);
                e.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                e.Property(u => u.Role).HasDefaultValue("Entrepreneur");
                e.Property(u => u.EvaluationCredits).HasDefaultValue(0);
            });

            builder.Entity<BusinessIdea>(e =>
            {
                e.HasKey(b => b.IdeaId);
                e.HasOne(b => b.User)
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.Property(b => b.EstimatedBudget).HasColumnType("decimal(18,2)");
                e.Property(b => b.Status).HasDefaultValue("submitted");
            });

            builder.Entity<EvaluationScores>(e =>
            {
                e.HasKey(ev => ev.Id);
                e.HasOne(ev => ev.BusinessIdea)
                    .WithOne(b => b.EvaluationScores)
                    .HasForeignKey<EvaluationScores>(ev => ev.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(ev => ev.IdeaId).IsUnique();
            });

            builder.Entity<SwotAnalysis>(e =>
            {
                e.HasKey(s => s.Id);
                e.HasOne(s => s.BusinessIdea)
                    .WithOne(b => b.SwotAnalysis)
                    .HasForeignKey<SwotAnalysis>(s => s.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(s => s.IdeaId).IsUnique();
            });

            builder.Entity<MarketAnalysis>(e =>
            {
                e.HasKey(m => m.Id);
                e.HasOne(m => m.BusinessIdea)
                    .WithOne(b => b.MarketAnalysis)
                    .HasForeignKey<MarketAnalysis>(m => m.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(m => m.IdeaId).IsUnique();
            });

            builder.Entity<FinancialProjection>(e =>
            {
                e.HasKey(f => f.PlanId);
                e.HasOne(f => f.BusinessIdea)
                    .WithOne(b => b.FinancialPlan)
                    .HasForeignKey<FinancialProjection>(f => f.IdeaId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.Property(f => f.InitialInvestment).HasColumnType("decimal(18,2)");
                e.Property(f => f.MonthlyRevenue).HasColumnType("decimal(18,2)");
                e.Property(f => f.MonthlyCosts).HasColumnType("decimal(18,2)");
                e.Property(f => f.MonthlyProfit).HasColumnType("decimal(18,2)");
                e.Property(f => f.RoiPercentage).HasColumnType("decimal(18,2)");
                e.Property(f => f.GrossMarginPct).HasColumnType("decimal(18,2)");
                e.Property(f => f.BreakEvenUnits).HasColumnType("decimal(18,2)");
            });

            builder.Entity<Payment>(e =>
            {
                e.HasKey(p => p.Id);
                e.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                e.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                e.Property(p => p.Status).HasConversion<int>();
                e.Property(p => p.Currency).HasMaxLength(3);
                e.Property(p => p.Provider).HasMaxLength(50);
                e.Property(p => p.TransactionRef).HasMaxLength(100);
            });
        }
    }
}