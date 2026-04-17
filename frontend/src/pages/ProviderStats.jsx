import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

const ProviderStats = () => {
  const params = useParams();
  const { providerId } = params;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalJobs: 0,
    earningsTrend: [],
    ratingProgression: [],
    avgDistance: 0,
    categoryBreakdown: [],
    categoryAvgRating: []
  });

  const [loading, setLoading] = useState(true);

  // Helper function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1];
  };

  // Helper function to format earnings trend data with month names
  const formatEarningsTrend = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      monthName: `${getMonthName(item._id.month)} ${item._id.year}`,
      monthNumber: item._id.month,
      year: item._id.year,
      totalEarnings: item.totalEarnings
    }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!providerId) {
        console.log("Waiting for providerId...");
        return;
      }

      setLoading(true);
      
      try {
        console.log("Fetching stats for provider:", providerId);

        // Fetch analytics (total earnings and jobs)
        const analyticsResponse = await axios.get(`${API_BASE_URL}/api/analytics/${providerId}`);
        console.log('Analytics Data:', analyticsResponse.data);

        // Fetch rating progression (individual job ratings)
        const ratingProgressionResponse = await axios.get(`${API_BASE_URL}/api/rating-progression/${providerId}`);
        console.log('Rating Progression Data:', ratingProgressionResponse.data);

        // Fetch average distance
        const avgDistanceResponse = await axios.get(`${API_BASE_URL}/api/average-distance/${providerId}`);
        console.log('Average Distance Data:', avgDistanceResponse.data);

        // Fetch earnings trend
        const earningsTrendResponse = await axios.get(`${API_BASE_URL}/api/earnings-trend/${providerId}`);
        console.log('Earnings Trend Data:', earningsTrendResponse.data);

        // Fetch category breakdown (jobs count)
        const categoryBreakdownResponse = await axios.get(`${API_BASE_URL}/api/category-breakdown/${providerId}`);
        console.log('Category Breakdown Data:', categoryBreakdownResponse.data);

        // Fetch category average rating
        const categoryAvgRatingResponse = await axios.get(`${API_BASE_URL}/api/category-avg-rating/${providerId}`);
        console.log('Category Avg Rating Data:', categoryAvgRatingResponse.data);

        // Format earnings trend with month names
        const formattedEarningsTrend = formatEarningsTrend(earningsTrendResponse.data);

        setStats({
          totalEarnings: analyticsResponse.data[0]?.totalEarnings || 0,
          totalJobs: analyticsResponse.data[0]?.totalJobs || 0,
          earningsTrend: formattedEarningsTrend,
          ratingProgression: ratingProgressionResponse.data || [],
          avgDistance: avgDistanceResponse.data[0]?.averageDistance || 0,
          categoryBreakdown: categoryBreakdownResponse.data || [],
          categoryAvgRating: categoryAvgRatingResponse.data || [],
        });
        
      } catch (error) {
        console.error("Error fetching provider stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [providerId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-500">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Provider Statistics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Earnings</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalEarnings.toFixed(2)} BDT</p>
        </div>
        
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Jobs Completed</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
        </div>
        
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Average Distance Traveled</h3>
          <p className="text-3xl font-bold mt-2">{(stats.avgDistance / 1000).toFixed(2)} km</p>
        </div>
      </div>

      {/* Rating Progression - Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h4 className="text-xl font-bold mb-2">Rating Progression Over Time</h4>
        <p className="text-sm text-gray-500 mb-4">Shows the provider's average rating after each job</p>
        {stats.ratingProgression.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stats.ratingProgression}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="jobNumber" label={{ value: 'Job Number', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 5]} label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} ⭐`, 'Average Rating']} labelFormatter={(label) => `Job #${label}`} />
              <Legend />
              <Line type="monotone" dataKey="rating" stroke="#8884d8" name="Average Rating" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No rating data available yet.</p>
          </div>
        )}
      </div>

      {/* Earnings Trend - Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h4 className="text-xl font-bold mb-2">Earnings Trend</h4>
        <p className="text-sm text-gray-500 mb-4">Monthly earnings breakdown</p>
        {stats.earningsTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.earningsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Earnings (BDT)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} BDT`, 'Earnings']} labelFormatter={(label) => `${label}`} />
              <Legend />
              <Bar dataKey="totalEarnings" fill="#A7C7E7" name="Total Earnings" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No earnings data available yet.</p>
          </div>
        )}
      </div>

      {/* Job Category Breakdown - Two Side-by-Side Charts */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h4 className="text-xl font-bold mb-2">Job Category Breakdown</h4>
        <p className="text-sm text-gray-500 mb-4">Performance metrics by category</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Chart: Average Rating by Category */}
          <div>
            <h5 className="text-lg font-semibold mb-3 text-center">Average Rating by Category</h5>
            {stats.categoryAvgRating.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.categoryAvgRating}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" label={{ value: 'Category', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[0, 5]} label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)} ⭐`, 'Average Rating']} labelFormatter={(label) => `${label}`} />
                  <Legend />
                  <Bar dataKey="averageRating" fill="#8884d8" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg h-[400px] flex items-center justify-center">
                <p className="text-gray-500">No rating data available by category.</p>
              </div>
            )}
          </div>

          {/* Right Chart: Jobs Completed by Category */}
          <div>
            <h5 className="text-lg font-semibold mb-3 text-center">Jobs Completed by Category</h5>
            {stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" label={{ value: 'Category', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} jobs`, 'Jobs Completed']} labelFormatter={(label) => `${label}`} />
                  <Legend />
                  <Bar dataKey="jobsCompleted" fill="#82ca9d" name="Jobs Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg h-[400px] flex items-center justify-center">
                <p className="text-gray-500">No category data available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderStats;