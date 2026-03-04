/**
 * Performance Stats Page for CodePilot vNext
 * Displays real-time metrics and historical trends
 */

import React from 'react';

interface PerformanceMetrics {
  parsingSpeed: number; // files per second
  memoryUsage: number; // MB
  memoryLimit: number; // MB
  cpuUsage: number; // percentage
  cacheHitRate: number; // percentage
}

interface PerformanceStatsProps {
  metrics: PerformanceMetrics;
  historicalData?: Array<{ date: string; parsingSpeed: number; memoryUsage: number }>;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  metrics,
  historicalData,
}) => {
  const memoryPercentage = (metrics.memoryUsage / metrics.memoryLimit) * 100;

  return (
    <div className="performance-stats">
      <h2>性能统计</h2>

      <section className="real-time-metrics">
        <h3>实时指标</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">解析速度</span>
            <span className="value">{metrics.parsingSpeed} 文件/秒</span>
          </div>
          <div className="metric">
            <span className="label">内存占用</span>
            <span className="value">{metrics.memoryUsage}MB / {metrics.memoryLimit}MB</span>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${memoryPercentage}%` }} />
            </div>
          </div>
          <div className="metric">
            <span className="label">CPU 使用率</span>
            <span className="value">{metrics.cpuUsage}%</span>
          </div>
          <div className="metric">
            <span className="label">缓存命中率</span>
            <span className="value">{metrics.cacheHitRate}%</span>
          </div>
        </div>
      </section>

      <section className="optimization-suggestions">
        <h3>优化建议</h3>
        <ul>
          {metrics.cacheHitRate >= 80 && <li>✓ 缓存命中率良好</li>}
          {memoryPercentage > 80 && <li>⚠️ 内存占用接近上限，建议清理缓存</li>}
          {metrics.cpuUsage < 30 && <li>✓ CPU 使用率正常</li>}
        </ul>
      </section>
    </div>
  );
};