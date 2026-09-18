# Jeeva Health Hub

Build "Jeeva", a modern, responsive full-stack healthcare web application for students and general users.

Key requirements & architecture:
1. Design & Branding:
   - Clean, professional healthcare UI with light/dark theme support.
   - Color palette: Crisp white/light background with medical blue and teal accents, rounded cards, subtle elevation shadows, smooth micro-interactions.
   - Prominent, persistent medical disclaimer: risk assessments and AI chat are informational and educational, not medical diagnoses.
   - Fully responsive for mobile, tablet, and desktop with clean sidebar/navbar navigation.

2. Navigation & Pages:
   - Landing Page: Hero with "Your Health. Smarter Insights.", CTAs ("Check Your Risk", "Explore Dashboard"), features overview, how it works, previews of AI assistant, risk assessment, tracker, and doctor directory, FAQ, and footer.
   - Authentication: Clean login, signup, forgot password modals/pages with demo guest access toggle.
   - Dashboard: Personalized welcome, BMI & vital statistics cards, risk assessment summaries, health trend charts (Recharts), activity tracker, upcoming appointments, health reminders, and quick action cards.
   - User Health Profile: Complete profile editor (age, gender, height, weight, BP, physical activity, smoking, alcohol, medical history, allergies) with automatic BMI and health tier calculation.
   - Risk Assessment Module:
     * Separate modules for Heart Disease Risk and Diabetes Risk with clinical input parameters.
     * Clean service layer in `src/services/mlService.ts` (`predictHeartRisk()`, `predictDiabetesRisk()`) with realistic mock scoring logic and clear comments for future Python/FastAPI ML endpoint integration.
     * Results breakdown showing risk tier, risk score percentage, main contributing factors, educational recommendations, and doctor consultation advisory.
   - Health Tracker: Interactive logging for weight, blood pressure, blood glucose, heart rate, water intake, sleep, and activity with 7-day, 30-day, and 6-month historical charts and summary statistics.
   - Jeeva Assistant: Conversational AI health educator interface with user/assistant bubbles, typing indicator, suggested starter prompts, and medical safety notices.
   - Doctor Directory & Appointments: Searchable list of doctors filterable by specialty and location, doctor detail profiles, interactive appointment booking modal (date, time slot, symptoms/reason), and appointment management (upcoming, past, cancellation).
   - Health Reports: Consolidated health summary showing patient info, vitals, risk assessment results, trend charts, and a printable/downloadable report view.
   - Notifications & Reminders: Alerts for vitals logging, hydration, upcoming appointments, and wellness check-ins.
   - Settings: Preferences for units, notifications, theme toggles, and account management.

3. Demo Data & State:
   - Provide realistic, rich default demo data across all modules so every feature is immediately interactive and functional out of the box.
   - Ensure clean component architecture with reusable UI elements and form validation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/618e0856-cb97-4c6e-98f5-c80bdb5f7076).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
