using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // JWT doğrulama
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Token doğrulama ayarları
using System.Text; // Secret Key'i byte dizisine çevirmek için
using TaskFlow.API.Configurations; // JwtSettings sınıfımız
using TaskFlow.API.Data;
using TaskFlow.API.Middlewares;
using TaskFlow.API.Repositories;
using TaskFlow.API.Services;
using TaskFlow.API.Validators;
using Microsoft.OpenApi.Models; // Swagger JWT ayarları
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder, uygulamanın "henüz inşa edilmemiş" halini temsil eder — ona servisler ekleyip sonunda Build() diyerek gerçek uygulamayı oluşturacağız.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Swagger'a Bearer Authentication tanımı ekleniyor.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization", // Header adı
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,

        });

    // Tüm endpointlerde bu güvenlik şemasını kullan.
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference=new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// builder.Services.AddControllers(); satırının yakınına ekle
builder.Services.AddCors(options =>
{// CORS politikası : Belirli bir kaynaktan gelen istekleri kabul etme veya reddetme kuralları
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://localhost:7033", "http://localhost:5173" , "http://localhost:5175/") // CRA veya Vite portu
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddScoped<ITaskService, TaskService>();
// Auth işlemlerini yöneten servisi Dependency Injection container'ına ekler.

builder.Services.AddScoped<IAuthService, AuthService>();
// FluentValidation servislerini ekler.
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITeamAuthorizationService, TeamAuthorizationService>();
// Validators klasöründeki tüm validator'ları otomatik bulur.
builder.Services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();
// appsettings.json içindeki JwtSettings bölümünü JwtSettings sınıfına bağlar.
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// Token üretme servisini ekler.
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>(); // Repository'yi DI container'a ekler.
// JWT Authentication servisini ekler.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Token doğrulama kuralları
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Issuer kontrolü
            ValidateAudience = true, // Audience kontrolü
            ValidateLifetime = true, // Süresi dolmuş mu?
            ValidateIssuerSigningKey = true, // İmza doğru mu?

            // Token'ı oluşturan uygulamanın adı.
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],

            // Token'ı kullanacak uygulamanın adı.
            ValidAudience = builder.Configuration["JwtSettings:Audience"],

            // SecretKey ile imzayı doğrular.
            IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:SecretKey"]!))
                };
    });

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Tüm beklenmeyen hataları yakalar.
app.UseMiddleware<ExceptionMiddleware>();
app.UseHttpsRedirection();
// CORS 
app.UseCors("AllowReactApp");


// Kullanıcının kimliğini doğrular.
app.UseAuthentication();
// Sonra yetkisi kontrol edilir.
app.UseAuthorization();
// En son endpointler çalışır.
app.MapControllers();



app.Run();
