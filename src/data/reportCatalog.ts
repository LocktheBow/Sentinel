export type ReportId =
  | 'balancer'
  | 'cctp'
  | 'maradona'
  | 'stargate'
  | 'sushiswap'
  | 'uniswapv3';

export type ReportDescriptor = {
  id: ReportId;
  name: string;
  shortName?: string;
  chain: string;
  category: string;
  file: string;
  summary: string;
  trmHeadline: string;
  trmBullets: string[];
  todo: Array<{ label: string; route: string; done: boolean }>;
};

const portalTasks: Array<{ label: string; route: string }> = [
  { label: 'Security Report', route: '/' },
  { label: 'Overview', route: '/overview' },
  { label: 'Impact', route: '/impact' },
  { label: 'Attack Surface', route: '/attack-surface' },
  { label: 'Dragon Composer', route: '/dragon' },
  { label: 'Findings', route: '/findings' },
  { label: 'Upgrade Matrix', route: '/upgrade-matrix' },
  { label: 'Selector Diff', route: '/selector-diff' },
  { label: 'Beacon Meltdown', route: '/beacon' },
  { label: 'Roles', route: '/roles' },
  { label: 'EIP-1967 Slots', route: '/slots' }
];

const completedTasks = portalTasks.map((task) => ({ ...task, done: true }));

export const reportCatalog: ReportDescriptor[] = [
  {
    id: 'balancer',
    name: 'Balancer Governance Bridge',
    shortName: 'Balancer',
    chain: 'Ethereum ↔ Arbitrum',
    category: 'Cross-chain upgrade governance',
    file: 'reports/balancer.json',
    summary:
      'Balancer relies on a hybrid Transparent/UUPS governance bridge. Sentinel’s baseline report captures how selector collisions and admin drift can still surface even in a “battle tested” deployment.',
    trmHeadline: 'TRM replayed cross-bridge governance paths until the weakest reroute surfaced.',
    trmBullets: [
      'Recursive simulations alternated between proxy admin logic and the remote executor to uncover full takeover chains.',
      'The tiny network stressed selector-collision states that traditional linting dismissed as “theoretical.”',
      'Iterative refinement converged on the minimal set of missteps—selector reuse plus admin self-assignment—that bricks governance entirely.'
    ],
    todo: completedTasks
  },
  {
    id: 'cctp',
    name: 'Circle CCTP Relayer',
    shortName: 'CCTP',
    chain: 'Ethereum ↔ Cosmos',
    category: 'Permissioned cross-chain messaging',
    file: 'reports/cctp.json',
    summary:
      'CCTP’s relayer contracts expose multiple self-bricking and replay edges when operators mix upgrade scripts with legacy admin tooling.',
    trmHeadline: 'TRM iterated through admin rehearsal scripts until the bricking recipe emerged.',
    trmBullets: [
      'The model reasoned through changeAdmin edge cases and discovered the self-assignment pattern that locks upgrade access forever.',
      'Recursive latent updates explored how stale attestations interact with proxy fallback flows, revealing unexpected privilege escalations.',
      'Tiny rollouts provided explainable traces that defenders can copy directly into runbooks.'
    ],
    todo: completedTasks
  },
  {
    id: 'maradona',
    name: 'Maradona Upgrade Hub',
    shortName: 'Maradona',
    chain: 'Polygon',
    category: 'Upgradeable DeFi orchestrator',
    file: 'reports/maradona.json',
    summary:
      'The Maradona hub aggregates upgrade permissions for a suite of lending vaults. Sentinel’s TRM analysis shows how minor initializer drift cascades across the entire cluster.',
    trmHeadline: 'TRM mapped initializer drift into a full upgrade bypass.',
    trmBullets: [
      'Recursive passes focussed on msg.sender assumptions, revealing that a single forgotten explicit admin parameter lets attackers absorb the hub.',
      'The tiny network walked through vault-to-hub feedback, surfacing operational deadlocks before they hit production.',
      'Each iteration produced compact latent “diffs” that Maradona engineers can replay to secure their scripts.'
    ],
    todo: completedTasks
  },
  {
    id: 'stargate',
    name: 'Stargate Bridge Core',
    shortName: 'Stargate',
    chain: 'LayerZero Omnichain',
    category: 'Bridge messaging core',
    file: 'reports/stargate.json',
    summary:
      'Stargate’s core bridge contracts rely on beacon-driven routing. TRM uncovered how mis-sequenced beacon rotations lead to DoS and privilege bleed between chains.',
    trmHeadline: 'TRM reenacted beacon rotations until a minimal failure surfaced.',
    trmBullets: [
      'Recursive latent updates reasoned through beacon admin swaps, highlighting rotation paths that strand downstream proxies.',
      'The model stress-tested reentrancy guards under multi-chain sequencing, catching a DoS window caused by stale beacon returns.',
      'Explainable traces connect each latent improvement to a concrete mitigation step for bridge operators.'
    ],
    todo: completedTasks
  },
  {
    id: 'sushiswap',
    name: 'SushiSwap Governance Vaults',
    shortName: 'SushiSwap',
    chain: 'Ethereum',
    category: 'Governance + upgradeable vaults',
    file: 'reports/sushiswap.json',
    summary:
      'SushiSwap’s governance vaults blend Transparent proxies with custom operator hooks. Sentinel illustrates how selector reuse plus optimistic scripts leads to total vault loss.',
    trmHeadline: 'TRM cycled through governance playbooks to expose the minimum failure set.',
    trmBullets: [
      'Tiny recursion alternated between operator call graphs and proxy slots to surface selector collisions missed by human review.',
      'The model improved its hypothesis until a concrete “upgradeToAndCall + msg.value” drain surfaced.',
      'Each iteration yields a diff engineers can enforce in CI to stop the regression permanently.'
    ],
    todo: completedTasks
  },
  {
    id: 'uniswapv3',
    name: 'Uniswap V3 Upgrade Suite',
    shortName: 'Uniswap V3',
    chain: 'Ethereum',
    category: 'AMM upgrade suite',
    file: 'reports/uniswapv3.json',
    summary:
      'Uniswap V3 mixes Transparent proxies, ProxyAdmin scripts, and bespoke initializer helpers. The TRM pipeline distills which combinations enable silent takeover or fund blackholes.',
    trmHeadline: 'TRM condensed the upgrade maze into actionable failure recipes.',
    trmBullets: [
      'Recursive reasoning replayed the exact chain of calls that lets attackers change admins through ProxyAdmin misdirection.',
      'The tiny network inspected initializer scaffolding, proving how msg.sender drift cascades into full vault seize.',
      'Latent tracebacks translate directly into new CI checks and runbook assertions for the Uniswap Core team.'
    ],
    todo: completedTasks
  }
];

export function getReportDescriptor(id: ReportId): ReportDescriptor {
  const descriptor = reportCatalog.find((r) => r.id === id);
  if (!descriptor) {
    throw new Error(`Unknown report id: ${id}`);
  }
  return descriptor;
}
