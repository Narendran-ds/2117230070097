# Notification System Design

## stage 1

The system provides APIs for students to view the notifications of placements, events and results. APIs that support pagination, filtering, unread count, mark notifications as read. All APIs are protected via Bearer Token authentication. Real Time Notification( WebSockets ) - To avoid repeated polling and improve the experience of the users.


## stage 2

Since the notification data is structured and we need efficient queries, we chose Postgres. Main tables are students and notifications with read/unread status. As the data grows, indexing, pagination and Redis caching can help to improve performance. The queries are mostly based on student id, notification type and read status.


## Stage 3

The query is slow because the notifications table has millions of rows and is not properly indexed. A composite index on studentID, isRead, createdAt may help performance. Adding indexes on all columns is not recommended as it increases the storage and slows down inserts. Pagination should also be used instead of getting all rows.
 

## Step 4

Fetching notifications on every page refresh increases database load dramatically. You can use Redis caching to reduce the number of repeated database queries and enhance response time. Lazy loading and pagination help to limit the amount of data fetched at once. WebSockets can also push real time updates instead of continuous polling.

## Stage 5

The current notify-all implementation is slow, because it processes students one-by-one in a synchronous way. Message queues such as RabbitMQ or Kafka can help improve scalability and reliability. Failed emails should be retried individually without halting other notifications. Database saving and email sending should be done independently via background workers.


## stage 6

Priority notifications are ordered by notification type and recency. Placement notifications have the highest priority, followed by results and events. Use a heap or priority queue to efficiently keep the top 10 notifications. This is better than sorting the full notification list every time.




