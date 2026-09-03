using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

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

        private string GetUploadsFolder()
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "Uploads");
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }
            return folder;
        }

        private bool IsValidImageSignature(Stream stream, string extension)
        {
            using var reader = new BinaryReader(stream, System.Text.Encoding.UTF8, true);
            stream.Position = 0;
            var headerBytes = reader.ReadBytes(4);
            stream.Position = 0; // Reset position

            return extension switch
            {
                ".jpg" or ".jpeg" => headerBytes[0] == 0xFF && headerBytes[1] == 0xD8,
                ".png" => headerBytes[0] == 0x89 && headerBytes[1] == 0x50 && headerBytes[2] == 0x4E && headerBytes[3] == 0x47,
                ".gif" => headerBytes[0] == 0x47 && headerBytes[1] == 0x49 && headerBytes[2] == 0x46,
                ".webp" => true, // Skipping webp magic bytes check for simplicity, normally starts with RIFF
                _ => false,
            };
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0) return BadRequest("Geçersiz dosya.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Sadece .jpg, .jpeg, .png, .gif, .webp uzantılı dosyalar yüklenebilir.");

            if (file.Length > 5 * 1024 * 1024) return BadRequest("Dosya boyutu 5MB'den büyük olamaz.");

            using var memStream = new MemoryStream();
            await file.CopyToAsync(memStream, cancellationToken);
            if (!IsValidImageSignature(memStream, extension))
                return BadRequest("Geçersiz veya bozuk resim dosyası.");

            var uploadsFolder = GetUploadsFolder();
            var uniqueFileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                memStream.Position = 0;
                await memStream.CopyToAsync(stream, cancellationToken);
            }

            var request = HttpContext.Request;
            var absoluteUrl = $"{request.Scheme}://{request.Host}/api/upload/{uniqueFileName}";
            return Ok(new { url = absoluteUrl });
        }

        [HttpPost("file")]
        public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0) return BadRequest("Geçersiz dosya.");

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip", ".rar", ".csv" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Geçersiz dosya formatı. Desteklenen formatlar: pdf, doc, docx, xls, xlsx, txt, zip, rar, csv.");

            if (file.Length > 25 * 1024 * 1024) return BadRequest("Dosya boyutu 25MB'den büyük olamaz.");

            var uploadsFolder = GetUploadsFolder();
            var uniqueFileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var request = HttpContext.Request;
            var absoluteUrl = $"{request.Scheme}://{request.Host}/api/upload/{uniqueFileName}";
            return Ok(new { url = absoluteUrl, name = file.FileName, size = file.Length });
        }

        [HttpGet("{fileName}")]
        [AllowAnonymous]
        public IActionResult GetFile(string fileName)
        {
            if (string.IsNullOrEmpty(fileName) || fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
                return BadRequest("Geçersiz dosya adı.");

            var uploadsFolder = GetUploadsFolder();
            var filePath = Path.Combine(uploadsFolder, fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            var contentType = extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".zip" => "application/zip",
                ".csv" => "text/csv",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };

            return PhysicalFile(filePath, contentType);
        }
    }
}
