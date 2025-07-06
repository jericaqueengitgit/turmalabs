import React, { useState, useEffect } from 'react';
import { CalendarDays, PlusCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequests = () => {
  const { isAdmin, user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadLeaveRequests();
    if (isAdmin) {
      loadUsers();
    }
  }, [filterStatus, filterUser, isAdmin]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (isAdmin && filterUser !== 'all') {
        params.user_id = filterUser;
      }
      const response = await ApiService.request('/leave-requests', params);
      setLeaveRequests(response.leave_requests);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await ApiService.submitLeaveRequest(newRequest);
      setNewRequest({ start_date: '', end_date: '', reason: '' });
      setShowAddForm(false);
      loadLeaveRequests();
      alert('Leave request submitted successfully!');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert(error.message);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await ApiService.updateLeaveRequest(requestId, { status });
      loadLeaveRequests();
      alert(`Leave request ${status} successfully!`);
    } catch (error) {
      console.error('Error updating leave request status:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold turma-brand-text flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" />
          Leave Requests
        </h1>
        {!isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel Request' : 'Submit New Request'}
          </Button>
        )}
      </div>

      {!isAdmin && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <Input
                  type="date"
                  value={newRequest.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date *</label>
                <Input
                  type="date"
                  value={newRequest.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reason *</label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={newRequest.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="accent">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select
              className="w-full md:w-auto h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {isAdmin && users.length > 0 && (
              <select
                className="w-full md:w-auto h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="all">All Team Members</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                ))}
              </select>
            )}
          </div>

          {leaveRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.user.first_name} {request.user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      {isAdmin && request.status === 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => handleUpdateRequestStatus(request.id, 'approved')}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleUpdateRequestStatus(request.id, 'rejected')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                      {isAdmin && request.status !== 'pending' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className="text-gray-500">Reviewed</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No leave requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequests;

