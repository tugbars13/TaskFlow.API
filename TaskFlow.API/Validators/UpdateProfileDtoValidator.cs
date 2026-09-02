using FluentValidation;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Validators
{
    public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
    {
        public UpdateProfileDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Ad Soyad boş olamaz.")
                .MaximumLength(100).WithMessage("Ad Soyad 100 karakterden uzun olamaz.");

            RuleFor(x => x.DisplayName)
                .MaximumLength(50).WithMessage("Görünür ad 50 karakterden uzun olamaz.");

            RuleFor(x => x.Bio)
                .MaximumLength(500).WithMessage("Biyografi 500 karakterden uzun olamaz.");
        }
    }
}
