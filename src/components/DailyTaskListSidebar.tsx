import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Clock, 
  Flag,
  ListTodo
} from 'lucide-react';

export interface DailyTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export function DailyTaskListSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem('radar_merchant_daily_tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load daily tasks:', e);
    }
    // Default initial tasks for Egyptian merchants
    return [
      { id: '1', title: 'مراجعة أسعار المنافسين على أمازون مصر ونون', priority: 'high', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'تحديث بوليصات الشحن المعلقة مع شركة Bosta', priority: 'medium', completed: false, createdAt: new Date().toISOString() },
      { id: '3', title: 'إرسال التقرير المالي اليومي للإدارة', priority: 'low', completed: true, createdAt: new Date().toISOString() }
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('radar_merchant_daily_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save daily tasks:', e);
    }
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DailyTask = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <>
      {/* Floating Toggle Button on Right Edge */}
      <div className="fixed right-0 top-1/3 z-50 transform -translate-y-1/2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-4 rounded-r-none rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 border-l border-t border-b border-amber-600 transition-all hover:scale-105 active:scale-95 group"
          title="مفكرة المهام اليومية للتاجر"
        >
          <ListTodo className="w-5 h-5 text-slate-950 animate-pulse" />
          <span className="text-[11px] [writing-mode:vertical-rl] tracking-wider font-extrabold">المهام اليومية</span>
          {activeCount > 0 && (
            <span className="bg-slate-950 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full shadow-inner">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
        />
      )}

      {/* Collapsible Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">مفكرة المهام اليومية</h3>
              <p className="text-[11px] text-slate-400">إدارة و جدول أعمال التاجر اليومي</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="إغلاق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={addTask} className="p-4 border-b border-slate-800 bg-slate-950/20 space-y-3">
          <div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="إضافة مهمة جديدة سريعاً (مثال: فحص طلبات نون)..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold">الأولوية:</span>
              <button
                type="button"
                onClick={() => setNewPriority('low')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  newPriority === 'low' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                عادية
              </button>
              <button
                type="button"
                onClick={() => setNewPriority('medium')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  newPriority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                متوسطة
              </button>
              <button
                type="button"
                onClick={() => setNewPriority('high')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  newPriority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                عاجلة
              </button>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'all' ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'active' ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              قيد التنفيذ ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === 'completed' ? 'bg-slate-800 text-amber-300 border border-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              المكتملة ({tasks.filter(t => t.completed).length})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <CheckSquare className="w-10 h-10 text-slate-700" />
              <span>لا توجد مهام مطابقة للفلتر الحالي</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priorityColor = 
                task.priority === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                task.priority === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                'text-sky-400 bg-sky-500/10 border-sky-500/30';

              const priorityLabel = 
                task.priority === 'high' ? 'عاجلة' :
                task.priority === 'medium' ? 'متوسطة' : 'عادية';

              return (
                <div 
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                    task.completed 
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                      : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40 shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-amber-400 transition shrink-0"
                    title={task.completed ? 'إلغاء الإكمال' : 'إكمال المهمة'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-amber-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-relaxed ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor}`}>
                        {priorityLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(task.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition opacity-0 group-hover:opacity-100 shrink-0"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between">
          <span>إجمالي المهام: <strong className="text-white">{tasks.length}</strong></span>
          <span>المتبقي: <strong className="text-amber-400">{activeCount}</strong></span>
        </div>
      </div>
    </>
  );
}
