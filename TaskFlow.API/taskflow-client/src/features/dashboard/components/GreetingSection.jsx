import useAuth from "@/features/auth/hooks/useAuth";
import Card from "@/components/ui/Card";

export default function GreetingSection({ highPriorityTasks = 0 }) {
  const { user } = useAuth();

  const firstName =
    user?.firstName ||
    (user?.fullName ? user.fullName.split(" ")[0] : null);

  const greetingText = firstName
    ? `Good morning, ${firstName} 👋`
    : "Good morning 👋";

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-lg items-center">
      <div className="md:col-span-8">
        <h2 className="font-display-lg text-display-lg font-bold text-primary tracking-tight">
          {greetingText}
        </h2>

        <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
          You have {highPriorityTasks} high-priority tasks finishing today.
          Let's make it productive!
        </p>
      </div>

      <div className="md:col-span-4">
        <Card
          variant="glass"
          padding="md"
          className="flex items-center gap-md border-primary/10"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </div>

          <div>
            <p className="font-label-md text-xs font-bold text-primary">
              Productivity Insights
            </p>

            <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
              Focusing on "Analytics" now will save 2 hours tomorrow.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}