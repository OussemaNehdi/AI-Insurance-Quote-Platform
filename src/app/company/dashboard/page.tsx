'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CompanyDashboard() {
  // State for form settings (will be connected to backend later)
  const [formSettings, setFormSettings] = useState({
    companyName: '',
    ageMultipliers: [
      { minAge: 18, maxAge: 25, multiplier: 1.5 },
      { minAge: 26, maxAge: 40, multiplier: 1.0 },
      { minAge: 41, maxAge: 60, multiplier: 1.2 },
      { minAge: 61, maxAge: 100, multiplier: 1.8 },
    ],
    locationMultipliers: [
      { country: 'US', multiplier: 1.0 },
      { country: 'Canada', multiplier: 1.1 },
      { country: 'UK', multiplier: 1.2 },
      { country: 'Other', multiplier: 1.3 },
    ],
    insuranceTypes: [
      { type: 'Auto', baseRate: 1000 },
      { type: 'Home', baseRate: 1200 },
      { type: 'Life', baseRate: 800 },
      { type: 'Health', baseRate: 1500 },
    ]
  });

  // Function to update age multipliers
  const updateAgeMultiplier = (index: number, field: string, value: any) => {
    const newAgeMultipliers = [...formSettings.ageMultipliers];
    newAgeMultipliers[index] = { ...newAgeMultipliers[index], [field]: value };
    setFormSettings({ ...formSettings, ageMultipliers: newAgeMultipliers });
  };

  // Function to update location multipliers
  const updateLocationMultiplier = (index: number, field: string, value: any) => {
    const newLocationMultipliers = [...formSettings.locationMultipliers];
    newLocationMultipliers[index] = { ...newLocationMultipliers[index], [field]: value };
    setFormSettings({ ...formSettings, locationMultipliers: newLocationMultipliers });
  };

  // Function to update insurance types
  const updateInsuranceType = (index: number, field: string, value: any) => {
    const newInsuranceTypes = [...formSettings.insuranceTypes];
    newInsuranceTypes[index] = { ...newInsuranceTypes[index], [field]: value };
    setFormSettings({ ...formSettings, insuranceTypes: newInsuranceTypes });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Save settings to database
    console.log('Form settings saved:', formSettings);
    
    // Show success message or redirect
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
        <p className="text-gray-600 mt-2">Configure your insurance parameters and rates</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div>
            <label className="block mb-2">Company Name</label>
            <input
              type="text"
              value={formSettings.companyName}
              onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your company name"
            />
          </div>
        </div>

        {/* Age Multipliers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Age Multipliers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Min Age</th>
                  <th className="px-4 py-2 text-left">Max Age</th>
                  <th className="px-4 py-2 text-left">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {formSettings.ageMultipliers.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.minAge}
                        onChange={(e) => updateAgeMultiplier(index, 'minAge', parseInt(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.maxAge}
                        onChange={(e) => updateAgeMultiplier(index, 'maxAge', parseInt(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={item.multiplier}
                        onChange={(e) => updateAgeMultiplier(index, 'multiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Multipliers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Location Multipliers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-left">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {formSettings.locationMultipliers.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.country}
                        onChange={(e) => updateLocationMultiplier(index, 'country', e.target.value)}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={item.multiplier}
                        onChange={(e) => updateLocationMultiplier(index, 'multiplier', parseFloat(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Insurance Types</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Base Rate ($)</th>
                </tr>
              </thead>
              <tbody>
                {formSettings.insuranceTypes.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.type}
                        onChange={(e) => updateInsuranceType(index, 'type', e.target.value)}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.baseRate}
                        onChange={(e) => updateInsuranceType(index, 'baseRate', parseInt(e.target.value))}
                        className="w-full px-3 py-1 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
