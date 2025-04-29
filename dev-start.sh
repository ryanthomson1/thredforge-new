#!/bin/bash

echo "🧼 Cleaning environment..."
rm -rf .next node_modules package-lock.json

echo "📦 Reinstalling dependencies..."
npm install

echo "🚀 Starting Next.js dev server on port 9004..."
npx next dev -p 9004
