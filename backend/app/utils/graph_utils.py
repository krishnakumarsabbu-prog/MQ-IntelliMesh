import networkx as nx
from typing import Any
from app.core.logging import get_logger

logger = get_logger(__name__)

NODE_TYPE_QM = "queue_manager"
NODE_TYPE_QUEUE = "queue"
NODE_TYPE_APP = "application"
NODE_TYPE_CHANNEL = "channel"

EDGE_OWNS_QUEUE = "OWNS_QUEUE"
EDGE_CONNECTS_TO = "CONNECTS_TO"
EDGE_PRODUCES_TO = "PRODUCES_TO"
EDGE_CONSUMES_FROM = "CONSUMES_FROM"
EDGE_CHANNEL_TO = "CHANNEL_TO"


def build_topology_graph(topology: dict[str, list[dict[str, Any]]]) -> nx.DiGraph:
    G = nx.DiGraph()

    for qm in topology.get("queue_managers", []):
        name = qm.get("qm_name")
        if name:
            G.add_node(name, node_type=NODE_TYPE_QM, **{
                k: v for k, v in qm.items() if k != "raw" and v is not None
            })

    for app in topology.get("applications", []):
        app_id = app.get("app_id")
        if app_id:
            G.add_node(app_id, node_type=NODE_TYPE_APP, **{
                k: v for k, v in app.items() if k != "raw" and v is not None
            })
            connected_qm = app.get("connected_qm")
            if connected_qm:
                if connected_qm not in G:
                    G.add_node(connected_qm, node_type=NODE_TYPE_QM)
                G.add_edge(app_id, connected_qm, edge_type=EDGE_CONNECTS_TO)

    for queue in topology.get("queues", []):
        qname = queue.get("queue_name")
        owning_qm = queue.get("owning_qm")
        if qname:
            G.add_node(qname, node_type=NODE_TYPE_QUEUE, **{
                k: v for k, v in queue.items() if k != "raw" and v is not None
            })
            if owning_qm:
                if owning_qm not in G:
                    G.add_node(owning_qm, node_type=NODE_TYPE_QM)
                G.add_edge(owning_qm, qname, edge_type=EDGE_OWNS_QUEUE)

    for ch in topology.get("channels", []):
        ch_name = ch.get("channel_name")
        from_qm = ch.get("from_qm")
        to_qm = ch.get("to_qm")
        if ch_name:
            G.add_node(ch_name, node_type=NODE_TYPE_CHANNEL, **{
                k: v for k, v in ch.items() if k != "raw" and v is not None
            })
        if from_qm and to_qm:
            if from_qm not in G:
                G.add_node(from_qm, node_type=NODE_TYPE_QM)
            if to_qm not in G:
                G.add_node(to_qm, node_type=NODE_TYPE_QM)
            G.add_edge(from_qm, to_qm, edge_type=EDGE_CHANNEL_TO, channel=ch_name)

    for rel in topology.get("relationships", []):
        producer = rel.get("producer_app")
        consumer = rel.get("consumer_app")
        queue_name = rel.get("queue_name")

        if producer and not G.has_node(producer):
            G.add_node(producer, node_type=NODE_TYPE_APP)
        if consumer and not G.has_node(consumer):
            G.add_node(consumer, node_type=NODE_TYPE_APP)

        if producer and queue_name:
            if queue_name not in G:
                G.add_node(queue_name, node_type=NODE_TYPE_QUEUE)
            G.add_edge(producer, queue_name, edge_type=EDGE_PRODUCES_TO)

        if consumer and queue_name:
            if queue_name not in G:
                G.add_node(queue_name, node_type=NODE_TYPE_QUEUE)
            G.add_edge(queue_name, consumer, edge_type=EDGE_CONSUMES_FROM)

        if producer and consumer and not queue_name:
            G.add_edge(producer, consumer, edge_type=EDGE_PRODUCES_TO)

    logger.info(
        "Graph built: %d nodes, %d edges",
        G.number_of_nodes(),
        G.number_of_edges(),
    )
    return G


def summarize_graph(G: nx.DiGraph) -> dict[str, Any]:
    node_type_counts: dict[str, int] = {}
    for _, data in G.nodes(data=True):
        ntype = data.get("node_type", "unknown")
        node_type_counts[ntype] = node_type_counts.get(ntype, 0) + 1

    edge_type_counts: dict[str, int] = {}
    for _, _, data in G.edges(data=True):
        etype = data.get("edge_type", "unknown")
        edge_type_counts[etype] = edge_type_counts.get(etype, 0) + 1

    components = None
    density = None
    try:
        undirected = G.to_undirected()
        components = nx.number_connected_components(undirected)
        if G.number_of_nodes() > 1:
            density = round(nx.density(G), 4)
    except Exception:
        pass

    return {
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "node_types": node_type_counts,
        "edge_types": edge_type_counts,
        "connected_components": components,
        "density": density,
    }


