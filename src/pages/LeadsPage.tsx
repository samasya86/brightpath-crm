import React, { useState } from 'react';
import { Search, Plus, Filter, Eye, Phone, Mail } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';

export const LeadsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Demo data for Phase 1 visual preview
  const demoLeads = [
    {
      id: 'lead-001',
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      course_interest: 'JEE Advanced 2-Year Program',
      source: 'Website',
      status: 'Contacted',
      assignee: 'Sunita Rao (Counsellor)',
      created_at: '2 hours ago',
    },
    {
      id: 'lead-002',
      full_name: 'Priya Patel',
      email: 'priya.p@example.com',
      phone: '+91 98234 56789',
      course_interest: 'NEET FastTrack 2027',
      source: 'Walk-in',
      status: 'Qualified',
      assignee: 'Sunita Rao (Counsellor)',
      created_at: 'Yesterday',
    },
    {
      id: 'lead-003',
      full_name: 'Rohan Mehra',
      email: null,
      phone: '+91 98111 22334',
      course_interest: 'Foundation Grade 10 Math & Science',
      source: 'Referral',
      status: 'New',
      assignee: 'Unassigned',
      created_at: '3 days ago',
    },
    {
      id: 'lead-004',
      full_name: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      phone: '+91 99887 76655',
      course_interest: 'JEE Crash Course',
      source: 'Phone Call',
      status: 'Converted',
      assignee: 'Rajesh Kumar (Senior Counsellor)',
      created_at: '5 days ago',
    },
    {
      id: 'lead-005',
      full_name: 'Vikram Joshi',
      email: 'vikram.j@example.com',
      phone: '+91 91234 56780',
      course_interest: 'Olympiad Foundation',
      source: 'Social Media',
      status: 'Lost',
      assignee: 'Sunita Rao (Counsellor)',
      created_at: '1 week ago',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <Badge variant="blue" dot>New</Badge>;
      case 'Contacted':
        return <Badge variant="amber" dot>Contacted</Badge>;
      case 'Qualified':
        return <Badge variant="purple" dot>Qualified</Badge>;
      case 'Converted':
        return <Badge variant="green" dot>Converted</Badge>;
      case 'Lost':
        return <Badge variant="rose" dot>Lost</Badge>;
      default:
        return <Badge variant="slate" dot>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            All Student Enquiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5 enquiries active in current view
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddLeadModalOpen(true)}
        >
          Add Enquiry
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by student name, phone, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Converted', label: 'Converted' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />

          <Button
            variant="outline"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Leads Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Student Name</th>
              <th className="py-3.5 px-6">Contact Info</th>
              <th className="py-3.5 px-6">Course of Interest</th>
              <th className="py-3.5 px-6">Channel</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Assigned Counsellor</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {demoLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {lead.full_name}
                  </Link>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">
                    Added {lead.created_at}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {lead.phone}
                    </p>
                    {lead.email && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {lead.email}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-xs text-slate-700 font-medium max-w-xs truncate">
                  {lead.course_interest}
                </td>
                <td className="py-4 px-6">
                  <Badge variant="slate" size="sm">
                    {lead.source}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(lead.status)}
                </td>
                <td className="py-4 px-6 text-xs text-slate-600">
                  {lead.assignee}
                </td>
                <td className="py-4 px-6 text-right">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Lead Modal Shell */}
      <Modal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        title="Add New Enquiry"
        description="Register a new student enquiry into the CRM admissions pipeline."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsAddLeadModalOpen(false)}>
              Save Lead (Phase 5)
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Student Full Name" placeholder="e.g. Rahul Sharma" required />
          <Input label="Phone Number" placeholder="e.g. +91 98765 43210" required />
          <Input label="Email Address (Optional)" placeholder="e.g. rahul@example.com" type="email" />
          <Input label="Target Course" placeholder="e.g. JEE Advanced 2027" required />
          <Select
            label="Enquiry Source"
            options={[
              { value: 'Website', label: 'Website Form' },
              { value: 'Walk-in', label: 'Walk-in (Campus)' },
              { value: 'Phone Call', label: 'Incoming Phone Call' },
              { value: 'Referral', label: 'Student / Parent Referral' },
              { value: 'Social Media', label: 'Social Media / Ad' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};
