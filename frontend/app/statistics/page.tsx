"use client";

import { useState } from 'react';

export default function AutoMLPipeline() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [dataProfilingResults, setDataProfilingResults] = useState<string | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewData([]);
      setColumns([]);
    }
  };

const handleUpload = async () => {
  if (!selectedFile) return;

  try {
    setPreviewData([]);
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch('http://localhost:8000/upload-dataset', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Upload failed');
    }

    const result = await response.json();
    setColumns(result.columns);
    setPreviewData(result.sample_data);
    console.log('Upload successful:', result);

  } catch (error) {
    console.error('Upload error:', error);
    setPreviewData([]);
  }
};

  const handleTrainModel = () => {
    setIsTraining(true);
    // TODO: Implement actual model training logic
    setTimeout(() => {
      setDataProfilingResults('Data profiling completed. 10 features analyzed. No missing values detected.');
      setBestModel('Random Forest Classifier (Accuracy: 92.5%)');
      setIsTraining(false);
    }, 2000);
  };

  const handleDownloadModel = () => {
    // TODO: Implement model download logic
    console.log('Downloading model...');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Automated Machine Learning Pipeline</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Choose a dataset to upload</h2>
        <input
          id="dataset-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
        )}
      </div>
      
      {/* Preview Data Table */}
      {previewData && previewData.length > 0 && columns && columns.length > 0 && (
        <div className="mb-6 border rounded-lg overflow-hidden">
          <h3 className="bg-gray-100 p-2 font-medium">Dataset Preview (First 5 Rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th 
                      key={col} 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td 
                        key={`${i}-${col}`} 
                        className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                      >
                        {row[col]?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Upload
      </button>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Choose a column to predict</h2>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          disabled={columns.length === 0}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">{columns.length ? "Select a column" : "Upload a file first"}</option>
          {columns.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>
      
      <button
        onClick={handleTrainModel}
        disabled={!selectedColumn}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isTraining ? 'Training...' : 'Train Model'}
      </button>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Data Profiling</h2>
        <div className="p-4 border border-gray-200 rounded-md min-h-20 bg-gray-50">
          {dataProfilingResults ? (
            <pre className="text-sm">{dataProfilingResults}</pre>
          ) : (
            <p className="text-gray-500 italic">Results will appear here after training</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Best Model</h2>
        <div className="p-4 border border-gray-200 rounded-md min-h-20 bg-gray-50">
          {bestModel ? (
            <p className="text-sm">{bestModel}</p>
          ) : (
            <p className="text-gray-500 italic">The best model will appear here after training</p>
          )}
        </div>
      </div>
      
      <button
        onClick={handleDownloadModel}
        disabled={!bestModel}
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Download Model
      </button>
    </div>
  );
}
