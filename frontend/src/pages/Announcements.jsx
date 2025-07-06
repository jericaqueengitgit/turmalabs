import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, Pin, PinOff, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Announcements = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    is_pinned: false
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await ApiService.request('/announcements');
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewAnnouncement(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', content: '', is_pinned: false });
      setShowAddForm(false);
      loadAnnouncements();
      alert('Announcement created successfully!');
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert(error.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await ApiService.deleteAnnouncement(id);
        loadAnnouncements();
        alert('Announcement deleted successfully!');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert(error.message);
      }
    }
  };

  const handleTogglePin = async (announcement) => {
    try {
      await ApiService.updateAnnouncement(announcement.id, { is_pinned: !announcement.is_pinned });
      loadAnnouncements();
      alert('Announcement pin status updated!');
    } catch (error) {
      console.error('Error updating pin status:', error);
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
          <Megaphone className="mr-3 h-8 w-8" />
          Announcements
        </h1>
        {isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel Add' : 'Create New Announcement'}
          </Button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={newAnnouncement.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={newAnnouncement.is_pinned}
                  onChange={(e) => handleInputChange('is_pinned', e.target.checked)}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-900">Pin to top</label>
              </div>
              <Button type="submit" variant="accent">
                Create Announcement
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 relative">
                  {announcement.is_pinned && (
                    <Pin className="absolute top-3 right-3 h-5 w-5 text-blue-500 fill-blue-500" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Posted by {announcement.creator.first_name} {announcement.creator.last_name} on {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                  {isAdmin && (
                    <div className="mt-3 flex space-x-2">
                      <Button
                        onClick={() => handleTogglePin(announcement)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {announcement.is_pinned ? <PinOff className="h-4 w-4 mr-1" /> : <Pin className="h-4 w-4 mr-1" />}
                        {announcement.is_pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No announcements posted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;

