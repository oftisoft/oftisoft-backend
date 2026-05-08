# Database Optimization Indexes

This migration adds performance indexes to improve query speed for common operations.

## User Table Indexes
- `idx_users_email` - For login queries
- `idx_users_isActive` - For active user filtering
- `idx_users_role` - For role-based queries
- `idx_users_isEmailVerified` - For verification filtering

## Order Table Indexes
- `idx_orders_userId` - For user order queries
- `idx_orders_status` - For status filtering
- `idx_orders_createdAt` - For date range queries
- `idx_orders_orderNumber` - For order lookups

## Product Table Indexes
- `idx_products_categoryId` - For category filtering
- `idx_products_isActive` - For active product filtering
- `idx_products_price` - For price range queries

## Other Indexes
- `idx_messages_conversationId` - For chat queries
- `idx_notifications_userId_read` - For unread notification count
- `idx_favorites_userId` - For user favorites
- `idx_refreshTokens_userId` - For session management

## Migration Commands

```bash
# Generate migration
npm run migration:generate --name=add-performance-indexes

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```