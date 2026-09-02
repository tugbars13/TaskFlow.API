using FluentValidation;
using TaskFlow.API.DTOs.Team;

namespace TaskFlow.API.Validators
{
    public class CreateTeamDtoValidator : AbstractValidator<CreateTeamDto>
    {
        public CreateTeamDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Takım adı boş olamaz.")
                .MaximumLength(100).WithMessage("Takım adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir.");
        }
    }
}
