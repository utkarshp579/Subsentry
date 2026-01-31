# SubSentry Renewal Alert Rules API

A robust API for managing subscription renewal alerts and notifications.

## Features

- **Alert Rules Management**: Create, read, update, and delete alert rules
- **Multiple Channels**: Support for email, in-app, push, and SMS notifications
- **Upcoming Renewals**: Get subscriptions due within specified timeframes
- **Smart Filtering**: Filter renewals based on user's alert preferences
- **Pagination**: Efficient data retrieval with pagination support
- **Security**: User-scoped data access with authentication middleware
- **Validation**: Comprehensive input validation and error handling

## API Endpoints

### Alert Rules

- `POST /api/alerts/rules` - Create or update alert rule
- `GET /api/alerts/rules` - Get all alert rules for user
- `PATCH /api/alerts/rules/:id/toggle` - Enable/disable alert rule
- `DELETE /api/alerts/rules/:id` - Delete alert rule

### Upcoming Renewals

- `GET /api/alerts/upcoming` - Get upcoming subscription renewals
- `GET /api/alerts/upcoming/summary` - Get summary of upcoming renewals

## Data Models

### AlertRule Schema
```javascript
{
  userId: ObjectId,
  daysBefore: Number, // 1, 3, 7, 14, 30
  channels: Array, // ['email', 'in-app', 'push', 'sms']
  enabled: Boolean,
  notificationTime: String, // 'HH:MM'
  timezone: String,
  createdAt: Date,
  updatedAt: Date
}