"use client";

import { useState } from 'react';

export default function AutoMLPipeline() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [dataProfilingResults, setDataProfilingResults] = useState<string | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // TODO: Parse file to extract columns (this is a placeholder)
      // In a real app, you would parse the CSV/Excel file here
      const mockColumns = ['Column1', 'Column2', 'Column3', 'Target'];
      setColumns(mockColumns);
    }
  };

  const handleUpload = () => {
    // TODO: Implement actual file upload logic
    console.log('File uploaded:', selectedFile?.name);
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
        <label className="block text-sm font-medium mb-2" htmlFor="dataset-upload">
          Choose a dataset to upload
        </label>
        <input
          id="dataset-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
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
