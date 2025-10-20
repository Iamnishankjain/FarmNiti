import React, { useState } from 'react';

const MissionForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    title: { en: '', hi: '' },
    description: { en: '', hi: '' },
    category: 'organic',
    difficulty: 'medium',
    season: 'all',
    crop: '',
    duration: { value: 7, unit: 'days' },
    rewards: { xp: 50, greenCoins: 30, badge: '' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields similar to ManageMissions */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Mission
        </button>
      </div>
    </form>
  );
};

export default MissionForm;
