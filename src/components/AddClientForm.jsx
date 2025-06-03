import React, { useState } from 'react';

const AddClientForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    id: '',
    product: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Client Data:', formData);
    onClose();
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">Add New Client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Client Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="id"
          placeholder="Client ID"
          value={formData.id}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="product"
          placeholder="Product"
          value={formData.product}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientForm;