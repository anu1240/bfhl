const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID        = "anubhavkhetan_04022004";        
const EMAIL_ID       = "ak3775@srmist.edu.in";
const COLLEGE_ROLL   = "RA2311003011525";           

function isValidEdge(entry) {
  return /^[A-Z]->[A-Z]$/.test(entry);
}

function processData(data) {
  const invalid_entries  = [];
  const duplicate_edges  = [];
  const seenEdges        = new Set();
  const validEdges       = [];

  for (const raw of data) {
    // Spec: trim first, then validate
    const entry = (typeof raw === 'string' ? raw : String(raw)).trim();

    if (!isValidEdge(entry)) {
      invalid_entries.push(entry);   // push trimmed version
      continue;
    }

    const [parent, child] = entry.split('->');

    // Self-loop is invalid
    if (parent === child) {
      invalid_entries.push(entry);
      continue;
    }

    if (seenEdges.has(entry)) {
      // Only add to duplicate_edges once, no matter how many repeats
      if (!duplicate_edges.includes(entry)) {
        duplicate_edges.push(entry);
      }
    } else {
      seenEdges.add(entry);
      validEdges.push({ parent, child });
    }
  }

  // Build graph
  const childOf    = {};
  const childrenOf = {};
  const allNodes   = new Set();

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);
    if (!childrenOf[parent]) childrenOf[parent] = [];
    // First-encountered parent wins
    if (childOf[child] === undefined) {
      childOf[child] = parent;
      childrenOf[parent].push(child);
    }
  }

  // Union-Find for connected components
  const uf = {};
  for (const n of allNodes) uf[n] = n;

  function find(x) {
    if (uf[x] !== x) uf[x] = find(uf[x]);
    return uf[x];
  }
  function union(a, b) { uf[find(a)] = find(b); }

  for (const { parent, child } of validEdges) union(parent, child);

  const components = new Map();
  for (const n of allNodes) {
    const rep = find(n);
    if (!components.has(rep)) components.set(rep, new Set());
    components.get(rep).add(n);
  }

  const hierarchies = [];

  for (const compNodes of components.values()) {
    const adj = {};
    for (const n of compNodes) adj[n] = childrenOf[n] || [];

    // Cycle detection via DFS
    let hasCycle = false;
    const visited  = new Set();
    const recStack = new Set();

    function dfsCycle(node) {
      visited.add(node);
      recStack.add(node);
      for (const c of (adj[node] || [])) {
        if (!visited.has(c)) {
          if (dfsCycle(c)) return true;
        } else if (recStack.has(c)) {
          return true;
        }
      }
      recStack.delete(node);
      return false;
    }

    for (const n of compNodes) {
      if (!visited.has(n) && dfsCycle(n)) { hasCycle = true; break; }
    }

    // Root = node with no parent; pure cycle => lex smallest
    const candidates = [...compNodes].filter(n => childOf[n] === undefined);
    const rootNode   = candidates.length > 0
      ? candidates.sort()[0]
      : [...compNodes].sort()[0];

    if (hasCycle) {
      hierarchies.push({ root: rootNode, tree: {}, has_cycle: true });
    } else {
      function buildTree(node) {
        const obj = {};
        for (const c of [...(adj[node] || [])].sort()) {
          obj[c] = buildTree(c);
        }
        return obj;
      }

      function calcDepth(node) {
        const children = adj[node] || [];
        if (children.length === 0) return 1;
        return 1 + Math.max(...children.map(calcDepth));
      }

      hierarchies.push({
        root: rootNode,
        tree: { [rootNode]: buildTree(rootNode) },
        depth: calcDepth(rootNode)
      });
    }
  }

  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic    = hierarchies.filter(h =>  h.has_cycle);

  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    largest_tree_root = [...nonCyclic].sort((a, b) =>
      b.depth !== a.depth ? b.depth - a.depth : a.root.localeCompare(b.root)
    )[0].root;
  }

  return {
    user_id:             USER_ID,
    email_id:            EMAIL_ID,
    college_roll_number: COLLEGE_ROLL,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: { total_trees: nonCyclic.length, total_cycles: cyclic.length, largest_tree_root }
  };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'data must be an array' });
    res.json(processData(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/bfhl', (_req, res) => res.json({ operation_code: 1 }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
