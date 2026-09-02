using FluentValidation;
using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Validators
{
    public class UpdateMySpacePageDtoValidator : AbstractValidator<UpdateMySpacePageDto>
    {
        public UpdateMySpacePageDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Sayfa başlığı boş olamaz.")
                .MaximumLength(150).WithMessage("Sayfa başlığı 150 karakterden uzun olamaz.");

            RuleFor(x => x.Icon)
                .MaximumLength(50).WithMessage("İkon adı 50 karakterden uzun olamaz.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Açıklama 500 karakterden uzun olamaz.");
        }
    }
}
