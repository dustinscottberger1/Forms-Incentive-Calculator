# Sharecare Incentive Calculator

Interactive quarterly incentive model for the Disability Forms team. Models how
productivity (oMAP) and utilization improvements can self-fund an employee
incentive pool.

## Updating the data

All employee numbers live in `src/data.js`. To refresh with new actuals:

1. Export the latest oMAP / Adjusted Records / Hours / Utilization spreadsheet.
2. Open a Claude conversation and say: _"Regenerate my data.js from this
   spreadsheet using the same anonymization rules (first name + last initial)."_
3. Paste the new contents into `src/data.js` and commit. Vercel will
   auto-redeploy within about 30 seconds.

You never need to touch `App.jsx` to update the numbers.

## Running locally (optional)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Deploying

Push to GitHub, then import the repo into Vercel. Vercel auto-detects Vite —
no configuration needed.
