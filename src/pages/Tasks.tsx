import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const columns: { key: string; label: string; color: string }[] = [
  { key: 'backlog', label: 'Backlog', color: 'var(--text-tertiary)' },
  { key: 'assigned', label: 'Assigned', color: 'var(--accent-violet)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--accent-blue)' },
  { key: 'review', label: 'Review', color: 'var(--accent-amber)' },
  { key: 'done', label: 'Done', color: 'var(--accent-emerald)' },
];

const avatarBg: Record<string, string> = {
  claude: 'linear-gradient(135deg, #d97706, #ea580c)',
  openclaw: 'linear-gradient(135deg, #059669, #10b981)',
  codex: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  custom: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
};

export default function Tasks() {
  const { tasks, createTask, updateTask } = useAppStore();
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle, priority: newPriority });
    setNewTitle('');
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h2>Task Board</h2>
          <p>Kanban view — {tasks.length} total tasks</p>
        </div>
      </div>

      {/* Quick Add */}
      <div className="glass-card animate-in" style={{ padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input className="input" placeholder="New task title..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()} style={{ flex: 1 }} />
        <select className="select" value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ width: '120px' }}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="btn btn-primary" onClick={handleAddTask}><Plus size={16} /> Add</button>
      </div>

      <div className="task-board animate-in animate-in-delay-1">
        {columns.map((col) => {
          const colTasks = tasks.filter((t: any) => t.status === col.key);
          return (
            <div className="task-column" key={col.key}>
              <div className="task-column-header">
                <div className="task-column-title">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  {col.label}
                </div>
                <span className="task-column-count">{colTasks.length}</span>
              </div>
              <div className="task-column-body">
                {colTasks.map((task: any) => (
                  <div className="task-card" key={task.id}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {task.agent_name ? (
                        <div className="task-assignee">
                          <div className="task-assignee-avatar" style={{
                            background: avatarBg[task.agent_type] || avatarBg.custom,
                          }}>
                            {task.agent_name[0]}
                          </div>
                          {task.agent_name}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Unassigned</span>
                      )}
                      <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                    </div>
                    {/* Move controls */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {columns.filter(c => c.key !== col.key).map(c => (
                        <button key={c.key} onClick={() => handleMoveTask(task.id, c.key)}
                          style={{
                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
