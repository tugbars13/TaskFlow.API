using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskFlow.API.Configurations;
using TaskFlow.API.Models;


namespace TaskFlow.API.Services;

public class TokenService : ITokenService

{
    private readonly JwtSettings _jwtSettings; // JWT ayarlarını tutar.

    public TokenService(IOptions<JwtSettings> jwtOptions)
    {
        _jwtSettings = jwtOptions.Value; // appsettings.json'dan okur.
    }

    public string CreateToken(User user)
    {
        // Token içine eklenecek kullanıcı bilgileri.
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),

            new Claim(ClaimTypes.Name, user.FullName),

            new Claim(ClaimTypes.Email, user.Email),

            // Kullanıcının rolünü JWT içine ekle.
            new Claim(ClaimTypes.Role, user.Role)
        };

        // SecretKey'i byte dizisine dönüştür.
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)
        );

        // İmzalama bilgileri.
        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        // JWT nesnesini oluştur.
        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        // JWT'yi string olarak döndür.
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}