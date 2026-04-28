import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

export function TodoList({ items = [], onToggle, onAdd, lang = 'bn' }) {
  const [todos, setTodos] = useState(items);

  const toggle = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    onToggle?.(id);
  };

  const addRandom = () => {
    const tasks = [
      { bn: 'ব্রেকিং নিউজ আপডেট করুন', en: 'Update breaking news' },
      { bn: 'সোশ্যাল মিডিয়া পোস্ট শিডিউল করুন', en: 'Schedule social media post' },
      { bn: 'সাপ্তাহিক রিপোর্ট তৈরি করুন', en: 'Create weekly report' },
    ];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    const newTodo = { id: Date.now(), text: task.bn, textEn: task.en, done: false, priority: 'low' };
    setTodos(prev => [...prev, newTodo]);
    onAdd?.(newTodo);
  };

  const priorityColors = { high: '#e8001e', medium: '#f59e0b', low: '#3b82f6' };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">{lang === 'bn' ? 'কাজের তালিকা' : 'Todo List'}</h3>
        <button onClick={addRandom} className="bg-[#e8001e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 hover:bg-[#b8001a] transition-colors">
          <Plus className="w-3 h-3" /> {lang === 'bn' ? 'যোগ' : 'Add'}
        </button>
      </div>
      <div className="space-y-0">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-2.5 py-2.25 border-b border-[#f3f4f6] last:border-0">
            <button
              onClick={() => toggle(todo.id)}
              className={`w-4.5 h-4.5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                todo.done ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-[var(--card-border,#e8ebf4)]'
              }`}
            >
              {todo.done && <Check className="w-2.5 h-2.5" />}
            </button>
            <span className={`text-[12.5px] flex-1 font-medium ${todo.done ? 'line-through text-[var(--text-muted,#9ca3af)]' : 'text-[var(--text-primary,#1a1d2e)]'}`}>
              {lang === 'bn' ? todo.text : (todo.textEn || todo.text)}
            </span>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColors[todo.priority] || '#3b82f6' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
