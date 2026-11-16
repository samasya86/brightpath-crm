import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all enquiries
        </Link>
      </div>

      {/* Lead Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Aarav Sharma
              </h2>
              <Badge variant="amber" dot>
                Contacted
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Lead ID: {id || 'lead-001'}</span>
              <span>•</span>
              <span>Enquired 2 days ago via Website Form</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Phone className="w-3.5 h-3.5" />}
          >
            Call
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsFollowupModalOpen(true)}
          >
            Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Information */}
        <div className="space-y-6">
          <Card title="Student Information">
            <dl className="space-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Target Course
                </dt>
                <dd className="text-slate-800 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  JEE Advanced 2-Year Program
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Contact Phone
                </dt>
                <dd className="text-slate-800 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  +91 98765 43210
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Email Address
                </dt>
                <dd className="text-slate-800 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  aarav.sharma@example.com
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Assigned Counsellor
                </dt>
                <dd className="text-slate-800 font-medium text-sm mt-0.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  Sunita Rao (Counsellor)
                </dd>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">
                  Counsellor Notes
                </dt>
                <dd className="text-slate-600 mt-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "Student interested in morning batch for physics & maths. Parent requested fee breakdown and scholarship test details."
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right Columns: Follow-ups & Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Follow-ups Card */}
          <Card
            title="Scheduled Follow-ups"
            subtitle="Actions planned with this student"
            headerAction={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsFollowupModalOpen(true)}
              >
                Add Follow-up
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="rose" size="sm" dot>
                      Overdue (10:30 AM Today)
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Call parent regarding scholarship test syllabus
                  </p>
                  <p className="text-xs text-slate-500">
                    Assigned to Sunita Rao
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Mark Done
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber" size="sm" dot>
                      Upcoming (Tomorrow, 4:00 PM)
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    Send fee structure PDF on WhatsApp & confirm batch preference
                  </p>
                  <p className="text-xs text-slate-500">
                    Assigned to Sunita Rao
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Mark Done
                </Button>
              </div>
            </div>
          </Card>

          {/* Activity History Timeline */}
          <Card
            title="Activity Audit Log"
            subtitle="Complete lifecycle events and status updates"
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Status changed to <span className="text-amber-600">Contacted</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sunita Rao called student and scheduled follow-up • 4 hours ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Lead Assigned to Sunita Rao
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated routing based on JEE course interest • 2 days ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Lead Registered in CRM
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Created via Website Form Submission • 2 days ago
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title="Schedule Follow-up"
        description="Set a date, time, and note for student callback."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFollowupModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsFollowupModalOpen(false)}>
              Schedule (Phase 6)
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Due Date & Time" type="datetime-local" required />
          <Input label="Follow-up Note" placeholder="e.g. Call regarding fee payment" required />
        </div>
      </Modal>
    </div>
  );
};
