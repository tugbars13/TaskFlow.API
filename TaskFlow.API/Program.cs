using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
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
using TaskFlow.API.Hubs;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder, uygulamanın "henüz inşa edilmemiş" halini temsil eder â€” ona servisler ekleyip sonunda Build() diyerek gerçek uygulamayı oluşturacağız.
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();
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

// ...

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromSeconds(1)
            }));
    options.RejectionStatusCode = 429;
});
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IDescriptionSanitizerService, DescriptionSanitizerService>();
// Auth işlemlerini yöneten servisi Dependency Injection container'ına ekler.

builder.Services.AddScoped<IAuthService, AuthService>();
// FluentValidation servislerini ekler.
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ITeamAnalyticsService, TeamAnalyticsService>();
builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IUserBehaviorProfileService, UserBehaviorProfileService>();
builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserBehaviorProfileRepository, UserBehaviorProfileRepository>();
builder.Services.AddScoped<ITeamAnalyticsSnapshotRepository, TeamAnalyticsSnapshotRepository>();
builder.Services.AddScoped<ITeamAuthorizationService, TeamAuthorizationService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddTransient<IEmailService, EmailService>();

// Validators klasöründeki tüm validator'ları otomatik bulur.
builder.Services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();
// appsettings.json içindeki JwtSettings bölümünü JwtSettings sınıfına bağlar.
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings"));

// Token üretme servisini ekler.
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddHostedService<DataLifecycleWorker>(); // Repository'yi DI container'a ekler.

builder.Services.AddScoped<IMySpaceFolderRepository, MySpaceFolderRepository>();
builder.Services.AddScoped<IMySpacePageRepository, MySpacePageRepository>();
builder.Services.AddScoped<IMySpaceService, MySpaceService>();

// AI configuration and services
builder.Services.Configure<AiSettings>(
    builder.Configuration.GetSection("AiSettings"));
builder.Services.AddHttpClient<IAiService, GeminiAiService>();

// JWT Authentication servisini ekler.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["JwtSettings:SecretKey"]!
                )
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/tasks"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
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
app.UseStaticFiles();
// CORS 
app.UseCors("AllowReactApp");
app.UseRateLimiter();


// Kullanıcının kimliğini doğrular.
app.UseAuthentication();
// Sonra yetkisi kontrol edilir.
app.UseAuthorization();
// En son endpointler çalışır.
app.MapControllers();


app.MapHub<TaskHub>("/hubs/tasks");

app.Run();
