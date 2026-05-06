# Campus Notification Platform — Frontend

React + Material UI frontend for the campus notification system.

## Setup

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Features

- Fetch live notifications from the Affordmed evaluation API
- Filter by type: Placement, Event, Result
- Mark individual or all notifications as read
- Priority Mode: applies the min-heap algorithm to show Top 10 by priority score
- Token input with easy refresh (token expires every ~15 min)

## Usage

1. Get a fresh token from `POST http://20.207.122.201/evaluation-service/auth`
2. Paste the `access_token` into the app and click **Load Notifications**
3. Use filter chips to filter by type
4. Toggle **Priority Mode** to see the top 10 scored notifications
