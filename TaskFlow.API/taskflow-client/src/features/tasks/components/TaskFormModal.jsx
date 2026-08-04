import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DatePickerInput from "@/components/ui/DatePickerInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getTeamMembers } from "@/features/teams/api/teamService";

const DEFAULT_CATEGORIES = [
  "General",
  "Design System",
  "Backend",
  "Frontend",
  "Marketing",
  "QA",
  "Team Sync",
];

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  teamId = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchAssignees();
    }
  }, [isOpen, teamId]);

  const fetchAssignees = async () => {
    setLoadingMembers(true);
    try {
      const members = await getTeamMembers(teamId);
      setTeamMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      console.warn("Failed to load assignees from Users API:", err);
      setTeamMembers([
        { id: 1, userId: 1, fullName: "Tuğba Bars", role: "Owner" },
        { id: 2, userId: 2, fullName: "Ahmet Korkmaz", role: "Backend Developer" },
        { id: 3, userId: 3, fullName: "Ayşe Demir", role: "Frontend Lead" },
      ]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSubmitting(false);
      setTouched({});

      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setPriority(initialData.priority || "Medium");
        setCategory(initialData.category || "General");
        setDueDate(initialData.dueDate ? initialData.dueDate.slice(0, 10) : "");
        setAssigneeId(initialData.assignedUserId ? String(initialData.assignedUserId) : "");
      } else {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setCategory("General");
        setDueDate("");
        setAssigneeId("");
      }
    }
  }, [initialData, isOpen]);

  // Validation rules
  const errors = {};
  if (!title.trim()) {
    errors.title = "Task title is required.";
  } else if (title.trim().length < 3) {
    errors.title = "Task title must be at least 3 characters.";
  }

  if (!priority) errors.priority = "Priority is required.";
  if (!category) errors.category = "Category is required.";
  if (!dueDate) errors.dueDate = "Due date is required.";

  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, priority: true, category: true, dueDate: true });

    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const selectedAssignee = teamMembers.find((m) => String(m.userId) === String(assigneeId));
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        assignedUserId: assigneeId ? Number(assigneeId) : null,
        assignedUser: selectedAssignee ? selectedAssignee.fullName : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Task submission failed:", err);
      setSubmitError(err.message || "Failed to create task. Please check server connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData && initialData.id ? "Edit Task" : "Create New Task"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-lg">
        {submitError && (
          <div className="p-md bg-error-container/20 border border-error/30 rounded-2xl text-error text-xs font-semibold flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {submitError}
          </div>
        )}

        {/* Task Title */}
        <div className="space-y-xs">
          <Input
            label="Task Name *"
            placeholder="e.g. Finalize Q3 Roadmap & Design Tokens"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur("title")}
            disabled={submitting}
          />
          {touched.title && errors.title && (
            <p className="text-xs text-error font-medium pl-sm">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-xs">
          <label className="block font-label-md text-label-md font-semibold text-on-surface">
            Task Description
          </label>
          <textarea
            rows={3}
            placeholder="Add detailed task description, acceptance criteria, or requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            className="w-full bg-surface-container-high/50 border-none rounded-2xl p-md text-body-md font-body-md text-on-surface placeholder:text-outline/60 apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Two-Column Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Priority */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              onBlur={() => handleBlur("priority")}
              disabled={submitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🔵 Low Priority</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onBlur={() => handleBlur("category")}
              disabled={submitting}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline / Due Date */}
          <DatePickerInput
            label="Deadline (Due Date) *"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() => handleBlur("dueDate")}
            disabled={submitting}
            error={touched.dueDate ? errors.dueDate : null}
          />

          {/* Optional Assigned User Dropdown */}
          <div className="space-y-xs">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Assigned User (Optional)
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={submitting || loadingMembers}
              className="w-full bg-surface-container-high/50 border-none rounded-2xl py-[14px] px-md text-body-md font-body-md text-on-surface apple-shadow focus:ring-2 focus:ring-primary/20 disabled:opacity-50 cursor-pointer"
            >
              <option value="">-- Unassigned (Optional) --</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.userId}>
                  👤 {member.fullName || member.name} {member.role ? `(${member.role})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-md pt-md border-t border-outline-variant/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="filled"
            disabled={submitting || (touched.title && !isFormValid)}
            className="px-xl py-md rounded-2xl font-semibold shadow-md active:scale-95 transition-all"
          >
            {submitting ? (
              <span className="flex items-center gap-xs">
                <Spinner size="sm" />
                Creating Task...
              </span>
            ) : initialData && initialData.id ? (
              "Save Changes"
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
