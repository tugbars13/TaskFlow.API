using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.DTOs;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers;

[ApiController] // Bu sınıfın bir API Controller olduğunu belirtir.
[Route("api/[controller]")] // URL: /api/auth
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService; // İş mantığını Service katmanına devreder.

    // Dependency Injection ile AuthService'i alıyoruz.
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Kullanıcı kaydı yap ve token al.
        var token = await _authService.RegisterAsync(dto);

        // Email zaten kayıtlıysa.
        if (token == null)
            return BadRequest("Bu email zaten kayıtlı.");

        // Başarılıysa JWT döndür.
        return Ok(new
        {
            Token = token
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // Service katmanına gönderiyoruz.
        var token = await _authService.LoginAsync(dto);

        // Kullanıcı bulunamadıysa veya şifre yanlışsa.
        if (token == null)
            return Unauthorized("Email veya şifre yanlış.");

        // Başarılı giriş.
        return Ok(new
        {
            Token = token
        });
    }
}