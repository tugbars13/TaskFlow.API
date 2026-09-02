using FluentValidation;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Validators
{
    public class CreateTeamMemberDtoValidator : AbstractValidator<CreateTeamMemberDto>
    {
        public CreateTeamMemberDtoValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("Geçerli bir kullanıcı ID giriniz.");

            RuleFor(x => x.TeamId)
                .GreaterThan(0).WithMessage("Geçerli bir takım ID giriniz.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Rol boş olamaz.")
                .MaximumLength(50).WithMessage("Rol 50 karakterden uzun olamaz.");

            RuleFor(x => x.Department)
                .MaximumLength(100).WithMessage("Departman 100 karakterden uzun olamaz.");

            RuleFor(x => x.Status)
                .MaximumLength(50).WithMessage("Durum 50 karakterden uzun olamaz.");
        }
    }
}
