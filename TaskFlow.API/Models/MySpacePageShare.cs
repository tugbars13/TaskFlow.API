using System;

namespace TaskFlow.API.Models;

public class MySpacePageShare
{
    public int Id { get; set; }
    
    public int PageId { get; set; }
    public MySpacePage? Page { get; set; }

    /// <summary>
    /// SHA-256 hashed token stored in DB for security.
    /// </summary>
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// "View" or "Edit"
    /// </summary>
    public string Permission { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}
