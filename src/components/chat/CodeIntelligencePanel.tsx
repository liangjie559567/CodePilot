import { useState } from 'react';
import { codeIntelligenceAPI } from '@/lib/code-intelligence-client';

type CodeIntelligenceResult =
  | { type: 'analyze'; data: unknown }
  | { type: 'search'; data: unknown }
  | { type: 'error'; data: string }
  | null;

export function CodeIntelligencePanel() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CodeIntelligenceResult>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await codeIntelligenceAPI.analyzeCode({
        code,
        filePath: 'temp.ts',
      });
      setResult({ type: 'analyze', data: res });
    } catch (err) {
      setResult({ type: 'error', data: String(err) });
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await codeIntelligenceAPI.searchCode({ query: code, limit: 5 });
      setResult({ type: 'search', data: res });
    } catch (err) {
      setResult({ type: 'error', data: String(err) });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Code Intelligence</h3>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={5}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code or search query..."
      />
      <div className="flex gap-2 mb-2">
        <button onClick={handleAnalyze} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
          Analyze
        </button>
        <button onClick={handleSearch} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded">
          Search
        </button>
      </div>
      {result && (
        <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto max-h-60">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
