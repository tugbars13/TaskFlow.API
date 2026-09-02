using FluentValidation;
using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Validators
{
    public class CreateMySpacePageDtoValidator : AbstractValidator<CreateMySpacePageDto>
    {
        public CreateMySpacePageDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Sayfa başlığı boş olamaz.")
                .MaximumLength(200).WithMessage("Sayfa başlığı 200 karakterden uzun olamaz.");

            RuleFor(x => x.Icon)
                .MaximumLength(50).WithMessage("İkon adı 50 karakterden uzun olamaz.");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Açıklama 500 karakterden uzun olamaz.");

            RuleFor(x => x.Content)
                .MaximumLength(500000).WithMessage("İçerik çok uzun."); // ~500KB limit
        }
    }
}
