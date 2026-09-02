using FluentValidation;
using TaskFlow.API.DTOs.MySpace;

namespace TaskFlow.API.Validators
{
    public class UpdateMySpaceFolderDtoValidator : AbstractValidator<UpdateMySpaceFolderDto>
    {
        public UpdateMySpaceFolderDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Klasör adı boş olamaz.")
                .MaximumLength(100).WithMessage("Klasör adı 100 karakterden uzun olamaz.");
        }
    }
}
