from typing import Dict, Any, List

TRUSTED_REFERENCE_GRAPH = {
    "nodes": [
        {
            "id": "ts_nrel",
            "name": "NREL Photovoltaic Record Efficiency Database",
            "type": "TrustedSource",
            "authority": "US Department of Energy National Lab",
            "trust_score": 0.99
        },
        {
            "id": "ts_llnl",
            "name": "Lawrence Livermore National Laboratory NIF Reports",
            "type": "TrustedSource",
            "authority": "Peer-Reviewed Scientific Record / Physical Review Letters",
            "trust_score": 0.98
        },
        {
            "id": "ts_nature",
            "name": "Nature Journal / Max Planck Institute Findings",
            "type": "TrustedSource",
            "authority": "Peer-Reviewed Scientific Journal",
            "trust_score": 0.97
        },
        {
            "id": "ts_ipcc",
            "name": "IPCC AR6 Working Group I Report",
            "type": "TrustedSource",
            "authority": "UN Intergovernmental Panel on Climate Change",
            "trust_score": 0.99
        },
        {
            "id": "ts_usgs",
            "name": "USGS Volcano Hazards Program & Atmospheric Emissions Dataset",
            "type": "TrustedSource",
            "authority": "US Geological Survey Federal Agency",
            "trust_score": 0.98
        },
        {
            "id": "ts_iea",
            "name": "IEA Renewable Energy Market Update 2024",
            "type": "TrustedSource",
            "authority": "International Energy Agency",
            "trust_score": 0.96
        },
        {
            "id": "ts_stanford",
            "name": "Stanford HAI AI Index Report 2025/2026",
            "type": "TrustedSource",
            "authority": "Stanford University Human-Centered AI Institute",
            "trust_score": 0.95
        }
    ],
    "verified_facts": [
        {
            "fact_id": "fact_1",
            "keywords": ["quantum", "ibm", "google", "supercomputer", "10,000"],
            "status": "VERIFIED",
            "trusted_source": "ts_stanford",
            "evidence": "Quantum processors achieved specialized mathematical supremacy over classical supercomputers in benchmarked trials."
        },
        {
            "fact_id": "fact_2",
            "keywords": ["fusion", "lawrence livermore", "net energy gain", "megajoules", "ignition"],
            "status": "VERIFIED",
            "trusted_source": "ts_llnl",
            "evidence": "NIF produced 3.15 MJ fusion output from 2.05 MJ laser energy, achieving target net gain."
        },
        {
            "fact_id": "fact_3",
            "keywords": ["lk-99", "lk99", "superconductor", "room-temperature"],
            "status": "CONTRADICTED",
            "trusted_source": "ts_nature",
            "evidence": "Replication by Max Planck Institute confirmed LK-99 is a ferromagnetic insulator due to Cu2S impurities, not a superconductor."
        },
        {
            "fact_id": "fact_4",
            "keywords": ["temperature", "1.1", "pre-industrial", "climate", "celsius"],
            "status": "VERIFIED",
            "trusted_source": "ts_ipcc",
            "evidence": "Global surface temperature warmings have reached 1.1°C above pre-industrial averages according to IPCC AR6."
        },
        {
            "fact_id": "fact_5",
            "keywords": ["co2", "volcano", "human", "erupt"],
            "status": "CONTRADICTED",
            "trusted_source": "ts_usgs",
            "evidence": "USGS reports human global emissions (~35 billion tons/yr) exceed total subaerial volcano emissions (~0.3 billion tons/yr) by >100x."
        },
        {
            "fact_id": "fact_6",
            "keywords": ["agi", "artificial general intelligence", "achieved"],
            "status": "CONTRADICTED",
            "trusted_source": "ts_stanford",
            "evidence": "Current LLM benchmark evaluation demonstrates specialized capability, not general autonomous AGI."
        },
        {
            "fact_id": "fact_7",
            "keywords": ["solar", "perovskite", "efficiency", "33%", "tandem"],
            "status": "VERIFIED",
            "trusted_source": "ts_nrel",
            "evidence": "Tandem perovskite-silicon laboratory solar cell efficiency certified at 33.9% in NREL charts."
        }
    ]
}

def get_trusted_reference_graph() -> Dict[str, Any]:
    """
    FR5: Load and maintain a curated trusted reference graph.
    """
    return TRUSTED_REFERENCE_GRAPH
