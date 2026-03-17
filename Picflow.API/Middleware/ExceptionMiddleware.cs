using System.Net;
using System.Text.Json;
using Picflow.Core.Exceptions;

namespace Picflow.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errores) = exception switch
        {
            NotFoundException e => (HttpStatusCode.NotFound, e.Message, (List<string>?)null),
            ValidationException e => (HttpStatusCode.BadRequest, e.Message, e.Errores),
            UnauthorizedException e => (HttpStatusCode.Unauthorized, e.Message, null),
            ConflictException e => (HttpStatusCode.Conflict, e.Message, null),
            _ => (HttpStatusCode.InternalServerError, "Ocurrió un error interno.", null)
        };

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = (int)statusCode,
            message,
            errores,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
