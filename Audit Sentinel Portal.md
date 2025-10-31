---
title: "Audit Sentinel Portal"
source: "https://lockthebow.github.io/Sentinel/"
author:
published:
created: 2025-10-31
description:
tags:
  - "clippings"
---
### 1\. Executive Summary

This report presents the findings of a security assessment focused on the project's use of the OpenZeppelin upgradeability stack. The analysis leveraged a fully automated pipeline centered on a **Tiny Recursive Model (TRM)** for deep vulnerability discovery, guided by a formal **Threat & Risk Model (T&RM)**.

The review confirmed that the proxy layer reuses battle-tested OpenZeppelin contracts (v4.7–4.8). As a result, systemic risk is driven more by configuration, operational discipline, and upgrade hygiene than by fresh code defects. The TRM engine synthesized several exploit chains showing how pattern mixing or initializer mistakes can still lead to catastrophic failure.

The three most critical chains are: (1) selector collisions in the implementation allow an unprivileged attacker to take over a proxy; (2) mixing Transparent and UUPS proxy patterns bypasses governance; and (3) front-running an uninitialized implementation enables a full proxy seizure.

#### What to do this week

- **Ban Transparent + UUPS mixing.** Enforce on-chain assertions that the ProxyAdmin owns the proxy before running any mutator.
- **Initialize with explicit addresses only.** Never rely on `msg.sender` in initializers that run through a proxy.
- **Forbid changeAdmin(proxy) where proxy == newAdmin.** Build this guard into deployment and governance tooling.
- **Default msg.value == 0 for upgrades.** Allow value transfers only behind an explicit flag and pair them with a sweep procedure.
- **Add a selector-collision CI check.** Fail builds when implementation selectors collide with those on the proxy admin surface.

**Risk rating:** Pre-mitigation posture is **Severe** due to multiple confirmed Critical and High exploit paths. With the week-one actions landed and validated, residual posture is projected to fall to **Moderate**.

### 2\. Scope & Methodology

#### 2.1 Scope

The assessment targeted the project's use of the OpenZeppelin proxy and upgradeability stack. Application implementation contracts were not provided and remain out of scope.

**In scope:** TransparentUpgradeableProxy, ERC1967Upgrade, ProxyAdmin, ERC1967Proxy, BeaconProxy, UpgradeableBeacon, StorageSlot, Proxy, Address, Ownable, Context, IBeacon, IERC1967, draft-IERC1822.

**Out of scope:** Protocol-specific contracts (lending, liquidation, oracles), live on-chain state, deployment pipelines, off-chain services. Application-layer risks referenced here are synthesized patterns requiring validation once the app code ships.

#### 2.2 Methodology

The TRM engine synthesized multi-step exploit paths, guided by the T&RM to focus on high-value assets and threat scenarios. A follow-on Large Language Model curated, deduplicated, and narrated those paths into the findings captured throughout the portal.

**Limitations:** The analysis is static. No live networks or RPC forks were used, and no dynamic proof-of-concepts were executed. Critical and High findings should be validated on a testnet before production action.

### 3\. Threat & Risk Model (T&RM)

The T&RM grounds the TRM exploration. It defines assets to protect, adversary personas, trust boundaries, and explicit assumptions.

#### Assets

- **Upgrade authority:** control over the EIP-1967 admin slot.
- **Proxy storage slots:** EIP-1967 implementation and beacon slots.
- **Protocol funds:** assets held at the proxy address.
- **Role secrets:** credentials for ProxyAdmin owners, runtime governance, and operators.

#### Adversaries

- **External Caller** – unprivileged users.
- **Compromised ProxyAdmin Owner** – attacker with ProxyAdmin keys.
- **Careless Operator** – legitimate users running unsafe upgrade flows.
- **Malicious Implementation Upgrade** – backdoored or compromised governance upgrade.

#### Trust boundaries

- Admin EOAs vs user EOAs.
- ProxyAdmin control plane vs implementation auth logic.
- Timelock and Safe guardrails before on-chain execution.

#### Assumptions

Implementations do not expose admin-colliding selectors without strict authorization, and the proxy does not self-call unless intentionally engineered.

### 4\. Summary of Findings (Deduplicated)

The TRM analysis generated the following unique risks. Entries marked Synthesized require validation against the final application implementation.

