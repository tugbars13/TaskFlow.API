import { useTasks } from "../hooks/useTasks";
import TaskList from "../components/task/TaskList";

function TasksPage() {

    const { tasks } = useTasks();

    return (
        <div>

            <h1>TaskFlow</h1>

            <TaskList tasks={tasks} />

        </div>
    );
}

export default TasksPage;