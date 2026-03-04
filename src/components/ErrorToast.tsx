/**
 * Error Toast Components for CodePilot vNext
 * Displays friendly error messages with actionable suggestions
 */

import React from 'react';

type ErrorDetails =
  | { type: 'file_too_large'; filePath: string; size: number }
  | { type: 'ast_too_deep'; filePath: string; depth: number }
  | { type: 'api_failed'; error: string }
  | { type: 'index_corrupted' };

interface ErrorToastProps {
  type: 'file_too_large' | 'ast_too_deep' | 'api_failed' | 'index_corrupted';
  details: ErrorDetails;
  onAction?: (action: string) => void;
  onDismiss?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  type,
  details,
  onAction,
  onDismiss,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'file_too_large':
        if (details.type === 'file_too_large') {
          return (
            <>
              <div className="error-title">⚠️ 文件过大无法解析</div>
              <div className="error-message">
                文件 "{details.filePath}" 大小为 {(details.size / 1024 / 1024).toFixed(2)}MB，超过 10MB 限制。
              </div>
              <div className="error-suggestions">
                建议：
                <ul>
                  <li>将大文件拆分为多个小文件</li>
                  <li>排除自动生成的文件（在 .gitignore 中添加）</li>
                </ul>
              </div>
              <div className="error-actions">
                <button onClick={() => onAction?.('details')}>查看详情</button>
                <button onClick={() => onAction?.('ignore')}>忽略此文件</button>
              </div>
            </>
          );
        }
        break;

      case 'ast_too_deep':
        if (details.type === 'ast_too_deep') {
          return (
            <>
              <div className="error-title">⚠️ 代码嵌套层级过深</div>
              <div className="error-message">
                文件 "{details.filePath}" 的 AST 深度为 {details.depth} 层，超过 500 层限制。
              </div>
              <div className="error-suggestions">
                建议：
                <ul>
                  <li>重构代码，减少嵌套层级</li>
                  <li>使用提前返回（early return）模式</li>
                </ul>
              </div>
            </>
          );
        }
        break;

      case 'api_failed':
        if (details.type === 'api_failed') {
          return (
            <>
              <div className="error-title">❌ 无法连接到 Claude API</div>
              <div className="error-message">错误: {details.error}</div>
              <div className="error-suggestions">
                可能原因：网络连接不稳定、API 服务暂时不可用
              </div>
              <div className="error-actions">
                <button onClick={() => onAction?.('retry')}>重试</button>
              </div>
            </>
          );
        }
        break;

      case 'index_corrupted':
        return (
          <>
            <div className="error-title">⚠️ 向量索引需要重建</div>
            <div className="error-message">检测到索引文件损坏或版本不兼容。</div>
            <div className="error-actions">
              <button onClick={() => onAction?.('rebuild')}>立即重建</button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="error-toast">
      {renderContent()}
      {onDismiss && <button className="dismiss" onClick={onDismiss}>×</button>}
    </div>
  );
};
