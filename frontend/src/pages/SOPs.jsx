import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, Download, Tag, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SOPs = () => {
  const { isAdmin } = useAuth();
  const [sops, setSops] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSOP, setNewSOP] = useState({
    title: '',
    description: '',
    file_url: '',
    category: '',
    tags: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadSOPs();
    if (!isAdmin) {
      loadReadStatus();
    }
  }, [isAdmin]);

  const loadSOPs = async () => {
    try {
      const response = await ApiService.request('/sops');
      setSops(response.sops);
    } catch (error) {
      console.error('Error loading SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReadStatus = async () => {
    try {
      const response = await ApiService.request('/sops/read_status');
      const status = {};
      response.read_sops.forEach(item => {
        status[item.sop_id] = true;
      });
      setReadStatus(status);
    } catch (error) {
      console.error('Error loading SOP read status:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewSOP(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSOP = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createSOP(newSOP);
      setNewSOP({ title: '', description: '', file_url: '', category: '', tags: '' });
      setShowAddForm(false);
      loadSOPs();
    } catch (error) {
      console.error('Error adding SOP:', error);
      alert(error.message);
    }
  };

  const handleMarkRead = async (sopId) => {
    try {
      await ApiService.markSOPRead(sopId);
      loadReadStatus();
      alert('SOP marked as read!');
    } catch (error) {
      console.error('Error marking SOP read:', error);
      alert(error.message);
    }
  };

  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sop.tags && sop.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === '' || sop.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(sops.map(sop => sop.category))].filter(Boolean);

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
          <FileCheck className="mr-3 h-8 w-8" />
          SOPs
        </h1>
        {isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
            <Upload className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel Add' : 'Add New SOP'}
          </Button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New SOP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSOP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  type="text"
                  value={newSOP.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={newSOP.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File URL (e.g., PDF, Google Doc) *</label>
                <Input
                  type="url"
                  value={newSOP.file_url}
                  onChange={(e) => handleInputChange('file_url', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  type="text"
                  value={newSOP.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  type="text"
                  value={newSOP.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
              </div>
              <Button type="submit" variant="accent">
                Add SOP
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All SOPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search SOPs..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {categories.length > 0 && (
              <select
                className="w-full md:w-auto h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {filteredSOPs.length > 0 ? (
            <div className="space-y-4">
              {filteredSOPs.map((sop) => (
                <div key={sop.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{sop.title}</h3>
                  {sop.description && (
                    <p className="text-sm text-muted-foreground mb-2">{sop.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <a href={sop.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      <Download className="h-4 w-4 mr-1" /> Download File
                    </a>
                    {sop.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag className="h-3 w-3 mr-1" /> {sop.category}
                      </span>
                    )}
                  </div>
                  {sop.tags && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Tags: {sop.tags}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-2">
                    Added by {sop.creator.first_name} {sop.creator.last_name} on {new Date(sop.created_at).toLocaleDateString()}
                  </p>
                  {!isAdmin && (
                    <div className="mt-3">
                      {readStatus[sop.id] ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" /> Marked as Read
                        </span>
                      ) : (
                        <Button onClick={() => handleMarkRead(sop.id)} variant="secondary" size="sm">
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No SOPs available yet or matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SOPs;

