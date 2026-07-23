function TaskCard({ task }) {
    return (
        <div className="task-card">
            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <span>
                {task.isCompleted ? "✅ Tamamlandı" : "⏳ Devam Ediyor"}
            </span>
        </div>
    );
}

export default TaskCard;