#!/bin/bash

# Start multiple website monitoring workers and one database consumer

echo "🚀 Starting BetterStack monitoring system..."

# Configuration
REGION_ID=${REGION_ID:-"5cf15d26-919a-4d7b-a032-d350cb3e4716"}
WORKER_COUNT=${WORKER_COUNT:-4}
BATCH_SIZE=${BATCH_SIZE:-50}
BATCH_INTERVAL=${BATCH_INTERVAL:-5000}

echo "📊 Configuration:"
echo "   Region: $REGION_ID"
echo "   Workers: $WORKER_COUNT"
echo "   DB Batch Size: $BATCH_SIZE"
echo "   DB Batch Interval: ${BATCH_INTERVAL}ms"

# Start database consumer
echo "🗄️  Starting database consumer..."
BATCH_SIZE=$BATCH_SIZE BATCH_INTERVAL=$BATCH_INTERVAL bun run database-consumer.ts &
DB_CONSUMER_PID=$!

# Start website workers
for i in $(seq 1 $WORKER_COUNT); do
    WORKER_ID="worker-$i"
    echo "🔍 Starting website worker: $WORKER_ID"
    REGION_ID=$REGION_ID WORKER_ID=$WORKER_ID bun run index.ts &
    sleep 2  # Small delay between workers
done

echo "✅ All workers started!"
echo "📊 Monitoring:"
echo "   - Website workers: $WORKER_COUNT instances"
echo "   - Database consumer: 1 instance (PID: $DB_CONSUMER_PID)"
echo ""
echo "Press Ctrl+C to stop all workers"

# Wait for all background processes
wait
