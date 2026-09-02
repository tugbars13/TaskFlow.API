using FluentValidation;
using TaskFlow.API.DTOs.Category;

namespace TaskFlow.API.Validators
{
    public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Kategori adı boş olamaz.")
                .MaximumLength(50).WithMessage("Kategori adı 50 karakterden uzun olamaz.");
        }
    }
}
