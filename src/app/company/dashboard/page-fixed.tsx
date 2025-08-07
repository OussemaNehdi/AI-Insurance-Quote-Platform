'use client';

import { useState, useEffect } from 'react';
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash, PlusCircle, Save, ArrowLeft } from "lucide-react";
import { InsuranceType, InsuranceField, FieldOption, FieldBracket } from '@/lib/types';

export default function Dashboard() {
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Check for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    } else {
      // Initialize insurance types for the company
      initializeInsuranceTypes();
    }
  }, [router]);

  // Initialize insurance types
  const initializeInsuranceTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // First try to get existing insurance types
      const getResponse = await fetch('/api/insurance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const getData = await getResponse.json();

      if (getData.success && getData.data && getData.data.length > 0) {
        setInsuranceTypes(getData.data);
      } else {
        // If no insurance types exist, initialize default ones
        const initResponse = await fetch('/api/insurance/init', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const initData = await initResponse.json();

        if (initData.success) {
          setInsuranceTypes(initData.data);
          setSuccess('Default insurance types created');
        } else {
          setError(initData.error || 'Failed to initialize insurance types');
        }
      }
    } catch (err) {
      console.error('Error initializing insurance types:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Save all insurance types
  const saveInsuranceTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch('/api/insurance', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insuranceTypes
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Insurance settings saved successfully!');
        
        // Auto hide success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to save insurance settings');
      }
    } catch (err) {
      console.error('Error saving insurance types:', err);
      setError('Failed to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new insurance type
  const addInsuranceType = () => {
    const newType: InsuranceType = {
      type: `type_${Date.now()}`,
      displayName: 'New Insurance Type',
      basePrice: 100,
      fields: [
        {
          name: 'age',
          label: 'What is your age?',
          type: 'range',
          fallbackMultiplier: 1.07, // 7% increase
          brackets: [
            { min: 18, max: 25, multiplier: 1.1 }, // 10% increase
            { min: 26, max: 99, multiplier: 1.0 }
          ]
        },
        {
          name: 'gender',
          label: 'What is your gender?',
          type: 'select',
          fallbackMultiplier: 1.0,
          options: [
            { value: 'Male', multiplier: 1.05 }, // 5% increase
            { value: 'Female', multiplier: 1.0 }
          ]
        }
      ]
    };
    
    setInsuranceTypes([...insuranceTypes, newType]);
  };

  // Delete an insurance type
  const deleteInsuranceType = (index: number) => {
    const updatedTypes = [...insuranceTypes];
    updatedTypes.splice(index, 1);
    setInsuranceTypes(updatedTypes);
  };

  // Add a new field to an insurance type
  const addField = (typeIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    const newField: InsuranceField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'select',
      fallbackMultiplier: 1.0,
      options: [
        { value: 'Default Option', multiplier: 1.0 }
      ]
    };
    
    updatedTypes[typeIndex].fields.push(newField);
    setInsuranceTypes(updatedTypes);
  };

  // Delete a field from an insurance type
  const deleteField = (typeIndex: number, fieldIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    updatedTypes[typeIndex].fields.splice(fieldIndex, 1);
    setInsuranceTypes(updatedTypes);
  };

  // Handle insurance type changes
  const handleInsuranceTypeChange = (typeIndex: number, field: string, value: any) => {
    const updatedTypes = [...insuranceTypes];
    updatedTypes[typeIndex] = {
      ...updatedTypes[typeIndex],
      [field]: value
    };
    setInsuranceTypes(updatedTypes);
  };

  // Handle field changes
  const handleFieldChange = (typeIndex: number, fieldIndex: number, field: string, value: any) => {
    const updatedTypes = [...insuranceTypes];
    updatedTypes[typeIndex].fields[fieldIndex] = {
      ...updatedTypes[typeIndex].fields[fieldIndex],
      [field]: value
    };
    
    // Initialize options or brackets based on field type
    if (field === 'type') {
      if (value === 'select') {
        updatedTypes[typeIndex].fields[fieldIndex].options = [
          { value: 'Default Option', multiplier: 1.0 }
        ];
        delete updatedTypes[typeIndex].fields[fieldIndex].brackets;
      } else if (value === 'range') {
        updatedTypes[typeIndex].fields[fieldIndex].brackets = [
          { min: 0, max: 50, multiplier: 1.05 } // 5% increase
        ];
        delete updatedTypes[typeIndex].fields[fieldIndex].options;
      }
    }
    
    setInsuranceTypes(updatedTypes);
  };

  // Add a new option to a select field
  const addOption = (typeIndex: number, fieldIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    const options = updatedTypes[typeIndex].fields[fieldIndex].options || [];
    options.push({ value: 'New Option', multiplier: 1.0 });
    updatedTypes[typeIndex].fields[fieldIndex].options = options;
    setInsuranceTypes(updatedTypes);
  };

  // Delete an option from a select field
  const deleteOption = (typeIndex: number, fieldIndex: number, optionIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    const options = updatedTypes[typeIndex].fields[fieldIndex].options || [];
    options.splice(optionIndex, 1);
    updatedTypes[typeIndex].fields[fieldIndex].options = options;
    setInsuranceTypes(updatedTypes);
  };

  // Handle option changes
  const handleOptionChange = (typeIndex: number, fieldIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedTypes = [...insuranceTypes];
    const options = updatedTypes[typeIndex].fields[fieldIndex].options || [];
    options[optionIndex] = {
      ...options[optionIndex],
      [field]: field === 'multiplier' ? parseFloat(value) : value
    };
    updatedTypes[typeIndex].fields[fieldIndex].options = options;
    setInsuranceTypes(updatedTypes);
  };

  // Add a new bracket to a range field
  const addBracket = (typeIndex: number, fieldIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    const brackets = updatedTypes[typeIndex].fields[fieldIndex].brackets || [];
    const lastBracket = brackets.length > 0 ? brackets[brackets.length - 1] : null;
    
    const newMin = lastBracket ? lastBracket.max + 1 : 0;
    const newMax = lastBracket ? lastBracket.max + 50 : 50;
    
    brackets.push({ min: newMin, max: newMax, multiplier: 1.0 });
    updatedTypes[typeIndex].fields[fieldIndex].brackets = brackets;
    setInsuranceTypes(updatedTypes);
  };

  // Delete a bracket from a range field
  const deleteBracket = (typeIndex: number, fieldIndex: number, bracketIndex: number) => {
    const updatedTypes = [...insuranceTypes];
    const brackets = updatedTypes[typeIndex].fields[fieldIndex].brackets || [];
    brackets.splice(bracketIndex, 1);
    updatedTypes[typeIndex].fields[fieldIndex].brackets = brackets;
    setInsuranceTypes(updatedTypes);
  };

  // Handle bracket changes
  const handleBracketChange = (typeIndex: number, fieldIndex: number, bracketIndex: number, field: string, value: any) => {
    const updatedTypes = [...insuranceTypes];
    const brackets = updatedTypes[typeIndex].fields[fieldIndex].brackets || [];
    brackets[bracketIndex] = {
      ...brackets[bracketIndex],
      [field]: field === 'multiplier' ? parseFloat(value) : parseInt(value)
    };
    updatedTypes[typeIndex].fields[fieldIndex].brackets = brackets;
    setInsuranceTypes(updatedTypes);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <MaxWidthWrapper className="py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Insurance Settings</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Configure your company's insurance offerings
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Success and Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Insurance Products</h2>
              <Button onClick={addInsuranceType}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Insurance Type
              </Button>
            </div>

            {/* Insurance Types */}
            {insuranceTypes.map((insuranceType, typeIndex) => (
              <Card key={typeIndex} className="mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{insuranceType.displayName}</CardTitle>
                      <CardDescription>
                        <span className="mr-2">Display Name:</span>
                        <Input 
                          value={insuranceType.displayName}
                          onChange={(e) => handleInsuranceTypeChange(typeIndex, 'displayName', e.target.value)}
                          className="inline-block w-48 ml-2"
                        />
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <Label htmlFor={`basePrice-${typeIndex}`}>Base Price</Label>
                        <Input
                          id={`basePrice-${typeIndex}`}
                          type="number"
                          value={insuranceType.basePrice}
                          onChange={(e) => handleInsuranceTypeChange(typeIndex, 'basePrice', parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => deleteInsuranceType(typeIndex)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Insurance Fields</h3>
                    {insuranceType.fields.map((field, fieldIndex) => (
                      <Card key={fieldIndex} className="mb-4">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Field Label and Name */}
                            <div className="md:col-span-5">
                              <div className="mb-3">
                                <Label htmlFor={`field-label-${typeIndex}-${fieldIndex}`}>Field Label</Label>
                                <Input
                                  id={`field-label-${typeIndex}-${fieldIndex}`}
                                  value={field.label}
                                  onChange={(e) => handleFieldChange(typeIndex, fieldIndex, 'label', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`field-name-${typeIndex}-${fieldIndex}`}>Field Name</Label>
                                <Input
                                  id={`field-name-${typeIndex}-${fieldIndex}`}
                                  value={field.name}
                                  onChange={(e) => handleFieldChange(typeIndex, fieldIndex, 'name', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            {/* Field Type and Fallback Multiplier */}
                            <div className="md:col-span-4">
                              <div className="mb-3">
                                <Label htmlFor={`field-type-${typeIndex}-${fieldIndex}`}>Field Type</Label>
                                <select
                                  id={`field-type-${typeIndex}-${fieldIndex}`}
                                  value={field.type}
                                  onChange={(e) => handleFieldChange(typeIndex, fieldIndex, 'type', e.target.value as 'select' | 'range')}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                >
                                  <option value="select">Select (Dropdown)</option>
                                  <option value="range">Range (Number Brackets)</option>
                                </select>
                              </div>
                              <div>
                                <Label htmlFor={`fallback-multiplier-${typeIndex}-${fieldIndex}`}>Default Rate (%)</Label>
                                <Input
                                  id={`fallback-multiplier-${typeIndex}-${fieldIndex}`}
                                  type="number"
                                  value={Math.round((field.fallbackMultiplier - 1) * 100)}
                                  onChange={(e) => handleFieldChange(
                                    typeIndex, 
                                    fieldIndex, 
                                    'fallbackMultiplier', 
                                    1 + (parseFloat(e.target.value) / 100)
                                  )}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-3 flex justify-end items-center">
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteField(typeIndex, fieldIndex)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Field
                              </Button>
                            </div>
                          </div>

                          {/* Field Type Specific Configuration */}
                          <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                            {field.type === 'select' && (
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-medium">Options</h4>
                                  <Button size="sm" onClick={() => addOption(typeIndex, fieldIndex)}>
                                    <PlusCircle className="h-3 w-3 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                
                                {field.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2">
                                    <div className="md:col-span-6">
                                      <Input
                                        value={option.value}
                                        onChange={(e) => handleOptionChange(typeIndex, fieldIndex, optionIndex, 'value', e.target.value)}
                                        placeholder="Option Value"
                                      />
                                    </div>
                                    <div className="md:col-span-4">
                                      <Input
                                        type="number"
                                        value={Math.round((option.multiplier - 1) * 100)}
                                        onChange={(e) => handleOptionChange(typeIndex, fieldIndex, optionIndex, 'multiplier', 1 + (parseFloat(e.target.value) / 100))}
                                        placeholder="Rate %"
                                      />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                      <Button 
                                        variant="ghost" 
                                        className="h-10 w-10 p-0" 
                                        onClick={() => deleteOption(typeIndex, fieldIndex, optionIndex)}
                                      >
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}

                                {(!field.options || field.options.length === 0) && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">No options defined. Click "Add Option" to add your first option.</p>
                                )}
                              </div>
                            )}

                            {field.type === 'range' && (
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-medium">Brackets</h4>
                                  <Button size="sm" onClick={() => addBracket(typeIndex, fieldIndex)}>
                                    <PlusCircle className="h-3 w-3 mr-1" />
                                    Add Bracket
                                  </Button>
                                </div>
                                
                                {field.brackets?.map((bracket, bracketIndex) => (
                                  <div key={bracketIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2">
                                    <div className="md:col-span-3">
                                      <Input
                                        type="number"
                                        value={bracket.min}
                                        onChange={(e) => handleBracketChange(typeIndex, fieldIndex, bracketIndex, 'min', e.target.value)}
                                        placeholder="Min Value"
                                      />
                                    </div>
                                    <div className="md:col-span-3">
                                      <Input
                                        type="number"
                                        value={bracket.max}
                                        onChange={(e) => handleBracketChange(typeIndex, fieldIndex, bracketIndex, 'max', e.target.value)}
                                        placeholder="Max Value"
                                      />
                                    </div>
                                    <div className="md:col-span-4">
                                      <Input
                                        type="number"
                                        value={Math.round((bracket.multiplier - 1) * 100)}
                                        onChange={(e) => handleBracketChange(typeIndex, fieldIndex, bracketIndex, 'multiplier', 1 + (parseFloat(e.target.value) / 100))}
                                        placeholder="Rate %"
                                      />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                      <Button 
                                        variant="ghost" 
                                        className="h-10 w-10 p-0" 
                                        onClick={() => deleteBracket(typeIndex, fieldIndex, bracketIndex)}
                                      >
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}

                                {(!field.brackets || field.brackets.length === 0) && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">No brackets defined. Click "Add Bracket" to add your first bracket.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button onClick={() => addField(typeIndex)} className="mt-2">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {insuranceTypes.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-300 mb-4">You don't have any insurance types set up yet.</p>
                <Button onClick={addInsuranceType}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Insurance Type
                </Button>
              </div>
            )}

            {insuranceTypes.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={saveInsuranceTypes}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
            )}
          </>
        )}
      </MaxWidthWrapper>
    </div>
  );
}
