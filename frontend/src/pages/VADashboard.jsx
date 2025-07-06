import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const VADashboard = () => {
  const { user } = useAuth();
  const [timeLog, setTimeLog] = useState(null);
  const [eodReport, setEodReport] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [timeLogResponse, eodResponse, announcementsResponse] = await Promise.all([
        ApiService.getTodayTimeLog(),
        ApiService.getTodayEODReport(),
        ApiService.request('/announcements/recent')
      ]);

      setTimeLog(timeLogResponse.time_log);
      setEodReport(eodResponse.eod_report);
      setAnnouncements(announcementsResponse.announcements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      await ApiService.clockIn();
      await loadDashboardData();
    } catch (error) {
      console.error('Clock in error:', error);
      alert(error.message);
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      await ApiService.clockOut();
      await loadDashboardData();
    } catch (error) {
      console.error('Clock out error:', error);
      alert(error.message);
    } finally {
      setClockLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(timeString).toLocaleTimeString();
  };

  const getClockStatus = () => {
    if (!timeLog) return 'not_clocked_in';
    if (timeLog.clock_in && !timeLog.clock_out) return 'clocked_in';
    if (timeLog.clock_in && timeLog.clock_out) return 'clocked_out';
    return 'not_clocked_in';
  };

  const clockStatus = getClockStatus();

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
        <h1 className="text-3xl font-bold turma-brand-text">
          Welcome back, {user?.first_name}!
        </h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Clock In</p>
              <p className="text-lg">{formatTime(timeLog?.clock_in)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Clock Out</p>
              <p className="text-lg">{formatTime(timeLog?.clock_out)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Hours</p>
              <p className="text-lg">{timeLog?.total_hours || '0'} hours</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {clockStatus === 'not_clocked_in' && (
              <Button 
                onClick={handleClockIn} 
                disabled={clockLoading}
                variant="accent"
              >
                {clockLoading ? 'Clocking In...' : 'Clock In'}
              </Button>
            )}
            {clockStatus === 'clocked_in' && (
              <Button 
                onClick={handleClockOut} 
                disabled={clockLoading}
                variant="secondary"
              >
                {clockLoading ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            )}
            {clockStatus === 'clocked_out' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Completed for today</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Assigned Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {user?.assigned_client || 'No client assigned'}
            </p>
            {!user?.assigned_client && (
              <p className="text-sm text-muted-foreground mt-2">
                Contact your admin to get assigned to a client.
              </p>
            )}
          </CardContent>
        </Card>

        {/* EOD Report Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              EOD Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eodReport ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Submitted for today</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Not submitted yet</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Submit your end-of-day report before logging off.
            </p>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="mr-2 h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <p className="font-medium text-gray-900">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent announcements.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VADashboard;


