import React, { useState } from 'react';

const RewardForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    title: { en: '', hi: '' },
    description: { en: '', hi: '' },
    type: 'physical',
    cost: 50,
    stock: 100
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
        [name]: name === 'cost' || name === 'stock' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form implementation */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Reward
        </button>
      </div>
    </form>
  );
};

export default RewardForm;
