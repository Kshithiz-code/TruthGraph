import React, { useEffect, useRef, useState } from 'react';
import { Network as VisNetwork, Node as VisNode, Edge as VisEdge } from 'vis-network';
import { DataSet } from 'vis-data';
import { Network } from 'lucide-react';
import { GraphNode, GraphEdge } from '../types';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedFilter: string;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, edges, selectedFilter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter nodes based on selected filter
    const filteredNodes = nodes.filter((n) => {
      if (selectedFilter === 'ALL') return true;
      if (n.type === 'claim') {
        return n.data.verification_status === selectedFilter;
      }
      return true;
    });

    const formattedNodes: VisNode[] = filteredNodes.map((n) => {
      let color = { background: '#6366f1', border: '#4f46e5' }; // default indigo
      let shape = 'dot';
      let size = 20;

      if (n.type === 'video') {
        color = { background: '#8b5cf6', border: '#7c3aed' }; // purple
        shape = 'diamond';
        size = 30;
      } else if (n.type === 'claim') {
        const status = n.data.verification_status;
        if (status === 'VERIFIED') color = { background: '#10b981', border: '#059669' }; // emerald
        else if (status === 'CONTRADICTED') color = { background: '#f43f5e', border: '#e11d48' }; // rose
        else color = { background: '#f59e0b', border: '#d97706' }; // amber
        shape = 'ellipse';
        size = 24;
      } else if (n.type === 'entity') {
        color = { background: '#3b82f6', border: '#2563eb' }; // blue
        shape = 'box';
        size = 18;
      } else if (n.type === 'trusted_source') {
        color = { background: '#14b8a6', border: '#0d9488' }; // teal
        shape = 'star';
        size = 28;
      }

      return {
        id: n.id,
        label: n.label,
        color: {
          background: color.background,
          border: color.border,
          highlight: { background: '#ffffff', border: color.border }
        },
        shape,
        size,
        font: { color: '#f8fafc', size: 12, face: 'Plus Jakarta Sans' },
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      };
    });

    const visNodes = new DataSet<VisNode>(formattedNodes);

    const validNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );

    const formattedEdges: VisEdge[] = filteredEdges.map((e) => ({
      id: e.id,
      from: e.source,
      to: e.target,
      label: e.label,
      font: { color: '#94a3b8', size: 10, align: 'horizontal' },
      color: { color: '#475569', highlight: '#818cf8' },
      arrows: { to: { enabled: true, scaleFactor: 0.7 } },
      smooth: true
    }));

    const visEdges = new DataSet<VisEdge>(formattedEdges);

    const data = { nodes: visNodes, edges: visEdges };
    const options = {
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true
      }
    };

    const network = new VisNetwork(containerRef.current, data, options);

    network.on('selectNode', (params) => {
      const nodeId = params.nodes[0];
      const found = nodes.find((n) => n.id === nodeId);
      if (found) setSelectedNode(found);
    });

    network.on('deselectNode', () => {
      setSelectedNode(null);
    });

    return () => {
      network.destroy();
    };
  }, [nodes, edges, selectedFilter]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <span>Interactive Knowledge Graph</span>
          </h3>
          <p className="text-xs text-slate-400">
            Node-edge network connecting Video → Extracted Claims → Named Entities → Trusted Sources.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span className="text-slate-300">Video</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300">Verified Claim</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-300">Refuted</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-300">Entity</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
            <span className="text-slate-300">Trusted Source</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-[450px] bg-slate-950 rounded-xl border border-slate-800/80 relative"
      />

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-slate-950 border border-indigo-500/40 rounded-xl flex items-start justify-between gap-4 animate-fadeIn">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedNode.type}
              </span>
              <h4 className="font-bold text-white text-sm">{selectedNode.label}</h4>
            </div>
            {selectedNode.data.full_text && (
              <p className="text-xs text-slate-300 mb-1">"{selectedNode.data.full_text}"</p>
            )}
            {selectedNode.data.evidence && (
              <p className="text-xs text-emerald-400 font-medium">
                Evidence: {selectedNode.data.evidence}
              </p>
            )}
            {selectedNode.data.description && (
              <p className="text-xs text-slate-400">Context: {selectedNode.data.description}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
