using AutoMapper;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Mappings;

// Profile sınıfı AutoMapper'ın dönüşüm kurallarını tuttuğu yerdir.
public class TaskProfile : Profile
{
    public TaskProfile()
    {
        // Entity -> DTO dönüşümü
        CreateMap<TaskItem, TaskDto>();

        // DTO -> Entity dönüşümü
        CreateMap<CreateTaskDto, TaskItem>();

        // DTO -> Entity (Güncelleme)
        CreateMap<UpdateTaskDto, TaskItem>();
    }
}