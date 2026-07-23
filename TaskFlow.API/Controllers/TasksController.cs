//using : ASP.NET Corun sontroller sınıflarını kullanabilmek için yazarız
using Microsoft.AspNetCore.Mvc;
using TaskFlow.API.Models;
using TaskFlow.API.Services;

namespace TaskFlow.API.Controllers
{
    [ApiController] // bu sınıf bir web API Controllerıdır
    [Route("api/[controller]")] //url oluşturur
    public class TasksController : ControllerBase //inheritance ile ControllerBase sınıfından türetilir
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }// bir kez oluşturulacak ve tüm controller boyunca kullanılacak


        //async : bir metodun bekleme yapabileceğini belirtir. await : bir metodun tamamlanmasını bekler
        //task : hemen sonuç döndürmez iş bitir ve sonucu dönderir
        //http : http cevaplarını döndürmek için kullanılır.
        //IEnumerable : liste döner

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            throw new Exception("Test hatası");
            // Tüm görevleri Service katmanından alıyoruz.
            var tasks = await _taskService.GetAllAsync();

            // HTTP 200 ile listeyi döndürüyoruz.
            return Ok(tasks);
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            var task = await _taskService.GetByIdAsync(id);

            if (task == null)
                return NotFound();

            return task;
        }

        // POST: api/tasks
        [HttpPost] //yeni bir task eklemek için kullanılır
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] TaskItem task)
        {
            // Yeni görevi Service katmanına gönderiyoruz.
            var createdTask = await _taskService.CreateAsync(task);

            // Oluşturulan kaydı geri döndürüyoruz.
            return CreatedAtAction(nameof(GetTask),
                new { id = createdTask.Id },
                createdTask);
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")] //güncelleme işlemi için kullanılır
        public async Task<IActionResult> UpdateTask(int id, [FromBody]  TaskItem updatedTask)
        {
            // Güncelleme işlemini Service yapıyor.
            var updated = await _taskService.UpdateAsync(id, updatedTask);

            // Güncellenecek kayıt bulunamadıysa.
            if (!updated)
                return NotFound();

            return NoContent();
        }

        // PUT: api/tasks/5/toggle  (checkbox mantığı için hızlı yol)
        //[HttpPut("{id}/toggle")]
        //public async Task<IActionResult> ToggleCompleted(int id)
        //{
        //    // Silme işlemini Service gerçekleştiriyor.
        //    var deleted = await _taskService.DeleteAsync(id);

        //    // Kayıt bulunamadıysa.
        //    if (!deleted)
        //        return NotFound();

        //    return NoContent();
        //}

        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            // Silme işlemini Service gerçekleştiriyor.
            var deleted = await _taskService.DeleteAsync(id);

            // Kayıt bulunamadıysa.
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}