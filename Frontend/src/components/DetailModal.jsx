import React from "react";

const DetailModal = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold capitalize">{title} Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✖
          </button>
        </div>

        {/* You can replace this with a nicely formatted view per type */}
        <div className="text-sm">
          <pre className="whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

