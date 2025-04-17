'use client';
import type React from 'react';
import { useState } from 'react';

const Donations = () => {
  const [values, setValues] = useState(['1', '5', '10', '20']);
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newValues = [...values];
    newValues[index] = event.target.value;
    setValues(newValues);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the values to your backend
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Configure Donations Section */}
      <h2 className="text-xl font-semibold mb-4">Configure your donation and tip options</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Preset Donation Amount</h3>
          {!isEditing ? (
            <button
              onClick={toggleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Save
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {values.map((value, index) => (
            <input
              key={index}
              type="number"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleChange(index, e)}
              disabled={!isEditing}
              min="0"
              placeholder={`Amount ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Donations;
