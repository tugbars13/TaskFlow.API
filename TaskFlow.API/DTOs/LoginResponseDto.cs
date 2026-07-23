namespace TaskFlow.API.DTOs;

// Login başarılı olduğunda dönecek cevap
public class LoginResponseDto
{
    // JWT Token
    public string Token { get; set; } = string.Empty;

    // Kullanıcının adı
    public string Name { get; set; } = string.Empty;

    // Email
    public string Email { get; set; } = string.Empty;
}