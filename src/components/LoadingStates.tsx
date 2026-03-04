/**
 * Loading State Components for CodePilot vNext
 * Displays parsing progress, inference status, and vector retrieval status
 */

import React from 'react';

interface ParsingProgressProps {
  current: number;
  total: number;
  speed: number; // files per second
  estimatedRemaining: number; // seconds
  onCancel?: () => void;
}

export const ParsingProgress: React.FC<ParsingProgressProps> = ({
  current,
  total,
  speed,
  estimatedRemaining,
  onCancel,
}) => {
  const percentage = Math.round((current / total) * 100);
  const remainingMinutes = Math.floor(estimatedRemaining / 60);
  const remainingSeconds = estimatedRemaining % 60;

  return (
    <div className="parsing-progress">
      <div className="progress-header">正在解析代码库...</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-stats">
        <span>进度: {current.toLocaleString()} / {total.toLocaleString()} 文件 ({percentage}%)</span>
        <span>速度: {speed} 文件/秒</span>
        <span>预计剩余: {remainingMinutes} 分 {remainingSeconds} 秒</span>
      </div>
      {onCancel && <button onClick={onCancel}>取消</button>}
    </div>
  );
};

interface InferenceStatusProps {
  taskType: 'completion' | 'chat' | 'search';
  elapsedTime: number; // seconds
  status: 'network' | 'inference';
}

export const InferenceStatus: React.FC<InferenceStatusProps> = ({
  taskType,
  elapsedTime,
  status,
}) => {
  const taskLabels = {
    completion: '代码补全',
    chat: 'Chat',
    search: '搜索',
  };

  return (
    <div className="inference-status">
      <div className="status-header">正在生成代码...</div>
      <div className="status-details">
        <span>任务: {taskLabels[taskType]}</span>
        <span>已等待: {elapsedTime.toFixed(1)} 秒</span>
        <span>状态: {status === 'network' ? '网络请求中' : '模型推理中'}</span>
      </div>
    </div>
  );
};

interface VectorRetrievalStatusProps {
  foundCount: number;
  elapsedTime: number; // milliseconds
  similarityRange: [number, number];
}

export const VectorRetrievalStatus: React.FC<VectorRetrievalStatusProps> = ({
  foundCount,
  elapsedTime,
  similarityRange,
}) => {
  return (
    <div className="vector-retrieval-status">
      <div className="status-header">检索相关代码...</div>
      <div className="status-details">
        <span>找到 {foundCount} 个相关片段</span>
        <span>耗时: {elapsedTime}ms</span>
        <span>相似度: {similarityRange[0].toFixed(2)} - {similarityRange[1].toFixed(2)}</span>
      </div>
    </div>
  );
};
