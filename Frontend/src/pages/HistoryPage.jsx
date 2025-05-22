import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../services/api";
import DetailModal from "../components/DetailModal";
import { FaTrash } from "react-icons/fa";
// Error Boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }; // Update state to indicate error
  }

  componentDidCatch(error, info) {
    console.log("Error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500">
          Something went wrong. Please try again later.
        </div>
      );
    }

    return this.props.children;
  }
}

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 10;

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const params = {
        query: search,
        type: filterType || undefined,
        startDate: startDate || undefined,
        
        endDate: endDate || undefined,
       
        skip: (page - 1) * limit,
        limit,
      };
      console.log("startDate", startDate);
      console.log("endDate", endDate);
      const res = await API.get("/history", { params });

      if (res && res.data) {
        const sortedData = (res.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log("sortedData", sortedData);
        setHistoryData(sortedData);
        setCashBalance(res.data.cash_balance || 0);
        setBankBalance(res.data.bank_balance || 0);
        setTotalCount(res.data.totalCount || 0);
      } else {
        setError("No data received.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchHistory();
  };

  const getAmount = (item) => {
    if (item.type === "bill") return item.amount || 0;
    if (item.type === "customerOrder") return item.amountPrepaid || 0;
    if (item.type === "transaction"){
      if (item.transaction_type === "inflow") return item.amount || 0;
      else if (item.transaction_type === "outflow") return -item.amount || 0; 
    }
    return 0;
  };

  const getColor = (item) => {
    if (item.type === "bill")       return getAmount(item) > 0 ? "bg-green-100" : "bg-red-100";
    if (item.type === "customerOrder") return "bg-purple-100";
    if (item.type === "transaction")
      return getAmount(item) > 0 ? "bg-green-100" : "bg-red-100";
    return "";
  };
    
  const handleDelete = async (id, type) => {
    try {
      // Adjust endpoint and method as per your backend
      const res =  await API.delete(`/${type}s/${id}`);

      setHistoryData((prev) => prev.filter((item) => item._id !== id));
      if (res.data?.cash_balance !== undefined) {
        setCashBalance(res.data.cash_balance);
      }
      if (res.data?.bank_balance !== undefined) {
        setBankBalance(res.data.bank_balance);
      }

      toast.success("Deleted successfully");
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  // Return loading indicator or error message if applicable
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <div>
              <p>Search</p>
              <input
                type="text"
                value={search}
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-40"
              />
            </div>
            <div>
              <p>StartDate</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <p>EndDate</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border py-5 px-2 rounded "
            >
              <option value="">Select Type</option>
              <option value="bill">Bill</option>
              <option value="customerOrder">CustomerOrder</option>
              <option value="transaction">Transaction</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>

          <div className="text-right">
            <div>💵 Cash: ₹{cashBalance}</div>
            <div>🏦 Bank: ₹{bankBalance}</div>
          </div>
        </div>

        {/* History Cards */}
        <div className="grid gap-4">
          {historyData.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No Results Found
            </div>
          )}
          {historyData.map((item, index) => (
            <div
              key={index}
              className={`rounded shadow p-4 flex justify-between items-center ${getColor(
                item
              )}`}
            >
              <div>
                <div className="font-bold capitalize">{item.type}</div>
                <div>
                  <span className="text-gray-600">
                    {item.customer_name ||
                      item.name ||
                      item.description ||
                      "No name"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {item.createdAt &&
                    new Date(item.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="font-bold">
                  Amount : ₹{getAmount(item)}
                  {item.type === "bill" && (
                    <div className="font-bold">
                      {" "}
                      payment_paid :₹{item.amount_paid}
                      <br />
                      status : {item.payment_status}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-blue-600 hover:underline"
                >
                  Views
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.type)}
                  className="text-red-600 hover:underline"
                  title="Delete"
                >
                  {/* <FaTrash /> */}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div>
            Page {page} / {Math.ceil(totalCount / limit)}
          </div>
          <button
            disabled={page >= Math.ceil(totalCount / limit)}
            onClick={() => setPage((p) => p + 1)}
            className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <DetailModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            title={selectedItem?.type}
            data={selectedItem}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default HistoryPage;
