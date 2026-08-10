import TaskCard from "./TaskCard";

function TaskList({ tasks = [] }) {
  if (!tasks?.length) {
    return <p>Henüz görev eklenmedi.</p>;
  }
  return (
    <>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </>
  );
}

export default TaskList;
