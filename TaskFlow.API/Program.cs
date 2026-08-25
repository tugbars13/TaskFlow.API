using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // JWT doÄŸrulama
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Token doÄŸrulama ayarlarÄ±
using System.Text; // Secret Key'i byte dizisine Ã§evirmek iÃ§in
using TaskFlow.API.Configurations; // JwtSettings sÄ±nÄ±fÄ±mÄ±z
using TaskFlow.API.Data;
using TaskFlow.API.Middlewares;
using TaskFlow.API.Repositories;
using TaskFlow.API.Services;
using TaskFlow.API.Validators;
using Microsoft.OpenApi.Models; // Swagger JWT ayarlarÄ±
using TaskFlow.API.Hubs;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder, uygulamanÄ±n "henÃ¼z inÅŸa edilmemiÅŸ" halini temsil eder â€” ona servisler ekleyip sonunda Build() diyerek gerÃ§ek uygulamayÄ± oluÅŸturacaÄŸÄ±z.
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();
builder.Services.AddSwaggerGen(options =>
{
    // Swagger'a Bearer Authentication tanÄ±mÄ± ekleniyor.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization", // Header adÄ±
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,

        });

    // TÃ¼m endpointlerde bu gÃ¼venlik ÅŸemasÄ±nÄ± kullan.
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

// builder.Services.AddControllers(); satÄ±rÄ±nÄ±n yakÄ±nÄ±na ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5174",
            "http://localhost:5173",
            "http://localhost:5175",
            "http://localhost:5176"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IDescriptionSanitizerService, DescriptionSanitizerService>();
// Auth iÅŸlemlerini yÃ¶neten servisi Dependency Injection container'Ä±na ekler.

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
builder.Services.AddScoped<ITeamAuthorizationService, TeamAuthorizationService>();
// Validators klasÃ¶rÃ¼ndeki tÃ¼m validator'larÄ± otomatik bulur.
builder.Services.AddValidatorsFromAssemblyContaining<CreateTaskDtoValidator>();
// appsettings.json iÃ§indeki JwtSettings bÃ¶lÃ¼mÃ¼nÃ¼ JwtSettings sÄ±nÄ±fÄ±na baÄŸlar.
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// Token Ã¼retme servisini ekler.
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddHostedService<DataLifecycleWorker>(); // Repository'yi DI container'a ekler.

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

// TÃ¼m beklenmeyen hatalarÄ± yakalar.
app.UseMiddleware<ExceptionMiddleware>();
app.UseHttpsRedirection();
// CORS 
app.UseCors("AllowReactApp");


// KullanÄ±cÄ±nÄ±n kimliÄŸini doÄŸrular.
app.UseAuthentication();
// Sonra yetkisi kontrol edilir.
app.UseAuthorization();
// En son endpointler Ã§alÄ±ÅŸÄ±r.
app.MapControllers();


app.MapHub<TaskHub>("/hubs/tasks");

app.Run();

