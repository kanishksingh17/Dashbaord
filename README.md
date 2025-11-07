# ShowWork Dashboard

A modern, feature-rich dashboard component for portfolio management and analytics.

## Features

- 📊 **Analytics Metrics**: Total Reach, Engagement, Active Projects, Published Posts
- 🎯 **Portfolio Health Score**: AI-powered analysis with detailed breakdown
- 📁 **Project Management**: View and manage active projects
- 🤖 **AI Insights**: Smart recommendations for portfolio improvement
- 🔔 **Network Activity**: Recent connections and interactions
- 👤 **User Profile**: Display user information with tech stack and preferences

## Components

- `Dashboard.tsx` - Main dashboard component
- `UnifiedSidebar.tsx` - Navigation sidebar
- `PortfolioHealthScore.tsx` - Portfolio health display component
- `usePortfolioHealth.ts` - Portfolio health data hook

## Installation

```bash
npm install react react-router-dom lucide-react
```

## Usage

```tsx
import Dashboard from './src/pages/Dashboard';

function App() {
  return <Dashboard />;
}
```

## API Endpoints Required

- `GET /api/auth/me` - User profile
- `GET /api/projects` - User projects
- `GET /api/dashboard/portfolio-metrics` - Portfolio analytics
- `GET /api/analytics/social-media-overview` - Social media metrics
- `GET /api/analytics/published-posts` - Published posts
- `GET /api/portfolio/health` - Portfolio health score

## Technologies

- React
- TypeScript
- Tailwind CSS
- React Router
- Lucide React Icons

## License

MIT

