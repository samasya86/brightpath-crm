import React, { useState } from 'react';
import { CalendarCheck, Plus, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Link } from 'react-router-dom';

export const FollowupsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const demoFollowups = [
    {
      id: 'fu-01',
      lead_id: 'lead-001',
      lead_name: 'Aarav Sharma',
      course: 'JEE Advanced 2-Year Program',
      due_at: 'Today, 10:30 AM',
      note: 'Call parent regarding scholarship test syllabus & morning batch availability',
      status: 'overdue' as const,
      assignee: 'Sunita Rao',
    },
    {
      id: 'fu-02',
      lead_id: 'lead-002',
      lead_name: 'Priya Patel',
      course: 'NEET FastTrack 2027',
      due_at: 'Today, 02:00 PM',
      note: 'Confirm lab visit appointment and clarify syllabus with botany faculty',
      status: 'pending' as const,
      assignee: 'Sunita Rao',
    },
    {
      id: 'fu-03',
      lead_id: 'lead-003',
      lead_name: 'Rohan Mehra',
      course: 'Foundation Grade 10',
      due_at: 'Tomorrow, 11:00 AM',
      note: 'Follow up on sample study material sent via email',
      status: 'pending' as const,
      assignee: 'Rajesh Kumar',
    },
    {
      id: 'fu-04',
      lead_id: 'lead-004',
      lead_name: 'Ananya Deshmukh',
      course: 'JEE Crash Course',
      due_at: 'Yesterday',
      note: 'Confirm installment fee payment receipt received',
      status: 'completed' as const,
      assignee: 'Rajesh Kumar',
    },
  ];

  const filtered = demoFollowups.filter((f) => {
    if (activeTab === 'overdue') return f.status === 'overdue';
    if (activeTab === 'today') return f.due_at.includes('Today');
    if (activeTab === 'upcoming') return f.status === 'pending' && !f.due_at.includes('Today');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Follow-up Queue & Schedules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student interactions and prevent enquiry drop-offs
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Follow-up
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['all', 'overdue', 'today', 'upcoming'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
            {tab === 'overdue' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                1
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Follow-up List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <Card key={item.id} bodyClassName="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/leads/${item.lead_id}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {item.lead_name}
                  </Link>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600">
                    {item.course}
                  </span>
                  <Badge
                    size="sm"
                    variant={
                      item.status === 'overdue'
                        ? 'rose'
                        : item.status === 'completed'
                        ? 'green'
                        : 'amber'
                    }
                    dot
                  >
                    {item.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-700 font-medium">
                  {item.note}
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Due: {item.due_at} • Assigned to: {item.assignee}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.status !== 'completed' ? (
                  <Button variant="outline" size="sm" leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                    Mark Completed
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Follow-up Modal Shell */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Follow-up"
        description="Select student and assign callback date and instructions."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Follow-up (Phase 6)
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Student Name" placeholder="Search student enquiry..." required />
          <Input label="Due Date & Time" type="datetime-local" required />
          <Input label="Instructions / Notes" placeholder="e.g. Call regarding fee structure" required />
        </div>
      </Modal>
    </div>
  );
};
