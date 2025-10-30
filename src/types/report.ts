import { z } from 'zod';

export const severitySchema = z.enum(['Critical', 'High', 'Medium', 'Low', 'Info', 'N/A']);

export type Severity = z.infer<typeof severitySchema>;

export const findingDetailsSchema = z.object({
  description: z.string(),
  severity: severitySchema,
  line_numbers: z.array(z.number().int()).optional(),
  red_team_argument: z.string().optional(),
  blue_team_argument: z.string().optional(),
  final_conclusion: z.string().optional(),
  attack_scenario: z.string().optional(),
  economic_impact: z.string().optional(),
  contracts_involved: z.array(z.string()).optional(),
  chained_findings: z.array(z.string()).optional()
});

export const findingSchema = z.object({
  source: z.string(),
  details: findingDetailsSchema
});

export const auditMetaSchema = z
  .object({
    project_root: z.string().optional(),
    files: z.array(z.string()).default([]),
    generated_at: z.number().int().optional()
  })
  .default({ files: [] });

export const auditReportSchema = z.object({
  security_score: z.number().min(0),
  findings: z.array(findingSchema),
  meta: auditMetaSchema
});

export type FindingDetails = z.infer<typeof findingDetailsSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type AuditReport = z.infer<typeof auditReportSchema>;

export type SeverityBucket = Record<Severity, Finding[]>;

export const ADMIN_SIGNATURES = [
  { signature: 'admin()', selector: '0xf851a440' },
  { signature: 'implementation()', selector: '0x5c60da1b' },
  { signature: 'changeAdmin(address)', selector: '0x8f283970' },
  { signature: 'upgradeTo(address)', selector: '0x3659cfe6' },
  { signature: 'upgradeToAndCall(address,bytes)', selector: '0x4f1ef286' }
];

export const UUPS_SIGNATURES = [
  { signature: 'upgradeTo(address)', selector: '0x3659cfe6' },
  { signature: 'upgradeToAndCall(address,bytes)', selector: '0x4f1ef286' },
  { signature: 'authorizeUpgrade(address)', selector: '0x5a6e9ae6' },
  { signature: 'proxiableUUID()', selector: '0x52d1902d' }
];

export const beaconContracts = ['UpgradeableBeacon', 'BeaconProxy'];
