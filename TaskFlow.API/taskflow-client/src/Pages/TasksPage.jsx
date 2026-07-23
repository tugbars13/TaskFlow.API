import { useTasks } from "../hooks/useTasks";

function TasksPage() {

    const { tasks } = useTasks();

    return (
        <div>

            <h1>TaskFlow</h1>

            {
                tasks.map(task => (

                    <div key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                    </div>

                ))
            }

        </div>
    );
}

export default TasksPage;