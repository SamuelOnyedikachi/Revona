# ReVora Pilot Case Study
## 4-Week Urban Food Waste Exchange — Lagos, Nigeria

---

### 1. Executive Summary

ReVora is a web-based circular economy platform developed as part of a final-year Computer Science project. It connects urban market vendors generating surplus fruit and vegetable waste with poultry farmers and community composters who can convert that waste into valuable by-products.

This document reports on the 4-week pilot deployment conducted in Lagos, Nigeria, covering waste diversion outcomes, system usability, and lessons learned.

**Pilot target:**  ≥ 300 kg waste diverted · SUS score ≥ 70 · 80% reduction in search/logistics time

---

### 2. Pilot Design

#### 2.1 Participants

| Role | Count | Recruitment method |
|---|---|---|
| Market vendors | 4 | Mile 12, Oyingbo, Ketu, Agege markets |
| Poultry farmers | 2 | Ikorodu and Badagry local government areas |
| Community composters | 1 | Alimosho organic waste cooperative |

All participants provided written informed consent. Data processing was disclosed and conducted under NDPR guidelines.

#### 2.2 Protocol

- Week 1: Platform onboarding, training session (30 min), seed listings created
- Weeks 2–3: Live exchanges — vendors post listings, farmers/composters request pickups
- Week 4: Wrap-up, SUS survey administration, exit interviews

#### 2.3 Measurements

- **Waste diverted (kg):** Weighed by vendors at point of listing, verified by off-taker at pickup
- **Logistics time:** Self-reported before (baseline: phone/word-of-mouth) vs after (app)
- **Usability:** System Usability Scale (SUS) — 10 questions, 1–5 Likert scale, scored 0–100
- **Qualitative:** Semi-structured exit interview, 5–10 minutes per participant

---

### 3. Results

#### 3.1 Waste Diversion

| Metric | Result | Target | Status |
|---|---|---|---|
| Total waste diverted | 347 kg | ≥ 300 kg | ✅ Exceeded |
| Completed exchanges | 8 | — | — |
| CO₂e avoided | 190.9 kg | — | — |
| Compost produced (est.) | 83 kg | — | — |
| Animal feed produced (est.) | 45 kg | — | — |

Waste categories: tomatoes (28%), peppers (19%), mango/pineapple (24%), leafy greens (17%), mixed produce (12%).

#### 3.2 Logistics Time Reduction

Participants reported finding and arranging a waste collection via phone/word-of-mouth took an average of **3.2 hours** (range: 1–6 hours). Using ReVora reduced this to an average of **34 minutes** from listing to accepted request — an **82% reduction**, exceeding the 80% target.

#### 3.3 System Usability Scale (SUS)

SUS surveys were completed by all 7 pilot participants after at least 2 exchanges.

| Participant | Role | SUS Score |
|---|---|---|
| P1 | Vendor | 82.5 |
| P2 | Vendor | 77.5 |
| P3 | Vendor | 85.0 |
| P4 | Vendor | 72.5 |
| P5 | Farmer | 80.0 |
| P6 | Farmer | 75.0 |
| P7 | Composter | 87.5 |
| **Mean** | | **80.0** |

Mean SUS score: **80.0 / 100** — Grade B ("Good"), exceeding the ≥ 70 target.

Key SUS findings:
- Highest scores: Q5 (features well integrated), Q9 (felt confident using it)
- Lowest scores: Q4 (need technical support) and Q8 (awkwardness) — both reversed items, meaning users felt capable and comfortable
- All participants scored above the "acceptable" threshold of 70

#### 3.4 Ratings and Trust

- 16 ratings submitted across 8 completed exchanges
- All 16 ratings revealed (100% double-blind completion rate)
- Average vendor rating: 4.3 / 5.0
- Average farmer/composter rating: 4.6 / 5.0
- Badges awarded: 1 × "reliable" (vendor P3 after 5 exchanges with ≥ 4.5 rating)

---

### 4. Qualitative Findings

#### 4.1 Positive themes

**"It removed the trust problem."** — Farmer P5
> Previously, Farmer P5 had been given mouldy waste twice through informal channels. The photo verification on ReVora allowed him to assess quality before travelling to collect.

**"I posted at 7 AM and had a confirmed pickup by 9 AM."** — Vendor P1
> Mile 12 vendors highlighted speed as the primary benefit — waste that previously sat until the end of market day could be moved in hours.

**"The impact counter motivated me to post more."** — Vendor P3
> The real-time CO₂ savings display on the dashboard was cited by 3 of 4 vendors as a motivating factor for continued use.

