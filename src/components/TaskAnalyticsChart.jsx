import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './TaskAnalyticsChart.css';

// Register Chart.js components (Heavy library execution)
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function TaskAnalyticsChart({ tasks = [] }) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Doughnut Chart: Task Status Breakdown
  const doughnutData = {
    labels: ['Completed Tasks', 'Pending Tasks'],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0.85)'],
        borderColor: ['#10b981', '#f59e0b'],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 }
        }
      }
    }
  };

  // Bar Chart: Velocity / Distribution
  const barData = {
    labels: ['Sprint Backlog', 'In Progress', 'Code Review', 'Completed & Verified'],
    datasets: [
      {
        label: 'Task Allocation',
        data: [
          Math.max(1, pendingCount),
          Math.round(pendingCount * 0.6),
          Math.round(completedCount * 0.4),
          completedCount
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(168, 85, 247, 0.75)',
          'rgba(16, 185, 129, 0.75)'
        ],
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Development Lifecycle Velocity',
        color: '#94a3b8',
        font: { family: 'Inter', size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="analytics-chart-container">
      <div className="analytics-chart-header">
        <div className="chart-badge">
          <span className="badge-pulse"></span>
          <span>Heavy Third-Party Component (Chart.js Lazy Loaded)</span>
        </div>
        <h4>Task Metrics &amp; Performance Visualizer</h4>
        <p className="analytics-subtext">
          Loaded via dynamic <code>React.lazy()</code> chunk only when requested, saving initial page load bandwidth!
        </p>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h5>Completion Ratio</h5>
          <div className="canvas-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-box">
          <h5>Workflow Distribution</h5>
          <div className="canvas-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAnalyticsChart;
