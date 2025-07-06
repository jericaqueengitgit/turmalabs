import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, CheckCircle, FileText, Video, ExternalLink, Filter, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import localTrainingData from '../data/trainings.json'; // Import local JSON data

const Trainings = () => {
  const { isAdmin, user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSkillLevel, setFilterSkillLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    url: '',
    file_url: '',
    video_url: '',
    category: '',
    skill_level: '',
    tags: ''
  });

  useEffect(() => {
    loadTrainings();
    if (!isAdmin) {
      loadProgress();
    }
  }, [isAdmin]);

  const loadTrainings = async () => {
    try {
      // Use local training data instead of API call
      setTrainings(localTrainingData.map((training, index) => ({ ...training, id: index.toString() })));
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await ApiService.request('/trainings/progress');
      const userProgress = {};
      response.progress.forEach(item => {
        userProgress[item.training_id] = item.completed;
      });
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading training progress:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewTraining(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTraining = async (e) => {
    e.preventDefault();
    try {
      // For now, adding new training will only update the local state
      // In a real application, this would involve an API call to persist data
      setTrainings(prev => [...prev, { ...newTraining, id: Date.now().toString() }]);
      setNewTraining({ 
        title: '', 
        description: '', 
        url: '',
        file_url: '', 
        video_url: '',
        category: '',
        skill_level: '',
        tags: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding training:', error);
      alert(error.message);
    }
  };

  const handleBulkImport = async () => {
    try {
      // Bulk import will now just reload the local data
      loadTrainings();
      alert('Trainings imported successfully!');
      setShowBulkImport(false);
    } catch (error) {
      console.error('Error importing trainings:', error);
      alert('Failed to import trainings');
    }
  };

  const handleMarkComplete = async (trainingId) => {
    try {
      await ApiService.markTrainingComplete(trainingId);
      loadProgress();
      alert('Training marked as complete!');
    } catch (error) {
      console.error('Error marking training complete:', error);
      alert(error.message);
    }
  };

  const getFilteredTrainings = () => {
    return trainings.filter(training => {
      const matchesSearch = training.tutorial_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (training.description && training.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || training.category === filterCategory;
      const matchesSkillLevel = !filterSkillLevel || training.difficulty === filterSkillLevel;
      
      return matchesSearch && matchesCategory && matchesSkillLevel;
    });
  };

  const getCategories = () => {
    const categories = [...new Set(trainings.map(t => t.category).filter(Boolean))];
    return categories.sort();
  };

  const getSkillLevels = () => {
    const levels = [...new Set(trainings.map(t => t.difficulty).filter(Boolean))];
    return levels.sort();
  };

  const parseTagsFromString = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(',').map(tag => tag.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const filteredTrainings = getFilteredTrainings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold turma-brand-text flex items-center">
          <BookOpen className="mr-3 h-8 w-8" />
          Trainings
        </h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setShowBulkImport(true)} variant="secondary">
              <Upload className="mr-2 h-4 w-4" />
              Import VA Trainings
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
              <Upload className="mr-2 h-4 w-4" />
              {showAddForm ? 'Cancel Add' : 'Add New Training'}
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Skill Level</label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={filterSkillLevel}
                onChange={(e) => setFilterSkillLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {getSkillLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterSkillLevel('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import VA Training Resources</h2>
            <p className="text-gray-600 mb-4">
              This will import 20 curated VA training resources covering productivity tools, 
              project management, communication, and professional development.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90"
              >
                Import Trainings
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Training</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTraining} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    type="text"
                    value={newTraining.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    type="text"
                    value={newTraining.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Productivity, Marketing"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={newTraining.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Skill Level</label>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value={newTraining.skill_level}
                    onChange={(e) => handleInputChange('skill_level', e.target.value)}
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <Input
                    type="text"
                    value={newTraining.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="e.g., productivity, tools, automation"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Training URL</label>
                <Input
                  type="url"
                  value={newTraining.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">File URL (PDF, Doc, etc.)</label>
                  <Input
                    type="url"
                    value={newTraining.file_url}
                    onChange={(e) => handleInputChange('file_url', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL (YouTube, Vimeo)</label>
                  <Input
                    type="url"
                    value={newTraining.video_url}
                    onChange={(e) => handleInputChange('video_url', e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" variant="accent">
                Add Training
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredTrainings.length === 0 && !loading && (
        <p className="text-center text-gray-500">No trainings found matching your criteria.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{training.tutorial_title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {training.category && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    <Filter className="h-3 w-3 mr-1" />{training.category}
                  </span>
                )}
                {training.difficulty && (
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    <Tag className="h-3 w-3 mr-1" />{training.difficulty}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">{training.description}</p>
              <div className="space-y-2">
                {training.tutorial_url && (
                  <a 
                    href={training.tutorial_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-accent hover:underline text-sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Read Tutorial
                  </a>
                )}
                {training.video_url && (
                  <a 
                    href={training.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-accent hover:underline text-sm"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Watch Video
                  </a>
                )}
                {training.file_url && (
                  <a 
                    href={training.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-accent hover:underline text-sm"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </a>
                )}
              </div>
              {training.tags && (
                <div className="mt-3 text-xs text-gray-500">
                  Tags: {parseTagsFromString(training.tags).map((tag, index) => (
                    <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 mr-1 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            {!isAdmin && (
              <div className="p-4 border-t border-border">
                <Button 
                  onClick={() => handleMarkComplete(training.id)}
                  disabled={progress[training.id]}
                  className="w-full"
                  variant={progress[training.id] ? 'success' : 'outline'}
                >
                  {progress[training.id] ? (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Completed</>
                  ) : (
                    'Mark as Complete'
                  )}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Trainings;


