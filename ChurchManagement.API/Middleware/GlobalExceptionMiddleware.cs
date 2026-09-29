using System.Net;
using System.Text.Json;

namespace ChurchManagement.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(
                ex,
                "Validation error occurred.");

            await WriteErrorAsync(
                context,
                HttpStatusCode.BadRequest,
                "Invalid request.",
                ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(
                ex,
                "Requested resource was not found.");

            await WriteErrorAsync(
                context,
                HttpStatusCode.NotFound,
                "Resource not found.",
                ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                ex,
                "Unauthorized operation attempted.");

            await WriteErrorAsync(
                context,
                HttpStatusCode.Forbidden,
                "Access denied.",
                "You do not have permission to perform this action.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unhandled exception occurred.");

            await WriteErrorAsync(
                context,
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.",
                "Please try again later.");
        }
    }

    private static async Task WriteErrorAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message,
        string detail)
    {
        if (context.Response.HasStarted)
            return;

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            statusCode = (int)statusCode,
            message,
            detail,
            timestamp = DateTime.UtcNow,
            path = context.Request.Path.Value
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response));
    }
}