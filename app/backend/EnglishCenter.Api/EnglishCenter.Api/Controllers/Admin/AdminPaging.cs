namespace EnglishCenter.Api.Controllers.Admin;

internal static class AdminPaging
{
    internal static IQueryable<T> SlicePage<T>(this IQueryable<T> query, int page, int pageSize, int total)
    {
        var skip = ((long)page - 1) * pageSize;
        return skip >= total ? query.Take(0) : query.Skip((int)skip).Take(pageSize);
    }
}
