using Mashroo3i.Data;
using Microsoft.EntityFrameworkCore;

namespace Mashroo3i.Services;

public class EvaluationBackgroundRunner
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EvaluationBackgroundRunner> _logger;

    public EvaluationBackgroundRunner(
        IServiceScopeFactory scopeFactory,
        ILogger<EvaluationBackgroundRunner> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public void Start(Guid ideaId, Guid userId)
    {
        _ = Task.Run(() => EvaluateAndRefundOnFailureAsync(ideaId, userId));
    }

    private async Task EvaluateAndRefundOnFailureAsync(Guid ideaId, Guid userId)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var evaluationService = scope.ServiceProvider.GetRequiredService<EvaluationService>();

        try
        {
            await evaluationService.EvaluateAsync(ideaId);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Background evaluation failed for idea {IdeaId}; refunding one credit",
                ideaId);

            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Users
                .Where(user => user.Id == userId)
                .ExecuteUpdateAsync(update =>
                    update.SetProperty(
                        user => user.EvaluationCredits,
                        user => user.EvaluationCredits + 1));
        }
    }
}
