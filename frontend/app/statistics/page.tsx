"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AutoMLPipeline() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [bestModel, setBestModel] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  interface DataProfile {
    overview: {
      rows: number;
      columns: number;
      missing_values: number;
      duplicate_rows: number;
    };
    columns: {
      [key: string]: {
        type: string;
        missing: number;
        unique: number;
        stats: {
          mean?: number;
          min?: number;
          max?: number;
          std?: number;
          top_value?: any;
          freq?: number;
          value_counts?: Record<string, number>;
        };
        sample_values: any[];
        distribution?: {
          bins?: number[];
          counts: number[];
          categories?: string[];
        };
      };
    };
    correlation: {
      matrix: Record<string, Record<string, number>> | null;
      highly_correlated: Array<{
        variable1: string;
        variable2: string;
        correlation: number;
      }> | null;
    };
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewData([]);
      setColumns([]);
      setDataProfile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8000/upload-dataset", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const result = await response.json();
      setColumns(result.columns);
      setPreviewData(result.sample_data);
      setDataProfile(result.profile);
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload error:", error);
      setPreviewData([]);
      setDataProfile(null);
    }
  };

  const handleTrainModel = () => {
    setIsTraining(true);
    // TODO: Implement actual model training logic
    setTimeout(() => {
      setBestModel("Random Forest Classifier (Accuracy: 92.5%)");
      setIsTraining(false);
    }, 2000);
  };

  const handleDownloadModel = () => {
    // TODO: Implement model download logic
    console.log("Downloading model...");
  };

  const createDistributionChartData = (distribution: {
    bins?: number[];
    counts: number[];
    categories?: string[];
  }) => {
    // For categorical data
    if (distribution.categories) {
      return {
        labels: distribution.categories,
        datasets: [
          {
            label: "Value Counts",
            data: distribution.counts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    // For numeric data
    const labels = distribution.bins?.slice(0, -1).map((bin, i) => {
      return `${bin.toFixed(2)}-${distribution.bins![i + 1].toFixed(2)}`;
    }) || [];

    return {
      labels,
      datasets: [
        {
          label: "Frequency",
          data: distribution.counts,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Automated Machine Learning Pipeline
      </h1>

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
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>

      {/* Preview Data Table */}
      {previewData && previewData.length > 0 && columns && columns.length > 0 && (
        <div className="mb-6 border rounded-lg overflow-hidden">
          <h3 className="bg-gray-100 p-2 font-medium">
            Dataset Preview (First 5 Rows)
          </h3>
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
        <h2 className="text-lg font-medium mb-2">Data Profiling</h2>
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          {dataProfile ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Overview</h3>
                <ul className="text-sm space-y-1">
                  <li>Rows: {dataProfile.overview.rows}</li>
                  <li>Columns: {dataProfile.overview.columns}</li>
                  <li>Missing Values: {dataProfile.overview.missing_values}</li>
                  <li>Duplicate Rows: {dataProfile.overview.duplicate_rows}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Column Statistics</h3>
                {Object.entries(dataProfile.columns).map(
                  ([colName, columnData]) => (
                    <div key={colName} className="mb-4 p-3 border rounded">
                      <h4 className="font-medium">{colName}</h4>
                      <ul className="text-sm space-y-1">
                        <li>Type: {columnData.type}</li>
                        <li>Missing: {columnData.missing}</li>
                        <li>Unique: {columnData.unique}</li>
                        {columnData.stats.mean !== undefined && (
                          <>
                            <li>Mean: {columnData.stats.mean.toFixed(2)}</li>
                            {columnData.stats.min !== undefined &&
                              columnData.stats.max !== undefined && (
                                <li>
                                  Range: {columnData.stats.min.toFixed(2)} -{" "}
                                  {columnData.stats.max.toFixed(2)}
                                </li>
                              )}
                          </>
                        )}
                      </ul>

                      {/* Distribution Chart - works for both numeric and categorical */}
                      {columnData.distribution && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">
                            {columnData.stats.value_counts
                              ? "Category Distribution"
                              : "Value Distribution"}
                          </h4>
                          <div className="h-48">
                            <Bar
                              data={createDistributionChartData(
                                columnData.distribution
                              )}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    title: {
                                      display: true,
                                      text: columnData.stats.value_counts
                                        ? "Count"
                                        : "Frequency",
                                    },
                                  },
                                  x: {
                                    title: {
                                      display: true,
                                      text: columnData.stats.value_counts
                                        ? "Categories"
                                        : "Value Range",
                                    },
                                    ticks: {
                                      autoSkip: false,
                                      maxRotation: columnData.stats.value_counts ? 45 : 0,
                                      minRotation: columnData.stats.value_counts ? 45 : 0,
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Correlation Analysis Section */}
                {dataProfile.correlation?.matrix && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Correlation Analysis</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Variable
                            </th>
                            {Object.keys(dataProfile.correlation.matrix).map(
                              (col) => (
                                <th
                                  key={col}
                                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {col}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(dataProfile.correlation.matrix).map(
                            ([rowKey, row]) => (
                              <tr key={rowKey}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {rowKey}
                                </td>
                                {Object.values(row).map((value, idx) => (
                                  <td
                                    key={idx}
                                    className={`px-4 py-2 whitespace-nowrap text-sm text-center ${
                                      Math.abs(value) > 0.7
                                        ? "font-bold text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {value.toFixed(2)}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {dataProfile.correlation.highly_correlated && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-1">
                          Highly Correlated Pairs (r &gt; 0.7):
                        </h4>
                        <ul className="text-sm space-y-1">
                          {dataProfile.correlation.highly_correlated.map(
                            (pair, idx) => (
                              <li key={idx}>
                                {pair.variable1} ↔ {pair.variable2} (r ={" "}
                                {pair.correlation.toFixed(2)})
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {selectedFile
                ? "Upload dataset to see profile"
                : "No dataset uploaded"}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Choose a column to predict</h2>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          disabled={columns.length === 0}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {columns.length ? "Select a column" : "Upload a file first"}
          </option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleTrainModel}
        disabled={!selectedColumn}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isTraining ? "Training..." : "Train Model"}
      </button>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Best Model</h2>
        <div className="p-4 border border-gray-200 rounded-md min-h-20 bg-gray-50">
          {bestModel ? (
            <p className="text-sm">{bestModel}</p>
          ) : (
            <p className="text-gray-500 italic">
              The best model will appear here after training
            </p>
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