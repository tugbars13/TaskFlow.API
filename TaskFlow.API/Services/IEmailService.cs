using System.Threading.Tasks;

namespace TaskFlow.API.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}
