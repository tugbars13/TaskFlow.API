using FluentValidation;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Validators
{
    public class UpdateTeamMemberDtoValidator : AbstractValidator<UpdateTeamMemberDto>
    {
        public UpdateTeamMemberDtoValidator()
        {
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
