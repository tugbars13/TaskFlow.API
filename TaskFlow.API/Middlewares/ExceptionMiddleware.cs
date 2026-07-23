using System.Net;
using System.Text.Json;
using TaskFlow.API.Responses;

namespace TaskFlow.API.Middlewares;

// Uygulamadaki tüm beklenmeyen hataları yakalar.
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next; // Bir sonraki middleware'e geçiş sağlar.

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // Her HTTP isteğinde çalışan metod.
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // İstek zincirinde devam et.
            await _next(context);
        }
        catch (Exception ex)
        {
            // Hata olursa burada yakalanır.
            await HandleExceptionAsync(context, ex);
        }
    }

    // Kullanıcıya standart hata cevabı döndürür.
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ApiResponse<string>
        {
            Success = false,
            Message = "Beklenmeyen bir hata oluştu.",
            Data = null
        };

        var json = JsonSerializer.Serialize(response);

        return context.Response.WriteAsync(json);
    }
}