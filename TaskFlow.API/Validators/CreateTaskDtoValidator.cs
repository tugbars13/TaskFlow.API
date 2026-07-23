using FluentValidation;
using TaskFlow.API.DTOs;

namespace TaskFlow.API.Validators;

// CreateTaskDto için doğrulama kuralları
public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty() // Boş olamaz
            .WithMessage("Başlık boş bırakılamaz.")
            .MinimumLength(3) // En az 3 karakter
            .WithMessage("Başlık en az 3 karakter olmalıdır.")
            .MaximumLength(100) // En fazla 100 karakter
            .WithMessage("Başlık en fazla 100 karakter olabilir.");

        RuleFor(x => x.Description)
            .MaximumLength(500) // Açıklama sınırı
            .WithMessage("Açıklama en fazla 500 karakter olabilir.");
    }
}