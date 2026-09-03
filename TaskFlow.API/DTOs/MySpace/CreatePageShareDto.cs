using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs.MySpace;

public class CreatePageShareDto
{
    [Required(ErrorMessage = "Permission alan zorunludur.")]
    [RegularExpression("^(View|Edit)$", ErrorMessage = "Permission sadece 'View' veya 'Edit' olabilir.")]
    public string Permission { get; set; } = string.Empty;
}
