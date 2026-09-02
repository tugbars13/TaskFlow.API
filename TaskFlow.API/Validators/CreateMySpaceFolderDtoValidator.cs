using FluentValidation;
using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Validators
{
    public class CreateMySpaceFolderDtoValidator : AbstractValidator<CreateMySpaceFolderDto>
    {
        public CreateMySpaceFolderDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Klasör adı boş olamaz.")
                .MaximumLength(100).WithMessage("Klasör adı 100 karakterden uzun olamaz.");
        }
    }
}
