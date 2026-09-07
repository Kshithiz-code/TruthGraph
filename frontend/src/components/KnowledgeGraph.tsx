import React, { useEffect, useRef } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { GraphNode, GraphEdge } from '../types';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedFilter: string; // Used to highlight specific nodes if the user clicked a filter tab
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, edges, selectedFilter }) => {
  // We use a React Ref to target the empty div where vis-network will draw the canvas
  const containerRef = useRef<HTMLDivElement>(null);
  // We keep a reference to the network instance to clean it up when the component unmounts
  const networkRef = useRef<Network | null>(null);

  /**
   * Helper function to style nodes dynamically based on their Type (Video, Claim, Entity, etc.)
   * and based on the currently selected filter.
   */
  const processNodes = (rawNodes: GraphNode[], filter: string) => {
    return rawNodes.map(node => {
      let color = { background: '#334155', border: '#475569' }; // Default Slate Gray
      let shape = 'dot';
      let size = 15;
      let opacity = 1.0;
      let fontColor = '#f1f5f9'; // White text

      // Apply distinct visual styling for different node types
      if (node.type === 'video') {
        color = { background: '#6366f1', border: '#818cf8' }; // Indigo for the central video
        shape = 'hexagon';
        size = 25;
      } else if (node.type === 'trusted_source') {
        color = { background: '#0284c7', border: '#38bdf8' }; // Sky Blue for trusted sources
        shape = 'box';
      } else if (node.type === 'claim') {
        shape = 'dot';
        size = 18;
        // Color code claims based on their mathematical verification status
        const status = node.data?.verification_status;
        if (status === 'VERIFIED') color = { background: '#059669', border: '#34d399' }; // Emerald Green
        else if (status === 'CONTRADICTED') color = { background: '#e11d48', border: '#fb7185' }; // Rose Red
        else if (status === 'UNVERIFIED') color = { background: '#ca8a04', border: '#facc15' }; // Yellow
        
        // Dim this claim node if the user clicked a filter tab and this claim doesn't match
        if (filter !== 'ALL' && status !== filter) {
          opacity = 0.2;
          fontColor = '#475569';
        }
      }

      // Dim non-claim nodes if a specific filter is active, to reduce visual clutter
      if (filter !== 'ALL' && node.type !== 'claim') {
        opacity = 0.5;
        fontColor = '#94a3b8';
      }

      // Return the vis.js formatted node object
      return {
        id: node.id,
        label: node.label,
        shape: shape,
        size: size,
        color: { ...color, opacity },
        font: { color: fontColor, size: 12, face: 'Inter' },
        title: node.data?.full_text || node.data?.description || node.label, // Tooltip text on hover
        shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', size: 10 }
      };
    });
  };

  /**
   * Helper function to style edges (connecting lines).
   * It colors the edges green for VERIFIED or red for REFUTED.
   */
  const processEdges = (rawEdges: GraphEdge[], filter: string) => {
    return rawEdges.map(edge => {
      let color = { color: '#475569', opacity: 1.0 }; // Default Slate Gray
      
      // Color-code the edges connecting claims to trusted sources
      if (edge.type === 'verified_by') {
        color = { color: '#059669', opacity: 1.0 }; // Emerald Green
      } else if (edge.type === 'refuted_by') {
        color = { color: '#e11d48', opacity: 1.0 }; // Rose Red
      }

      // Dim edges if a specific filter is active to keep focus on the highlighted nodes
      if (filter !== 'ALL') {
        color.opacity = 0.2;
      }

      // Return vis.js formatted edge object
      return {
        id: edge.id,
        from: edge.source,
        to: edge.target,
        label: edge.label,
        color: color,
        font: { color: '#94a3b8', size: 10, align: 'middle' },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } }, // Add an arrowhead
        smooth: { type: 'continuous' } // Curve the lines slightly for aesthetic appeal
      };
    });
  };

  /**
   * React useEffect Hook:
   * This runs automatically whenever the `nodes`, `edges`, or `selectedFilter` props change.
   * It takes our processed nodes/edges and mounts the physics-enabled canvas chart.
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const processedNodes = processNodes(nodes, selectedFilter);
    const processedEdges = processEdges(edges, selectedFilter);

    // Graph Data Object
    const data = {
      nodes: processedNodes,
      edges: processedEdges
    };

    // Graph Configuration Options
    const options: Options = {
      // Configuration for the physics engine (makes nodes float and repel each other)
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -100, // Repulsion force
          centralGravity: 0.01,
          springLength: 150,
          springConstant: 0.08
        },
        maxVelocity: 50,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true, // Show tooltips
        zoomView: true, // Allow mouse scroll zooming
        dragView: true  // Allow canvas panning
      }
    };

    // Instantiate and draw the Network Graph inside the target div
    networkRef.current = new Network(containerRef.current, data, options);

    // Cleanup Function: destroy the graph instance when the component unmounts to prevent memory leaks
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes, edges, selectedFilter]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Interactive Knowledge Graph</h3>
        <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-500">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></div> Video Target</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div> Extracted Entity</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-sky-500"></div> Trusted Source</span>
        </div>
      </div>
      
      {/* Target Canvas Div where vis-network injects the HTML5 Canvas */}
      <div 
        ref={containerRef} 
        className="w-full bg-slate-950/50"
        style={{ height: '500px' }} 
      />
    </div>
  );
};