def get_graph_preview(G: nx.DiGraph, limit: int = 10) -> list[dict[str, Any]]:
    return [
        {"node": n, **{k: v for k, v in d.items() if v is not None}}
        for n, d in list(G.nodes(data=True))[:limit]
    ]


def get_nodes_by_type(G: nx.DiGraph, node_type: str) -> list[str]:
    return [n for n, d in G.nodes(data=True) if d.get("node_type") == node_type]


def get_in_degree_map(G: nx.DiGraph, node_type: str | None = None) -> dict[str, int]:
    result = {}
    for node, deg in G.in_degree():
        if node_type is None or G.nodes[node].get("node_type") == node_type:
            result[node] = deg
    return result


def get_out_degree_map(G: nx.DiGraph, node_type: str | None = None) -> dict[str, int]:
    result = {}
    for node, deg in G.out_degree():
        if node_type is None or G.nodes[node].get("node_type") == node_type:
            result[node] = deg
    return result


def get_total_degree_map(G: nx.DiGraph, node_type: str | None = None) -> dict[str, int]:
    result = {}
    undirected = G.to_undirected()
    for node, deg in undirected.degree():
        if node_type is None or G.nodes[node].get("node_type") == node_type:
            result[node] = deg
    return result


def detect_cycles(G: nx.DiGraph) -> list[list[str]]:
    try:
        return list(nx.simple_cycles(G))
    except Exception:
        return []


def find_duplicate_qm_pairs(G: nx.DiGraph) -> list[tuple[str, str, int]]:
    pair_counts: dict[tuple[str, str], int] = {}
    for u, v, data in G.edges(data=True):
        if data.get("edge_type") == EDGE_CHANNEL_TO:
            key = (u, v)
            pair_counts[key] = pair_counts.get(key, 0) + 1
    return [(u, v, count) for (u, v), count in pair_counts.items() if count > 1]


def get_neighborhood_sizes(G: nx.DiGraph, node_type: str) -> dict[str, int]:
    result = {}
    for node in get_nodes_by_type(G, node_type):
        neighbors = set(G.predecessors(node)) | set(G.successors(node))
        result[node] = len(neighbors)
    return result


def get_app_to_qm_connections(G: nx.DiGraph) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for app in get_nodes_by_type(G, NODE_TYPE_APP):
        connected_qms = [
            n for n in G.successors(app)
            if G.nodes[n].get("node_type") == NODE_TYPE_QM
        ]
        if connected_qms:
            result[app] = connected_qms
    return result


def get_orphan_queues(G: nx.DiGraph) -> list[str]:
    orphans = []
    for queue in get_nodes_by_type(G, NODE_TYPE_QUEUE):
        predecessors = list(G.predecessors(queue))
        successors = list(G.successors(queue))
        has_producer = any(
            G.nodes[p].get("node_type") == NODE_TYPE_APP
            for p in predecessors
        )
        has_consumer = any(
            G.nodes[s].get("node_type") == NODE_TYPE_APP
            for s in successors
        )
        is_owned = any(
            G.has_edge(p, queue) and G.edges[p, queue].get("edge_type") == EDGE_OWNS_QUEUE
            for p in predecessors
        )
        if is_owned and not has_producer and not has_consumer:
            orphans.append(queue)
    return orphans


def get_qm_app_ownership(G: nx.DiGraph) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for qm in get_nodes_by_type(G, NODE_TYPE_QM):
        connected_apps = [
            n for n in G.predecessors(qm)
            if G.nodes[n].get("node_type") == NODE_TYPE_APP
        ]
        result[qm] = connected_apps
    return result


def get_routing_path_lengths(G: nx.DiGraph) -> list[dict[str, Any]]:
    apps = get_nodes_by_type(G, NODE_TYPE_APP)
    paths = []
    undirected = G.to_undirected()
    for i, src in enumerate(apps):
        for dst in apps[i + 1:]:
            try:
                length = nx.shortest_path_length(undirected, src, dst)
                if length > 0:
                    paths.append({"source": src, "target": dst, "hops": length})
            except nx.NetworkXNoPath:
                pass
    return paths


def get_centrality_scores(G: nx.DiGraph) -> dict[str, float]:
    try:
        return nx.betweenness_centrality(G, normalized=True)
    except Exception:
        return {}
