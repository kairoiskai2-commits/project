// Test file for new free APIs
// Run this to verify the new features work

import { integrations } from './base44Client.js';

console.log('🧪 Testing New Free APIs...\n');

// Test 1: Maps Search API
console.log('1️⃣ Testing Maps Search API...');
try {
  const mapsResult = await integrations.External.maps('search', { query: 'Pyramids of Giza' });
  console.log('✅ Maps Search:', mapsResult.success ? 'WORKING' : 'FAILED');
  if (mapsResult.places?.length > 0) {
    console.log(`   Found ${mapsResult.places.length} places`);
  }
} catch (error) {
  console.log('❌ Maps Search Error:', error.message);
}

// Test 2: Wikipedia Auto-Place Creator
console.log('\n2️⃣ Testing Wikipedia Auto-Place Creator...');
try {
  const wikiResult = await integrations.External.wikipediaPlaces('create', {
    placeName: 'Luxor Temple',
    autoCreate: false // Don't actually create in DB for test
  });
  console.log('✅ Wikipedia Places:', wikiResult.success ? 'WORKING' : 'FAILED');
  if (wikiResult.place) {
    console.log(`   Created place: ${wikiResult.place.name}`);
  }
} catch (error) {
  console.log('❌ Wikipedia Places Error:', error.message);
}

// Test 3: AI Trip Planner
console.log('\n3️⃣ Testing AI Trip Planner...');
try {
  const tripResult = await integrations.External.aiTripPlanner('plan', {
    destination: 'Egypt',
    duration: 3,
    budget: 'medium',
    interests: ['historical', 'cultural']
  });
  console.log('✅ AI Trip Planner:', tripResult.success ? 'WORKING' : 'FAILED');
  if (tripResult.trip_plan) {
    console.log(`   Generated ${tripResult.trip_plan.days?.length || 0} day itinerary`);
  }
} catch (error) {
  console.log('❌ AI Trip Planner Error:', error.message);
}

// Test 4: AI LLM (for AskAI bots)
console.log('\n4️⃣ Testing AI LLM (AskAI)...');
try {
  const llmResult = await integrations.Core.InvokeLLM({
    prompt: 'Hello, can you tell me about the Pyramids of Giza?',
    max_tokens: 200
  });
  console.log('✅ AI LLM:', llmResult && llmResult.length > 10 ? 'WORKING' : 'FAILED');
  if (llmResult) {
    console.log(`   Response length: ${llmResult.length} characters`);
    console.log(`   Preview: ${llmResult.substring(0, 100)}...`);
  }
} catch (error) {
  console.log('❌ AI LLM Error:', error.message);
}

console.log('\n🎉 All tests completed! Check results above.');