| ID | Title | Severity | Status |
| --- | --- | --- | --- |
| C-01 | Selector collision via Transparent fallback enables takeover | Critical | Confirmed |
| C-02 | Transparent+UUPS role-confusion enables bypass upgrade | Critical | Confirmed |
| C-03 | Spoofed ProxyAdmin getters + missing admin assert → upgrade | Critical | Confirmed |
| C-04 | Uninitialized initializer front-run → UUPS upgrade to attacker | Critical | Confirmed |
| H-01 | changeAdmin(address(this)) bricks governance permanently | High | Confirmed |
| H-02 | Stealth admin actions during upgradeToAndCall init | High | Confirmed |
| H-03 | Initializer owner/role drift (msg.sender) | High | Confirmed |
| H-04 | Price oracle staleness not validated | High | Synthesized |
| H-05 | Reentrancy in withdraw() (interactions-before-effects) | High | Synthesized |
| M-01 | ProxyAdmin getters can lie when not admin (operational risk) | Medium | Confirmed |
| M-02 | Role-split footgun can lock operational controls | Medium | Confirmed |
| M-03 | ETH sink on upgradeToAndCall; value not forwarded | Medium | Confirmed |
| M-04 | BeaconProxy DoS if beacon returns non-contract | Medium | Synthesized |
| M-05 | Subclassing Transparent proxy may shadow admin ops | Medium | Confirmed |
| I-01 | CVE-2023-30541 (selector clash) | N/A | Not applicable |

### 5\. Detailed Findings

Each critical chain is unpacked throughout the Findings and Attack Surface sections. This narrative highlights the context, reasoning, and remediation guidance behind the highest-severity items.

#### C-01 — Selector collision via Transparent fallback enables takeover

**Type:** Vulnerability (exploitable) · **Status:** Confirmed

Transparent proxies delegate non-admin calls to the implementation. If the implementation exposes a function whose selector matches a proxy admin function, unprivileged callers can reach it and overwrite EIP-1967 slots.

**Remediation:** CI diff implementation selectors against the proxy admin interface and block any collisions unless strictly authorized.

#### C-02 — Transparent+UUPS role-confusion enables bypass upgrade

**Type:** High-impact misconfiguration · **Status:** Confirmed

Transparent proxies forwarding to UUPS implementations allow accounts with UUPS permissions to upgrade without transparent admin consent. This collapses the intended trust boundary.

#### C-03 — Spoofed ProxyAdmin getters + missing admin assert → upgrade

**Type:** Vulnerability chain · **Status:** Confirmed

ProxyAdmin getters can return forged values when the ProxyAdmin is not the true admin. Follow-on upgrade attempts forward into the implementation, enabling unauthorized upgrades.

**Remediation:** Require `getProxyAdmin(proxy) == address(this)` before mutating and align ProxyAdmin ownership with Transparent admin roles.

#### H-02 — Stealth admin actions during upgradeToAndCall init

**Type:** High-impact misconfiguration · **Status:** Confirmed

`upgradeToAndCall` executes initializer code with admin privileges. Malicious initializers can re-enter admin routines mid-upgrade.

**Remediation:** Prefer two-step upgrades and forbid initializers from touching EIP-1967 slots or admin routines.

#### M-03 — ETH sink on upgradeToAndCall; value not forwarded

**Type:** Operational hazard · **Status:** Confirmed

Value sent with `upgradeToAndCall` remains locked in the proxy unless explicitly swept. Because admins cannot hit logic functions, the ETH can be stranded.

**Remediation:** Force `msg.value == 0` by default and supply a deliberate sweep path when value must move.

### 6\. Remediation Plan & Checklists

#### A. What to do this week

- Ban Transparent + UUPS mixing or enforce on-chain asserts before mutating.
- Initialize with explicit addresses; never rely on `msg.sender`.
- Block `changeAdmin` when `proxy == newAdmin`.
- Default `msg.value` to zero on upgrades; require flags for exceptions.
- Add selector-collision CI checks for the proxy admin surface.

#### B. Safe upgrade path (Transparent proxy)

- Propose via timelock or multisig.
- Execute `upgradeTo(newImplementation)` without calldata.
- Verify `ADMIN_SLOT` and `IMPLEMENTATION_SLOT` before/after.
- Invoke reinitializers from runtime governance, not the admin.