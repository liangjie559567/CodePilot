/**
 * Collaboration UI Components for CodePilot vNext
 * Code snippet sharing and line-level comments
 */

import React, { useState } from 'react';

interface CodeSnippetShareProps {
  filePath: string;
  startLine: number;
  endLine: number;
  code: string;
  onShare: (mode: 'public' | 'private', password?: string) => void;
}

export const CodeSnippetShare: React.FC<CodeSnippetShareProps> = ({
  filePath,
  startLine,
  endLine,
  code,
  onShare,
}) => {
  const [mode, setMode] = useState<'public' | 'private'>('private');
  const [password] = useState(Math.random().toString(36).slice(2, 10));

  return (
    <div className="snippet-share-dialog">
      <h3>分享代码片段</h3>
      <div className="snippet-info">
        <p>文件: {filePath}</p>
        <p>行数: {startLine}-{endLine} ({endLine - startLine + 1} 行)</p>
      </div>
      <div className="share-mode">
        <label>
          <input type="radio" checked={mode === 'public'} onChange={() => setMode('public')} />
          公开（任何人可访问）
        </label>
        <label>
          <input type="radio" checked={mode === 'private'} onChange={() => setMode('private')} />
          私密（需要密码）
        </label>
      </div>
      {mode === 'private' && <div className="password">密码: {password}</div>}
      <button onClick={() => onShare(mode, mode === 'private' ? password : undefined)}>
        生成链接
      </button>
    </div>
  );
};

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface LineCommentProps {
  lineNumber: number;
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export const LineComment: React.FC<LineCommentProps> = ({
  lineNumber,
  comments,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');

  return (
    <div className="line-comment-panel">
      <div className="comment-header">评论 ({comments.length})</div>
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-author">@{comment.author}</div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-time">{comment.timestamp.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="add-comment">
        <textarea
          placeholder="添加评论..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button onClick={() => { onAddComment(newComment); setNewComment(''); }}>发送</button>
      </div>
    </div>
  );
};

