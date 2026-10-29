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
  ListTodo,
  GripVertical,
  ArrowUpDown
} from 'lucide-react';
import { Reorder } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { MerchantTask } from '../types';

export function DailyTaskListSidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<MerchantTask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load from Firestore on initial mount
  useEffect(() => {
    async function loadTasks() {
      if (user) {
        try {
          const loadedTasks = await taskService.getTasks(user.uid);
          setTasks(loadedTasks);
        } catch (err) {
          console.warn('Failed to load tasks from Firestore:', err);
        }
      }
    }
    loadTasks();
  }, [user]);

  // Overdue task alert
  useEffect(() => {
    async function checkOverdue() {
      if (user) {
        try {
          const overdue = await taskService.getOverdueTasks(user.uid);
          const importantOverdue = overdue.filter(t => t.isImportant);
          if (importantOverdue.length > 0) {
            const { sendDesktopNotification } = await import('../services/notificationService');
            sendDesktopNotification('⚠️ تنبيه: مهمة هامة متأخرة!', {
              body: `لديك ${importantOverdue.length} مهمة هامة متأخرة عن موعدها. يرجى المراجعة.`,
              tag: 'overdue-task-alert',
            });
          }
        } catch (err) {
          console.warn('Failed to check overdue tasks:', err);
        }
      }
    }
    // Check every 5 minutes
    const interval = setInterval(checkOverdue, 5 * 60 * 1000);
    checkOverdue();
    return () => clearInterval(interval);
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    const newTask: Omit<MerchantTask, 'id' | 'userId' | 'createdAt'> = {
      title: newTitle.trim(),
      description: '',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      isImportant: newPriority === 'high',
      isCompleted: false,
      isRecurring: false,
    };

    try {
      const taskId = await taskService.addTask(user.uid, newTask);
      setTasks([{ id: taskId, userId: user.uid, createdAt: new Date().toISOString(), ...newTask }, ...tasks]);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const toggleTask = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await taskService.updateTask(user.uid, id, { isCompleted: !task.isCompleted });
      setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await taskService.deleteTask(user.uid, id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const activeCount = tasks.filter(t => !t.isCompleted).length;

  const handleReorder = (newFilteredTasks: MerchantTask[]) => {
    const filteredIds = new Set(filteredTasks.map(t => t.id));
    let filteredIdx = 0;
    const result = tasks.map(task => {
      if (filteredIds.has(task.id)) {
        return newFilteredTasks[filteredIdx++];
      }
      return task;
    });
    setTasks(result);
  };

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
              المكتملة ({tasks.filter(t => t.isCompleted).length})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <Reorder.Group 
          axis="y" 
          values={filteredTasks} 
          onReorder={handleReorder}
          className="flex-1 overflow-y-auto p-4 space-y-2.5"
        >
          {/* Active Drop Zone Global Banner */}
          {draggedTaskId && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/5 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300 shadow-md">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-bold">منطقة الإفلات (Drop Zone) نشطة</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-amber-300" />
                حرّك وأفلت لتثبيت الترتيب
              </span>
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <CheckSquare className="w-10 h-10 text-slate-700" />
              <span>لا توجد مهام مطابقة للفلتر الحالي</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priorityColor = 
                task.isImportant ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                'text-sky-400 bg-sky-500/10 border-sky-500/30';

              const priorityLabel = 
                task.isImportant ? 'عاجلة' : 'عادية';

              const isBeingDragged = draggedTaskId === task.id;

              return (
                <Reorder.Item 
                  key={task.id}
                  value={task}
                  onDragStart={() => setDraggedTaskId(task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 group relative select-none ${
                    task.isCompleted 
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                      : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40 shadow-md'
                  } ${
                    isBeingDragged
                      ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-900 shadow-2xl z-50'
                      : draggedTaskId
                      ? 'border-dashed border-slate-700/70 opacity-70 hover:opacity-100 hover:border-amber-500/40'
                      : ''
                  }`}
                  style={{ cursor: 'grab' }}
                  whileDrag={{ 
                    scale: 1.03, 
                    opacity: 0.98,
                    borderColor: "rgba(245, 158, 11, 0.95)",
                    boxShadow: "0 20px 35px -8px rgba(0, 0, 0, 0.85), 0 0 25px 2px rgba(245, 158, 11, 0.35)",
                    zIndex: 50
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Subtle Insertion Drop Guideline when another item is being moved */}
                  {draggedTaskId && !isBeingDragged && (
                    <div className="absolute -top-1.5 inset-x-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />
                  )}

                  {/* Active Dragged Target Badge */}
                  {isBeingDragged && (
                    <div className="absolute -top-2.5 left-4 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-300 z-10 pointer-events-none animate-bounce">
                      <ArrowUpDown className="w-3 h-3 text-slate-950" />
                      <span>مكان الإسقاط المستهدف</span>
                    </div>
                  )}

                  <div className={`mt-1 cursor-grab active:cursor-grabbing shrink-0 transition-colors ${
                    isBeingDragged ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400 group-hover:text-amber-400'
                  }`}>
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-amber-400 transition shrink-0"
                    title={task.isCompleted ? 'إلغاء الإكمال' : 'إكمال المهمة'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-amber-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-relaxed ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
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
                </Reorder.Item>
              );
            })
          )}

          {/* Bottom Drop Target Indicator */}
          {draggedTaskId && filteredTasks.length > 0 && (
            <div className="p-2.5 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 flex items-center justify-center gap-2 text-amber-300/80 text-[11px] font-bold transition-all">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>إفلات هنا لنقل المهمة إلى نهاية القائمة</span>
            </div>
          )}
        </Reorder.Group>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-between">
          <span>إجمالي المهام: <strong className="text-white">{tasks.length}</strong></span>
          <span>المتبقي: <strong className="text-amber-400">{activeCount}</strong></span>
        </div>
      </div>
    </>
  );
}
