import { Anchor, Card, Col, Divider, Row, Space, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Paragraph, Text } = Typography;

type Section = {
  id: string;
  heading: string;
  content: ReactNode;
};

const sections: Section[] = [
  {
    id: 'executive-summary',
    heading: '1. Executive Summary',
    content: (
      <>
        <Paragraph>
          This report presents the findings of a security assessment focused on the project&apos;s use of the OpenZeppelin
          upgradeability stack. The analysis leveraged a fully automated pipeline centered on a{' '}
          <Text strong>Tiny Recursive Model (TRM)</Text> for deep vulnerability discovery, guided by a formal{' '}
          <Text strong>Threat &amp; Risk Model (T&amp;RM)</Text>.
        </Paragraph>
        <Paragraph>
          The review confirmed that the proxy layer reuses battle-tested OpenZeppelin contracts (v4.7–4.8). As a result,
          systemic risk is driven more by configuration, operational discipline, and upgrade hygiene than by fresh code
          defects. The TRM engine synthesized several exploit chains showing how pattern mixing or initializer mistakes
          can still lead to catastrophic failure.
        </Paragraph>
        <Paragraph>
          The three most critical chains are: (1) selector collisions in the implementation allow an unprivileged attacker
          to take over a proxy; (2) mixing Transparent and UUPS proxy patterns bypasses governance; and (3) front-running
          an uninitialized implementation enables a full proxy seizure.
        </Paragraph>
        <Divider />
        <Title level={4}>What to do this week</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>
            <Text strong>Ban Transparent + UUPS mixing.</Text> Enforce on-chain assertions that the ProxyAdmin owns the
            proxy before running any mutator.
          </li>
          <li>
            <Text strong>Initialize with explicit addresses only.</Text> Never rely on <code>msg.sender</code> in
            initializers that run through a proxy.
          </li>
          <li>
            <Text strong>Forbid changeAdmin(proxy) where proxy == newAdmin.</Text> Build this guard into deployment and
            governance tooling.
          </li>
          <li>
            <Text strong>Default msg.value == 0 for upgrades.</Text> Allow value transfers only behind an explicit flag
            and pair them with a sweep procedure.
          </li>
          <li>
            <Text strong>Add a selector-collision CI check.</Text> Fail builds when implementation selectors collide with
            those on the proxy admin surface.
          </li>
        </ul>
        <Paragraph>
          <Text strong>Risk rating:</Text> Pre-mitigation posture is <Text strong>Severe</Text> due to multiple confirmed
          Critical and High exploit paths. With the week-one actions landed and validated, residual posture is projected to
          fall to <Text strong>Moderate</Text>.
        </Paragraph>
      </>
    )
  },
  {
    id: 'scope-methodology',
    heading: '2. Scope & Methodology',
    content: (
      <>
        <Title level={4}>2.1 Scope</Title>
        <Paragraph>
          The assessment targeted the project&apos;s use of the OpenZeppelin proxy and upgradeability stack. Application
          implementation contracts were not provided and remain out of scope.
        </Paragraph>
        <Paragraph>
          <Text strong>In scope:</Text> TransparentUpgradeableProxy, ERC1967Upgrade, ProxyAdmin, ERC1967Proxy, BeaconProxy,
          UpgradeableBeacon, StorageSlot, Proxy, Address, Ownable, Context, IBeacon, IERC1967, draft-IERC1822.
        </Paragraph>
        <Paragraph>
          <Text strong>Out of scope:</Text> Protocol-specific contracts (lending, liquidation, oracles), live on-chain
          state, deployment pipelines, off-chain services. Application-layer risks referenced here are synthesized
          patterns requiring validation once the app code ships.
        </Paragraph>
        <Title level={4}>2.2 Methodology</Title>
        <Paragraph>
          The TRM engine synthesized multi-step exploit paths, guided by the T&amp;RM to focus on high-value assets and
          threat scenarios. A follow-on Large Language Model curated, deduplicated, and narrated those paths into the
          findings captured throughout the portal.
        </Paragraph>
        <Paragraph>
          <Text strong>Limitations:</Text> The analysis is static. No live networks or RPC forks were used, and no dynamic
          proof-of-concepts were executed. Critical and High findings should be validated on a testnet before production
          action.
        </Paragraph>
      </>
    )
  },
  {
    id: 'threat-risk-model',
    heading: '3. Threat & Risk Model (T&RM)',
    content: (
      <>
        <Paragraph>
          The T&amp;RM grounds the TRM exploration. It defines assets to protect, adversary personas, trust boundaries,
          and explicit assumptions.
        </Paragraph>
        <Title level={4}>Assets</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>
            <Text strong>Upgrade authority:</Text> control over the EIP-1967 admin slot.
          </li>
          <li>
            <Text strong>Proxy storage slots:</Text> EIP-1967 implementation and beacon slots.
          </li>
          <li>
            <Text strong>Protocol funds:</Text> assets held at the proxy address.
          </li>
          <li>
            <Text strong>Role secrets:</Text> credentials for ProxyAdmin owners, runtime governance, and operators.
          </li>
        </ul>
        <Title level={4}>Adversaries</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>
            <Text strong>External Caller</Text> – unprivileged users.
          </li>
          <li>
            <Text strong>Compromised ProxyAdmin Owner</Text> – attacker with ProxyAdmin keys.
          </li>
          <li>
            <Text strong>Careless Operator</Text> – legitimate users running unsafe upgrade flows.
          </li>
          <li>
            <Text strong>Malicious Implementation Upgrade</Text> – backdoored or compromised governance upgrade.
          </li>
        </ul>
        <Title level={4}>Trust boundaries</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>Admin EOAs vs user EOAs.</li>
          <li>ProxyAdmin control plane vs implementation auth logic.</li>
          <li>Timelock and Safe guardrails before on-chain execution.</li>
        </ul>
        <Title level={4}>Assumptions</Title>
        <Paragraph>
          Implementations do not expose admin-colliding selectors without strict authorization, and the proxy does not
          self-call unless intentionally engineered.
        </Paragraph>
      </>
    )
  },
  {
    id: 'findings-summary',
    heading: '4. Summary of Findings (Deduplicated)',
    content: (
      <>
        <Paragraph>
          The TRM analysis generated the following unique risks. Entries marked Synthesized require validation against the
          final application implementation.
        </Paragraph>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f7ff' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['C-01', 'Selector collision via Transparent fallback enables takeover', 'Critical', 'Confirmed'],
                ['C-02', 'Transparent+UUPS role-confusion enables bypass upgrade', 'Critical', 'Confirmed'],
                ['C-03', 'Spoofed ProxyAdmin getters + missing admin assert → upgrade', 'Critical', 'Confirmed'],
                ['C-04', 'Uninitialized initializer front-run → UUPS upgrade to attacker', 'Critical', 'Confirmed'],
                ['H-01', 'changeAdmin(address(this)) bricks governance permanently', 'High', 'Confirmed'],
                ['H-02', 'Stealth admin actions during upgradeToAndCall init', 'High', 'Confirmed'],
                ['H-03', 'Initializer owner/role drift (msg.sender)', 'High', 'Confirmed'],
                ['H-04', 'Price oracle staleness not validated', 'High', 'Synthesized'],
                ['H-05', 'Reentrancy in withdraw() (interactions-before-effects)', 'High', 'Synthesized'],
                ['M-01', 'ProxyAdmin getters can lie when not admin (operational risk)', 'Medium', 'Confirmed'],
                ['M-02', 'Role-split footgun can lock operational controls', 'Medium', 'Confirmed'],
                ['M-03', 'ETH sink on upgradeToAndCall; value not forwarded', 'Medium', 'Confirmed'],
                ['M-04', 'BeaconProxy DoS if beacon returns non-contract', 'Medium', 'Synthesized'],
                ['M-05', 'Subclassing Transparent proxy may shadow admin ops', 'Medium', 'Confirmed'],
                ['I-01', 'CVE-2023-30541 (selector clash)', 'N/A', 'Not applicable']
              ].map(([id, title, severity, status]) => (
                <tr key={id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{id}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{title}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{severity}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  },
  {
    id: 'findings-detail',
    heading: '5. Detailed Findings',
    content: (
      <>
        <Paragraph>
          Each critical chain is unpacked throughout the Findings and Attack Surface sections. This narrative highlights
          the context, reasoning, and remediation guidance behind the highest-severity items.
        </Paragraph>
        <Title level={4}>C-01 — Selector collision via Transparent fallback enables takeover</Title>
        <Paragraph>
          <Text strong>Type:</Text> Vulnerability (exploitable) · <Text strong>Status:</Text> Confirmed
        </Paragraph>
        <Paragraph>
          Transparent proxies delegate non-admin calls to the implementation. If the implementation exposes a function
          whose selector matches a proxy admin function, unprivileged callers can reach it and overwrite EIP-1967 slots.
        </Paragraph>
        <Paragraph>
          <Text strong>Remediation:</Text> CI diff implementation selectors against the proxy admin interface and block any
          collisions unless strictly authorized.
        </Paragraph>
        <Divider />
        <Title level={4}>C-02 — Transparent+UUPS role-confusion enables bypass upgrade</Title>
        <Paragraph>
          <Text strong>Type:</Text> High-impact misconfiguration · <Text strong>Status:</Text> Confirmed
        </Paragraph>
        <Paragraph>
          Transparent proxies forwarding to UUPS implementations allow accounts with UUPS permissions to upgrade without
          transparent admin consent. This collapses the intended trust boundary.
        </Paragraph>
        <Paragraph>
          <Text strong>Remediation:</Text> Do not mix proxy patterns. When unavoidable, lock down <code>_authorizeUpgrade</code>{' '}
          so only the Transparent admin can call it.
        </Paragraph>
        <Divider />
        <Title level={4}>C-03 — Spoofed ProxyAdmin getters + missing admin assert → upgrade</Title>
        <Paragraph>
          <Text strong>Type:</Text> Vulnerability chain · <Text strong>Status:</Text> Confirmed
        </Paragraph>
        <Paragraph>
          ProxyAdmin getters can return forged values when the ProxyAdmin is not the true admin. Follow-on upgrade attempts
          forward into the implementation, enabling unauthorized upgrades.
        </Paragraph>
        <Paragraph>
          <Text strong>Remediation:</Text> Require <code>getProxyAdmin(proxy) == address(this)</code> before mutating and
          align ProxyAdmin ownership with Transparent admin roles.
        </Paragraph>
        <Divider />
        <Title level={4}>H-02 — Stealth admin actions during upgradeToAndCall init</Title>
        <Paragraph>
          <Text strong>Type:</Text> High-impact misconfiguration · <Text strong>Status:</Text> Confirmed
        </Paragraph>
        <Paragraph>
          <code>upgradeToAndCall</code> executes initializer code with admin privileges. Malicious initializers can
          re-enter admin routines mid-upgrade.
        </Paragraph>
        <Paragraph>
          <Text strong>Remediation:</Text> Prefer two-step upgrades and forbid initializers from touching EIP-1967 slots or
          admin routines.
        </Paragraph>
        <Divider />
        <Title level={4}>M-03 — ETH sink on upgradeToAndCall; value not forwarded</Title>
        <Paragraph>
          <Text strong>Type:</Text> Operational hazard · <Text strong>Status:</Text> Confirmed
        </Paragraph>
        <Paragraph>
          Value sent with <code>upgradeToAndCall</code> remains locked in the proxy unless explicitly swept. Because admins
          cannot hit logic functions, the ETH can be stranded.
        </Paragraph>
        <Paragraph>
          <Text strong>Remediation:</Text> Force <code>msg.value == 0</code> by default and supply a deliberate sweep path
          when value must move.
        </Paragraph>
      </>
    )
  },
  {
    id: 'remediation',
    heading: '6. Remediation Plan & Checklists',
    content: (
      <>
        <Title level={4}>A. What to do this week</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>Ban Transparent + UUPS mixing or enforce on-chain asserts before mutating.</li>
          <li>Initialize with explicit addresses; never rely on <code>msg.sender</code>.</li>
          <li>Block <code>changeAdmin</code> when <code>proxy == newAdmin</code>.</li>
          <li>Default <code>msg.value</code> to zero on upgrades; require flags for exceptions.</li>
          <li>Add selector-collision CI checks for the proxy admin surface.</li>
        </ul>
        <Title level={4}>B. Safe upgrade path (Transparent proxy)</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>Propose via timelock or multisig.</li>
          <li>Execute <code>upgradeTo(newImplementation)</code> without calldata.</li>
          <li>Verify <code>ADMIN_SLOT</code> and <code>IMPLEMENTATION_SLOT</code> before/after.</li>
          <li>Invoke reinitializers from runtime governance, not the admin.</li>
        </ul>
      </>
    )
  },
  {
    id: 'appendix',
    heading: '7. Appendix',
    content: (
      <>
        <Title level={4}>Applicability of known issues</Title>
        <Paragraph>
          <Text strong>I-01: CVE-2023-30541 (Transparent selector clash).</Text> Patched in OpenZeppelin Contracts v4.8.3+.
          Versions referenced here are not affected; the finding is informational.
        </Paragraph>
        <Title level={4}>EIP-1967 slots</Title>
        <Paragraph>
          Treat the following slots as critical infrastructure. Monitor them on-chain and ensure initializers cannot
          overwrite them:
        </Paragraph>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>_ADMIN_SLOT</li>
          <li>_IMPLEMENTATION_SLOT</li>
          <li>_BEACON_SLOT</li>
        </ul>
        <Title level={4}>References</Title>
        <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
          <li>Jolicoeur-Martineau, A. (2025). Less is More: Recursive Reasoning with Tiny Networks.</li>
          <li>OpenZeppelin – Proxy Contracts Documentation.</li>
          <li>Chainlink – Data Feeds Documentation.</li>
        </ul>
      </>
    )
  }
];

const anchorItems = sections.map((section) => ({
  key: section.id,
  href: `#${section.id}`,
  title: section.heading
}));

export function SecurityReportPage() {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} xl={18}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {sections.map((section) => (
            <Card
              key={section.id}
              id={section.id}
              style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Title level={3} style={{ color: '#f4f7ff' }}>
                {section.heading}
              </Title>
              <div style={{ color: '#c8d1f5' }}>{section.content}</div>
            </Card>
          ))}
        </Space>
      </Col>
      <Col xs={24} xl={6}>
        <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 24 }}>
          <Title level={4} style={{ color: '#f4f7ff' }}>
            Quick navigation
          </Title>
          <Anchor affix={false} items={anchorItems} style={{ color: '#f4f7ff' }} />
        </Card>
      </Col>
    </Row>
  );
}
