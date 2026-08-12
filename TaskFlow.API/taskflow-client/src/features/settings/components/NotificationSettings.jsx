import { useState } from "react";

export default function NotificationSettings({ onSave }) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const [preferences, setPreferences] = useState({
    taskAssignments: "Email & Push",
    taskComments: "Email & Push",
    dueDates: "Email & Push",
    mentions: "Email & Push",
    systemUpdates: "Email Only",
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave?.({ emailEnabled, pushEnabled, preferences });
  };

  const notificationTypes = [
    {
      id: "taskAssignments",
      icon: "assignment_ind",
      title: "Task Assignments",
      description: "Notify me when I am assigned to a task",
    },
    {
      id: "taskComments",
      icon: "comment",
      title: "Task Comments",
      description: "Notify me when someone comments on my tasks",
    },
    {
      id: "dueDates",
      icon: "event",
      title: "Due Dates & Reminders",
      description: "Notify me about upcoming due dates and reminders",
    },
    {
      id: "mentions",
      icon: "alternate_email",
      title: "Mentions",
      description: "Notify me when I am mentioned",
    },
    {
      id: "systemUpdates",
      icon: "system_update",
      title: "System Updates",
      description: "Important updates about the system and features",
    },
  ];

  return (
    <div className="bg-surface rounded-[20px] p-6 lg:p-8 border border-outline-variant/10 apple-shadow">
      <div>
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
          Notification Settings
        </h3>
        <p className="text-sm text-on-surface-variant mt-1.5">
          Choose how and when you want to be notified.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        
        {/* Email & Push Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl apple-shadow-sm h-[100px]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-on-surface">Email Notifications</h4>
                <p className="text-[12px] font-medium text-on-surface-variant mt-0.5">Receive notifications via email</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${emailEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl apple-shadow-sm h-[100px]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-on-surface">Push Notifications</h4>
                <p className="text-[12px] font-medium text-on-surface-variant mt-0.5">Receive push notifications in your browser</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${pushEnabled ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <hr className="border-outline-variant/10" />

        {/* Notification Preferences */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-[13px] font-bold text-on-surface uppercase tracking-wider">Notification Preferences</h4>
              <p className="text-[13px] text-on-surface-variant font-medium mt-1">Select the events you want to receive notifications for.</p>
            </div>
            <button type="button" className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors">
              Select All
            </button>
          </div>

          <div className="border border-outline-variant/10 rounded-2xl bg-surface-container-lowest overflow-hidden flex flex-col divide-y divide-outline-variant/10">
            {notificationTypes.map((type) => (
              <div key={type.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                  </div>
                  <div>
                    <h5 className="text-[14px] font-bold text-on-surface leading-tight">{type.title}</h5>
                    <p className="text-[12px] text-on-surface-variant mt-1 font-medium">{type.description}</p>
                  </div>
                </div>
                
                <div className="relative shrink-0 w-full sm:w-[200px]">
                  <select
                    value={preferences[type.id]}
                    onChange={(e) => handlePreferenceChange(type.id, e.target.value)}
                    className="w-full px-4 py-2 h-[40px] bg-surface-container-lowest border border-outline-variant/30 rounded-[12px] text-[13px] font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Email & Push">Email & Push</option>
                    <option value="Email Only">Email Only</option>
                    <option value="Push Only">Push Only</option>
                    <option value="None">None</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/10">
          <button
            type="button"
            className="px-6 py-2.5 text-[13px] font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 h-[42px] bg-primary hover:bg-primary/90 text-white font-bold text-[13px] rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center"
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
