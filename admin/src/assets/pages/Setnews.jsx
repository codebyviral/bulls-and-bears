import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import Swal from 'sweetalert2';

function Setnews() {
  const handleBack = () => {
    window.history.back();
  };
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sector: '',
    changePercent: '',
    durationSec: '1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sectors = [
    'Oil & Gas / Conglomerate',
    'Banking',
    'IT / Software',
    'FMCG',
    'Automobile',
    'Financial Services / NBFC',
    'Financial Services',
    'Telecom',
    'Food & Beverages',
    'Pharmaceuticals',
    'Mining / Coal',
    'Automotive (Premium)',
    'Diversified / Cement',
    'Consumer Goods / Tobacco',
    'Construction & Engineering',
    'Food / Packaged Foods',
    'Power / Utilities',
    'Oil & Natural Gas'
  ];

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    // If changing duration, show SweetAlert confirmation
    if (name === 'durationSec' && value !== formData.durationSec) {
      const result = await Swal.fire({
        title: 'Change Duration?',
        text: 'Are you sure you want to change the duration?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, change it',
        cancelButtonText: 'No, keep default'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title || !formData.description || !formData.sector || 
        !formData.changePercent || !formData.durationSec) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trend/sector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          sector: formData.sector,
          changePercent: parseFloat(formData.changePercent),
          durationSec: parseInt(formData.durationSec)
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show SweetAlert success
        await Swal.fire({
          title: 'Success!',
          text: 'News published successfully!',
          icon: 'success',
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'Great!'
        });
        
        setSuccess('News published successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          sector: '',
          changePercent: '',
          durationSec: '1'
        });
      } else {
        setError(data.message || 'Failed to publish news. Please try again.');
      }
    } catch (err) {
      console.error('Error publishing news:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Set News</h1>
          <p className="text-gray-600 mt-2">Publish sector news and market trends</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter news title"
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter news description"
                rows="4"
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
              />
            </div>

            {/* Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a sector</option>
                {sectors.map((sector, index) => (
                  <option key={index} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Change Percent and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Change Percent */}
              <div>
                <label htmlFor="changePercent" className="block text-sm font-medium text-gray-700 mb-2">
                  Change Percent (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="changePercent"
                  name="changePercent"
                  value={formData.changePercent}
                  onChange={handleChange}
                  placeholder="e.g., 0.02 or -0.02/ 0.02 = 2% changes"
                  step="0.01"
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="durationSec" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="durationSec"
                  name="durationSec"
                  value={formData.durationSec}
                  onChange={handleChange}
                  placeholder="Default: 1"
                  min="1"
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Default is 1 second. Change only if necessary.</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center space-x-2 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish News</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setnews;