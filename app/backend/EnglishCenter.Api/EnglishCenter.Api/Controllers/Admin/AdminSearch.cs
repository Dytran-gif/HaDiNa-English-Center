using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Api.Controllers.Admin;

internal static class AdminSearch
{
    // Build the SQL expression before Where; do not invoke a C# helper inside the query.
    internal static IQueryable<T> WhereContains<T>(this IQueryable<T> query, string? search,
        params Expression<Func<T, string>>[] fields)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var parameter = Expression.Parameter(typeof(T), "item");
        Expression? predicate = null;
        foreach (var field in fields)
        {
            var value = new ReplaceParameter(field.Parameters[0], parameter).Visit(field.Body)!;
            var collated = Expression.Call(typeof(RelationalDbFunctionsExtensions),
                nameof(RelationalDbFunctionsExtensions.Collate), new[] { typeof(string) },
                Expression.Property(null, typeof(EF), nameof(EF.Functions)), value,
                Expression.Constant("Vietnamese_CI_AI"));
            var contains = Expression.Call(collated, nameof(string.Contains), Type.EmptyTypes,
                Expression.Constant(search.Trim()));
            predicate = predicate == null ? contains : Expression.OrElse(predicate, contains);
        }

        return predicate == null ? query : query.Where(Expression.Lambda<Func<T, bool>>(predicate, parameter));
    }

    private sealed class ReplaceParameter(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == source ? target : node;
    }
}
