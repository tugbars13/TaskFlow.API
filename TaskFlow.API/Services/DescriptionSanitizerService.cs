using Ganss.Xss;

namespace TaskFlow.API.Services;

public class DescriptionSanitizerService : IDescriptionSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;

    public DescriptionSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();
    }

    public string Sanitize(string description)
    {
        if (string.IsNullOrEmpty(description))
            return description;

        return _sanitizer.Sanitize(description);
    }
}
