🔍 Mission: High-Fidelity Spirits Data Overhaul
Objective:Conduct a full-scale audit, cleanup, and upgrade of the Spirits Database and Scraper to ensure top-tier data quality and peak scraper performance. The goal is clear: precision, consistency, and reliability. Every entry should reflect the best of what the scraper is capable of.

✅ Execution Plan (Step-by-Step)
1. Audit the Latest Entries
* Pull the most recent 500 records from the spirits table in Supabase using MCP.
* Manually review and categorize each as:
    * ✔️ Clean — Accurate, complete, and properly formatted
    * ❌ Dirty — Duplicates, malformed data, missing fields, misclassifications
* Use a strict lens. This is a quality gate, not a casual review.
2. Document the Breakdown
* Create two living documents:
    * V3.X-FIXES.md — Log specific problems and real-world bad data samples
    * V3.X-SCRAPER-IMPROVEMENTS.md — Note what’s working and flag logic gaps or potential improvements
3. Clean the Data
* Immediately correct or purge low-quality entries
* For ambiguous cases:
    * Add inline REVIEW_NEEDED comments to the DB
    * Or export to a REVIEW_NEEDED.csv for later triage
4. Define Quality Rules (Hard Ruleset)
* Draft a clear standard of what qualifies as a valid, high-quality entry
* Include:
    * Acceptable field formats and values
    * Required fields and fallback rules
    * Examples of tricky edge cases and how to handle them
5. Harden the Scraper Logic
* Refactor the scraper to maximize output quality and eliminate waste
* Implement guards against:
    * 🔁 Duplicates (including near-dupes with added fluff text)
    * 🧼 Poor formatting or incomplete data
    * 🧱 Empty or misparsed fields
    * 🍸 Incorrect spirit categorization
    * Incorrectly added spirits
    * Store names
    * Blogs and articles
6. Test & Optimize Aggressively
* Run the new scraper on a sample batch of 1,000+ spirits
* Track metrics like:
    * Pass/fail rate against new quality rules
    * Duplicate rate
    * Field completeness and accuracy
* Repeat until scraper output is clean, consistent, and production-grade

🧠 Mindset: Treat This Like a Data Quality Black Ops Mission
This is not a light cleanup. You are building a high-integrity foundation for everything downstream. Be thorough. Be brutal. Be obsessed with quality.
