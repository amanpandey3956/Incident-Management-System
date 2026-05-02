#!/bin/bash

BASE_URL="http://localhost:3001"

echo "Simulating RDBMS Outage..."
for i in {1..5}; do
  curl -s -X POST $BASE_URL/api/signals \
    -H "Content-Type: application/json" \
    -d "{
      \"component_id\": \"RDBMS_POSTGRES_01\",
      \"signal_type\": \"CONNECTION_REFUSED\",
      \"severity\": \"CRITICAL\",
      \"message\": \"Database connection refused - attempt $i\",
      \"metadata\": {\"host\": \"db-01\", \"port\": 5432, \"attempt\": $i}
    }" > /dev/null
  echo "  Sent RDBMS signal $i"
  sleep 0.5
done

echo ""
echo "Simulating MCP Host Failure..."
for i in {1..3}; do
  curl -s -X POST $BASE_URL/api/signals \
    -H "Content-Type: application/json" \
    -d "{
      \"component_id\": \"MCP_HOST_01\",
      \"signal_type\": \"TIMEOUT\",
      \"severity\": \"HIGH\",
      \"message\": \"MCP host not responding - attempt $i\",
      \"metadata\": {\"host\": \"mcp-01\", \"timeout_ms\": 5000}
    }" > /dev/null
  echo "  Sent MCP signal $i"
  sleep 0.5
done

echo ""
echo "Simulating Cache Latency Spike..."
for i in {1..3}; do
  curl -s -X POST $BASE_URL/api/signals \
    -H "Content-Type: application/json" \
    -d "{
      \"component_id\": \"CACHE_CLUSTER_01\",
      \"signal_type\": \"LATENCY_SPIKE\",
      \"severity\": \"WARNING\",
      \"message\": \"Cache response time exceeded threshold\",
      \"metadata\": {\"latency_ms\": $((500 + $i * 100)), \"threshold_ms\": 500}
    }" > /dev/null
  echo "  Sent Cache signal $i"
  sleep 0.5
done

echo ""
echo "Simulating Queue Backup..."
for i in {1..3}; do
  curl -s -X POST $BASE_URL/api/signals \
    -H "Content-Type: application/json" \
    -d "{
      \"component_id\": \"QUEUE_KAFKA_01\",
      \"signal_type\": \"QUEUE_DEPTH_EXCEEDED\",
      \"severity\": \"HIGH\",
      \"message\": \"Queue depth exceeded maximum threshold\",
      \"metadata\": {\"queue_depth\": $((10000 + $i * 1000)), \"max_depth\": 10000}
    }" > /dev/null
  echo "  Sent Queue signal $i"
  sleep 0.5
done

echo ""
echo "Simulation complete!"
echo "Check your dashboard at http://localhost:3000"
curl -s $BASE_URL/api/workitems | jq '[.[] | {component: .component_id, priority: .priority, status: .status, signals: .signal_count}]'
