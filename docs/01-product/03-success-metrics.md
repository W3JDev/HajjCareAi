# Success Criteria & Validation

## 1. Business Metrics (KPIs)
- **Adoption Rate:** 10,000+ Downloads during Hajj season.
- **User Satisfaction:** App Store Rating > 4.5 stars.
- **Safety Impact:** < 5% of users utilizing SOS features (indicates prevention).

## 2. Technical Success Criteria
| Metric | Target | Validation Method |
| :--- | :--- | :--- |
| **First Contentful Paint** | < 1.5s | Lighthouse Audit |
| **Accessibility Score** | 100 | Lighthouse Accessibility |
| **Offline Availability** | 100% | Service Worker Test (Network Throttle) |
| **AI Latency (Text)** | < 2s | Datadog/Sentry Tracing |
| **AI Latency (Live)** | < 500ms | End-to-end Latency Test |

## 3. User Acceptance Testing (UAT) Checklist
- [ ] User can change language from the header.
- [ ] SOS button triggers countdown and displays Arabic medical card.
- [ ] "Where is Kaaba" voice query returns correct map location.
- [ ] Uploading a medicine photo correctly identifies the drug name.
- [ ] App works in "Airplane Mode" (viewing previously loaded map/checklist).
