import { useState } from "react";

export default function CalendarPopover({ selectedDate, period = "daily", onSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(selectedDate || new Date()));
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Make Monday=0
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNext = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

  // Pre-calculate selected weekly range
  const selectedDt = new Date(selectedDate);
  let startOfWeek = null;
  let endOfWeek = null;
  if (period === "weekly") {
    const sDay = selectedDt.getDay();
    const diff = sDay === 0 ? 6 : sDay - 1;
    startOfWeek = new Date(selectedDt);
    startOfWeek.setDate(selectedDt.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
  }

  return (
    <div className="absolute top-full mt-2 left-0 z-50 bg-surface-container rounded-xl shadow-lg border border-outline-variant/20 p-4 w-64 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="p-1 hover:bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span className="font-bold text-sm text-on-surface">{monthNames[month]} {year}</span>
        <button onClick={handleNext} className="p-1 hover:bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-xs font-bold text-on-surface-variant">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="p-2"></div>;
          
          const dt = new Date(year, month, d);
          const dateStr = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          
          let isSelected = false;
          if (period === "daily") {
             isSelected = dateStr === selectedDate;
          } else if (period === "monthly") {
             isSelected = dt.getFullYear() === selectedDt.getFullYear() && dt.getMonth() === selectedDt.getMonth();
          } else if (period === "weekly") {
             isSelected = dt >= startOfWeek && dt <= endOfWeek;
          }
          
          const todayDt = new Date();
          const todayStr = new Date(todayDt.getTime() - todayDt.getTimezoneOffset() * 60000).toISOString().split('T')[0];
          const isToday = dateStr === todayStr;
          
          let buttonClass = "text-on-surface hover:bg-surface-container-high rounded-full";
          
          if (isSelected) {
            if (period === "daily") {
              buttonClass = "bg-primary text-on-primary font-bold shadow-sm rounded-full";
            } else if (period === "weekly") {
               buttonClass = "bg-primary/20 text-primary font-bold rounded-none";
               if (dt.getDay() === 1) buttonClass += " rounded-l-full";
               if (dt.getDay() === 0) buttonClass += " rounded-r-full";
               if (dateStr === selectedDate) {
                 buttonClass = "bg-primary text-on-primary rounded-full relative z-10 font-bold shadow-sm";
               }
            } else if (period === "monthly") {
               buttonClass = "bg-primary/20 text-primary font-bold rounded-md mx-[2px]";
               if (dateStr === selectedDate) {
                 buttonClass = "bg-primary text-on-primary rounded-md relative z-10 font-bold shadow-sm mx-[2px]";
               }
            }
          } else if (isToday) {
             buttonClass = "bg-surface-container-highest text-on-surface font-bold border border-outline-variant/30 rounded-full";
          }

          return (
            <button 
              key={d}
              onClick={() => { onSelect(dateStr); onClose(); }}
              className={`p-1 text-sm w-full h-7 flex items-center justify-center transition-colors ${buttonClass}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
