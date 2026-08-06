namespace TaskFlow.API.Responses;

// API'den dönen standart cevap modeli.
public class ApiResponse<T> //T:generic tip parametresi, her tür veri tipini temsil edebilir.
{
    public bool Success { get; set; } // İşlem başarılı mı?

    public string Message { get; set; } = string.Empty; // Bilgilendirme mesajı

    public T? Data { get; set; } // Dönen veri
}