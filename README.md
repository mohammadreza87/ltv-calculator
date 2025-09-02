# Mobile Game LTV Calculator

A data-driven decision framework for mobile game scaling, featuring advanced LTV calculations and strategic recommendations.

## Features

### Three Calculation Methods

1. **Basic Method** - Quick LTV estimates using D1/D7 retention and ARPDAU
2. **Intermediate Method** - Cohort-based analysis with multiple traffic sources
3. **Advanced Method** - Comprehensive analysis including retention curves, monetization mix, and market segmentation

### Key Metrics Calculated

- **Lifetime Value (LTV)** - 90/180/365 day projections
- **LTV:CPI Ratio** - Unit economics assessment
- **ROAS Projections** - D7/D30/D90 return on ad spend
- **Retention Analysis** - Power law curve fitting
- **Monetization Mix** - IAP vs Ad revenue breakdown
- **Organic Uplift** - K-factor and effective CPI calculations

### Strategic Decision Framework

The calculator provides three actionable recommendations:
- **SCALE** - Metrics support growth investment
- **ITERATE** - Optimization needed before scaling
- **PIVOT/SHUTDOWN** - Fundamental issues require addressing

## Live Demo

Visit: [https://[your-username].github.io/ltv-calculator](https://[your-username].github.io/ltv-calculator)

## Local Development

1. Clone the repository
2. Open `index.html` in your browser. If your browser blocks ES module file imports from `file://`, serve locally:
   - Python: `python3 -m http.server 8080` then visit `http://localhost:8080`
3. No build process required - pure HTML/CSS/JavaScript (ES Modules)

## Project Structure

- `index.html` — Markup only, references external CSS/JS
- `assets/css/styles.css` — Styles and responsive layout
- `src/`
  - `main.js` — App bootstrap (DOMContentLoaded)
  - `ui.js` — Event handlers, DOM updates, result rendering
  - `calculations.js` — LTV/ROAS/retention utilities and per-method compute functions
  - `charts.js` — Chart rendering for Basic/Intermediate/Advanced

## Technologies Used

- Pure HTML5
- CSS3 with modern gradients and animations
- Vanilla JavaScript (ES Modules) + Chart.js via CDN
- Responsive design for mobile/tablet/desktop

## Author

Built by **REXA** with Claude.ai

Connect on LinkedIn: [linkedin.com/in/reza-h](https://www.linkedin.com/in/reza-h/)

## License

MIT License - Feel free to use and modify for your projects
