# FutbolVitrini - Features Documentation

FutbolVitrini is a scouting platform blending the marketplace logic of Sahibinden.com with the analytical depth of Football Manager.

## Core Features
1. **Role-Based Dashboards**: 
   - **Admin Dashboard**: For platform administration.
   - **Scouting Hub & Coach Dashboard**: For scouts and coaches to discover, filter, and analyze players.
   - **Player Dashboard**: For football players to manage their profiles and showcase their abilities.
2. **Player Showcase & Analytics**: Deep analytical views using Recharts for visualizing player stats (`PlayerAnalytics.tsx`, `PlayerShowcase.tsx`).
3. **Messaging Hub**: Internal communication system between scouts, coaches, and players (`MessagingHub.tsx`).
4. **Premium Plans**: Subscription models for advanced features (`PremiumPlans.tsx`).
5. **API Authentication with Offline Login Fallback**: Login, refresh, logout, session restore,
   registration and admin approval use the backend API. Only network-failed login falls back to
   the fixed demo accounts; registration always requires the backend.
