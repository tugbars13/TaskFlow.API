using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.Models;
using TaskFlow.API.Repositories;

namespace TaskFlow.API.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskItem>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        task.CreatedDate = DateTime.Now;
        return await _repository.CreateAsync(task);
    }

    public async Task<bool> UpdateAsync(int id, TaskItem task)
    {
        return await _repository.UpdateAsync(id, task);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}