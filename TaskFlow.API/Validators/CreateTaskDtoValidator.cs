using FluentValidation;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Validators;

// CreateTaskDto icin dogrulama kurallari
public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Baslik bos birakilamaz.")
            .MinimumLength(3)
            .WithMessage("Baslik en az 3 karakter olmalidir.")
            .MaximumLength(100)
            .WithMessage("Baslik en fazla 100 karakter olabilir.");

        RuleFor(x => x.Description)
            .MaximumLength(50000)
            .WithMessage("Aciklama en fazla 50000 karakter olabilir.");
    }
}
