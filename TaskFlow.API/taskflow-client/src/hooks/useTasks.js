import { useState } from "react";

export function useTasks() {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Sample Task 1", completed: false },
        { id: 2, title: "Sample Task 2", completed: true }
    ]);

    return { tasks, setTasks };
}