**"The chat made it easy to coordinate without sharing my phone number."** — Composter P7
> Privacy of contact details (no phone number exchange required) was highlighted by the female vendor and composter participants.

#### 4.2 Areas for improvement

- **Offline access:** 2 vendors mentioned unstable internet at their market stalls, requesting a lightweight offline mode or SMS fallback
- **Local language:** Requests for Yoruba and Igbo interface translations
- **Quantity accuracy:** Vendors found it difficult to weigh waste precisely — a range field (e.g. "40–60 kg") was suggested
- **Farmer outreach:** The 2:1 vendor-to-farmer ratio suggests more off-takers are needed; marketing to farmers' cooperatives was recommended

---

### 5. Technical Performance

| Metric | Value |
|---|---|
| API uptime (4 weeks) | 99.2% |
| Average API response time | 187 ms |
| Mobile usability (Lighthouse) | 87 / 100 |
| Accessibility score (Lighthouse) | 91 / 100 |
| Core Web Vitals: LCP | 1.8 s (Good) |
| Core Web Vitals: CLS | 0.04 (Good) |
| Socket.IO chat latency (median) | 210 ms |

---

### 6. Environmental Impact Summary

| Metric | Pilot (4 weeks) | Annualised projection (7 users) |
|---|---|---|
| Waste diverted | 347 kg | 4,511 kg |
| CO₂e avoided | 190.9 kg | 2,481 kg |
| Compost produced | 83 kg | 1,079 kg |
| Animal feed produced | 45 kg | 585 kg |
| Tree equivalent | ~8 trees | ~113 trees |

Annualised figures assume consistent usage at pilot rate. Scaling to 100 active vendors would project ~64,400 kg waste diversion per year.

---

### 7. Recommendations

1. **Expand vendor recruitment** to 20+ vendors across 4 additional Lagos markets (Oyingbo, Balogun, Iponri, Agbado) before scaling
2. **Partner with farmers' cooperatives** (e.g. Ikorodu Poultry Farmers Association) to grow off-taker base
3. **Implement SMS fallback** for low-connectivity environments using Termii or Africa's Talking API
4. **Add quantity range field** to listing form (min–max kg) to reduce friction for vendors without scales
5. **Translate UI** to Yoruba and Igbo — community volunteers have expressed willingness to assist
6. **Explore logistics integration** with existing motorcycle courier (okada) networks for coordinated pickups
7. **Submit to NDPC** (Nigeria Data Protection Commission) for formal compliance assessment before public launch

---

### 8. Conclusion

ReVora's 4-week pilot successfully demonstrated that a web-based platform can meaningfully reduce food waste in Nigerian urban markets. All three primary targets were met or exceeded:

- ✅ **347 kg** waste diverted (target: 300 kg)
- ✅ **82%** reduction in logistics time (target: 80%)
- ✅ **SUS 80.0** usability score (target: ≥ 70)

The platform contributes to SDGs 2, 11, 12, and 13 and demonstrates a scalable, low-cost digital model for technology-enabled circular economies in sub-Saharan Africa. The open-source codebase is available for replication in other Nigerian cities and beyond.

---

### Appendix A — SUS Question Scoring Reference

| Q | Statement | Type | Weight |
|---|---|---|---|
| 1 | I think I would like to use ReVora frequently | Positive | Score − 1 |
| 2 | I found ReVora unnecessarily complex | Negative | 5 − Score |
| 3 | I thought ReVora was easy to use | Positive | Score − 1 |
| 4 | I would need technical support to use ReVora | Negative | 5 − Score |
| 5 | The various features were well integrated | Positive | Score − 1 |
| 6 | There was too much inconsistency in ReVora | Negative | 5 − Score |
| 7 | Most people would learn ReVora very quickly | Positive | Score − 1 |
| 8 | I found ReVora very awkward to use | Negative | 5 − Score |
| 9 | I felt very confident using ReVora | Positive | Score − 1 |
| 10 | I needed to learn a lot before getting started | Negative | 5 − Score |

**Final score = Sum of weighted scores × 2.5**

---

### Appendix B — Conversion Factor References

- FAO. (2022). *Food Loss and Food Waste.* Rome: Food and Agriculture Organization.
- IPCC. (2019). *2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories.* Chapter 3: Solid Waste Disposal.
- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. *Usability Evaluation in Industry*, 189(194), 4–7.
- Nigeria Data Protection Regulation. (2019). National Information Technology Development Agency (NITDA).
