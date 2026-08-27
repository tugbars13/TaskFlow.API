using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TaskFlow.API.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Geçersiz dosya.");
            }

            // Validations
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Sadece .jpg, .jpeg, .png, .gif, .webp uzantılı dosyalar yüklenebilir.");
            }

            if (file.Length > 5 * 1024 * 1024) // 5 MB
            {
                return BadRequest("Dosya boyutu 5MB'den büyük olamaz.");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL (assuming the client will construct the full URL if needed, or use relative)
            var fileUrl = $"/uploads/{uniqueFileName}";
            
            // To provide absolute URL we can do:
            var request = HttpContext.Request;
            var absoluteUrl = $"{request.Scheme}://{request.Host}{fileUrl}";

            return Ok(new { url = absoluteUrl });
        }

        [HttpPost("file")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Geçersiz dosya.");
            }

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip", ".rar", ".csv" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Geçersiz dosya formatı. Desteklenen formatlar: pdf, doc, docx, xls, xlsx, txt, zip, rar, csv.");
            }

            if (file.Length > 25 * 1024 * 1024) // 25 MB
            {
                return BadRequest("Dosya boyutu 25MB'den büyük olamaz.");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{uniqueFileName}";
            var request = HttpContext.Request;
            var absoluteUrl = $"{request.Scheme}://{request.Host}{fileUrl}";

            return Ok(new { url = absoluteUrl, name = file.FileName, size = file.Length });
        }
    }
}
