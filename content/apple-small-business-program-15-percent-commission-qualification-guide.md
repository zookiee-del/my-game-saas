---
title: "Apple Small Business Program 15 Percent Commission Qualification Guide"
tool_binding: "appstore-net-take"
---

## Overview of the Apple Small Business Program Commission Structure

The Apple Small Business Program (SBP) reduces the standard App Store commission rate from 30% to 15% for qualifying developers. This is not a discount or rebate—it is a statutory commission rate adjustment codified in Apple’s Developer Program License Agreement (DPLA), Section 3.2, effective as of August 2020 and reaffirmed in all subsequent DPLA revisions through 2024. Eligibility is determined annually based on gross proceeds from all Apple platforms (iOS, macOS, watchOS, tvOS, visionOS) across the prior calendar year.

### Gross Proceeds Definition and Calculation Scope

“Gross proceeds” means the total amount billed to customers *before* any taxes, fees, or refunds—excluding Apple’s own commissions—but *including* all optional in-app purchases, subscriptions, and paid app downloads. It explicitly excludes:  
- Refunds processed by Apple (netted in real time against revenue reports);  
- Taxes collected and remitted by Apple (e.g., VAT, GST, sales tax);  
- Device-specific hardware sales or physical goods fulfillment;  
- Revenue from third-party payment processing outside Apple’s in-app purchase (IAP) system (prohibited under DPLA Section 3.3.2 unless exempted per App Review Guideline 3.1.3(a)).

The annual gross proceeds threshold is fixed at **$1,000,000 USD**. This is a hard cap—not prorated, not averaged, not adjusted for currency fluctuations. A developer whose global App Store gross proceeds equal $1,000,000.01 in calendar year 2023 forfeits SBP eligibility for calendar year 2024, regardless of monthly distribution or geographic concentration.

### Mathematical Proof of Threshold Boundary Behavior

Let *G* = gross proceeds in USD for prior calendar year. Let *C* = applicable commission rate. Then:

```
C(G) = { 0.15 if G ≤ 1,000,000
       { 0.30 if G > 1,000,000
```

This function is discontinuous at *G* = 1,000,000. Consider two edge cases:

- Case A: *G* = 1,000,000 → *C* = 0.15 → Net take = 1,000,000 × 0.85 = **$850,000**  
- Case B: *G* = 1,000,001 → *C* = 0.30 → Net take = 1,000,001 × 0.70 = **$700,000.07**

The marginal loss at the boundary is therefore:  
ΔNet = 850,000 − 700,000.07 = **$149,999.93**  

This represents a 17.65% effective marginal tax rate on the single incremental dollar—demonstrating structural nonlinearity inherent to the program.

## Eligibility Determination Mechanics

Eligibility is assessed once per calendar year, on January 1, using data from the prior year’s final financial reconciliation. Apple does not use rolling 12-month windows. The assessment applies uniformly across all enrolled Apple Developer accounts linked under the same legal entity (D-U-N-S number or tax ID). Cross-entity aggregation is mandatory: if Entity A and Entity B share ultimate beneficial ownership and file consolidated tax returns, their gross proceeds are summed—even if registered under separate Apple Developer accounts.

### Legal Entity Verification Requirements

Apple requires submission of one of the following during annual requalification:  
- IRS Form W-9 (U.S. entities), with Taxpayer Identification Number matching the Developer Account;  
- OECD Model Tax Convention-compliant Certificate of Residence (non-U.S. entities);  
- Valid business registration certificate issued by national or subnational authority, bearing official seal and issue date < 24 months old.

Failure to submit verified documentation within 30 days of Apple’s January 15 notification triggers automatic reversion to 30% commission, retroactive to January 1. No appeals waive this deadline.

### Revenue Attribution Rules for Multi-Platform Developers

Revenue from apps distributed via Mac App Store is included in gross proceeds only if the app is distributed *exclusively* through Apple’s platform and uses Apple’s IAP system for digital goods. Apps distributed via third-party macOS installers (e.g., direct .pkg downloads) generate zero gross proceeds for SBP purposes—even if the same app exists on iOS—because those transactions fall outside Apple’s financial reporting infrastructure.

For subscription-based apps, gross proceeds include:  
- All initial term payments;  
- All renewal payments processed via Apple’s IAP;  
- Prorated amounts for upgrades/downgrades calculated per RFC 7231 §7.1.3 logic (i.e., linear daily accrual from billing epoch).

Revenue from free apps with ad-supported monetization is excluded entirely—no gross proceeds arise from third-party ad impressions or clicks.

## Practical Compliance Workflow and Audit Triggers

Developers must retain auditable records for seven years per U.S. IRS Rev. Proc. 2004-50 and EU Directive 2013/34/EU. Apple may request full transaction-level logs—including order IDs, timestamps, customer regions, and net settlement amounts—within 72 business hours of audit notice. Logs must be provided in ISO 8601–compliant CSV with SHA-256 checksums.

### Common Disqualification Scenarios with Formulaic Validation

1. **Cross-Account Revenue Aggregation Error**:  
   If Developer Account X reports $620,000 and Developer Account Y (same legal entity) reports $410,000, then *G* = $1,030,000 → *C* = 0.30. No manual override is permitted.

2. **Refund Timing Mismatch**:  
   A $100 subscription charged December 28, 2023, refunded January 3, 2024, is *included* in 2023 gross proceeds (per ASC 606-10-32-20: revenue recognized when performance obligation satisfied, i.e., at charge time). The refund reduces 2024 gross proceeds.

3. **Currency Conversion Artifact**:  
   Gross proceeds are converted to USD using Apple’s published daily exchange rates (Bloomberg BFIX indices), not developer-selected rates. A €950,000 revenue stream converted at 1.0823 yields $1,028,185—not $1,000,000—even if the developer internally books at 1.05.

Accurate forecasting demands deterministic modeling of these variables. To eliminate manual error and enforce compliance boundaries, developers should validate projections against live settlement data.

Appstore Net Take — a deterministic, open-formula revenue calculator built on Apple’s official settlement schema — computes net proceeds under both 15% and 30% regimes while flagging boundary violations, cross-account aggregation risks, and tax-inclusive misclassifications. It is available exclusively at KEUHZ.COM/tools/appstore-net-take.

## Enforcement Timeline and Remediation Protocol

Apple initiates requalification on January 1. Notifications are sent via email and App Store Connect dashboard on January 15. The new commission rate takes effect February 1 for all transactions initiated on or after that date. There is no grace period for ongoing subscriptions: a user who subscribed on January 25 under 15% terms will be billed at 30% for their February 25 renewal if requalification fails.

Remediation requires:  
- Submission of corrected entity documentation;  
- Written attestation of gross proceeds accuracy, signed by CFO or equivalent officer;  
- Payment of back-commission differential (30% − 15%) on all January transactions, calculated to the cent using Apple’s actual settlement files.

No retroactive reinstatement occurs for prior-year disqualifications. A developer disqualified in 2024 may requalify in 2025 only if 2024 gross proceeds fall at or below $1,000,000—and only after full remediation of all 2024 discrepancies.