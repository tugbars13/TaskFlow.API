namespace TaskFlow.API.Configurations;

// JWT ayarlarını temsil eden sınıf.
public class JwtSettings
{
    // Token imzalamak için kullanılan gizli anahtar.
    public string SecretKey { get; set; } = string.Empty;

    // Token'ı oluşturan uygulama.
    public string Issuer { get; set; } = string.Empty;

    // Token'ı kullanacak uygulama.
    public string Audience { get; set; } = string.Empty;

    // Token'ın geçerlilik süresi (dakika).
    public int ExpirationMinutes { get; set; }
}