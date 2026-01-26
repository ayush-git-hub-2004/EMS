#!/bin/bash

echo "=================================================="
echo "  Employee Management System - Quick Start"
echo "  (Backend in Docker + Frontend Local)"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "⚠️  Docker is not installed!"
    echo "Backend will run locally instead."
    DOCKER_AVAILABLE=false
else
    echo "✅ Docker is available"
    DOCKER_AVAILABLE=true
fi
echo ""

echo "⚙️  Setting up the project..."
echo ""

# Setup Backend
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Starting backend server in Docker..."
    docker run --rm -v "$(pwd)":/app -w /app/backend -p 5000:5000 node:20-alpine sh -c "npm install && npm run dev" &
    BACKEND_PID=$!
    echo "Backend Docker container started (PID: $BACKEND_PID)"
else
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    echo ""
    echo "🌱 Seeding database with sample data..."
    npm run seed
    echo ""
    echo "🚀 Starting backend server locally..."
    npm run dev &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
fi

# Wait a bit for backend to start
sleep 3

# Setup Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo ""

echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "=================================================="
echo "  ✅ Application is running!"
echo "=================================================="
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:5000"
echo "📍 Health:   http://localhost:5000/api/health"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin:    admin@company.com / admin123"
echo "   Manager:  john.manager@company.com / manager123"
echo "   Employee: sarah.smith@company.com / employee123"
echo ""
echo "To stop the servers:"
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "  - Press Ctrl+C to stop frontend"
    echo "  - Run: docker stop <container-id> to stop backend"
else
    echo "  - Press Ctrl+C"
fi
echo "=================================================="

# Wait for user to press Ctrl+C
wait
