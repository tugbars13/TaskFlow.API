using FluentValidation;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Validators;

// UpdateTaskDto için doğrulama kuralları
public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty() // Başlık boş olamaz
            .MinimumLength(3)
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500);
    }
}