import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">
        Automatic Machine Learning Model Builder
      </h1>

      {/* Search Bar */}
      <div className="border border-black p-2">
        <input
          type="text"
          placeholder="Search a player"
          className="w-full outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-black">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="border border-black">
              <th className="border border-black px-4 py-2">Name</th>
              <th className="border border-black px-4 py-2">Stat1</th>
              <th className="border border-black px-4 py-2">Stat2</th>
              <th className="border border-black px-4 py-2">Stat3</th>
              <th className="border border-black px-4 py-2">Stat4</th>
              <th className="border border-black px-4 py-2">Stat5</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border border-black">
                <td className="border border-black px-4 py-2">Player {i}</td>
                <td className="border border-black px-4 py-2"></td>
                <td className="border border-black px-4 py-2"></td>
                <td className="border border-black px-4 py-2"></td>
                <td className="border border-black px-4 py-2"></td>
                <td className="border border-black px-4 py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      {/* Stat Buttons */}
      <div className="grid grid-cols-5 gap-2 border border-black p-4">
        {Array.from({ length: 15 }, (_, i) => (
          <button
            key={i}
            className="border border-black px-4 py-2 hover:bg-gray-100"
          >
            Stat {i + 1}
          </button>
        ))}
      </div>

      {/* Create Model Button */}
      <div className="flex justify-end">
        <button className="border border-black px-6 py-2 hover:bg-black hover:text-white">
          Create Model
        </button>
      </div>
    </div>
  );
}

