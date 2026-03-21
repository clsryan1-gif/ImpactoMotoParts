"use client";

import { useState } from "react";
import { executeSql } from "./actions";
import { Database, Play, AlertCircle, CheckCircle2, ChevronRight, Table as TableIcon } from "lucide-react";

export default function SqlEditorPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await executeSql(query);
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error || "Ocorreu um erro desconhecido.");
    }
    setLoading(false);
  };

  const renderResult = () => {
    if (!result) return null;

    if (Array.isArray(result)) {
      if (result.length === 0) return <div className="p-4 text-zinc-500 italic">Nenhum resultado retornado.</div>;

      const keys = Object.keys(result[0]);

      return (
        <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-900/50">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-zinc-800/50">
                {keys.map((key) => (
                  <th key={key} className="p-3 text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-800">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i} className="hover:bg-red-500/5 transition-colors group">
                  {keys.map((key) => (
                    <td key={key} className="p-3 text-sm text-zinc-300 border-b border-zinc-800/50 group-last:border-0 truncate max-w-[300px]" title={String(row[key])}>
                      {String(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <pre className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-green-400">{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
            <span className="p-2 bg-red-600 rounded-lg text-white">
              <Database className="w-6 h-6" />
            </span>
            SQL EDITOR
          </h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Gerenciamento direto do Banco de Dados Supabase
          </p>
        </div>
        
        <button
          onClick={handleRun}
          disabled={loading || !query.trim()}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-widest flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
        >
          {loading ? "Processando..." : (
            <>
              <Play className="w-4 h-4 fill-current" /> EXECUTAR
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Editor Area */}
        <div className="glass-premium p-6 rounded-2xl border border-zinc-800/50 transition-all hover:border-red-500/30">
          <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">
            <ChevronRight className="w-4 h-4 text-red-500" /> Query SQL
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM Product LIMIT 10;"
            className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-zinc-700"
          />
        </div>

        {/* Results Area */}
        {(error || result) && (
          <div className="glass-premium p-6 rounded-2xl border border-zinc-800/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">
              <TableIcon className="w-4 h-4 text-red-500" /> Resultado da Consulta
            </div>

            {error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-black uppercase text-xs mb-1">Erro de Execução</div>
                  <div className="text-sm font-mono">{error}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500 text-xs font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> Sucesso
                </div>
                {renderResult()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
        <span className="text-red-500">IMPORTANTE:</span> Use apenas para consultas de emergência. Cuidado com DELETE ou DROP TABLE.
      </div>
    </div>
  );
}
