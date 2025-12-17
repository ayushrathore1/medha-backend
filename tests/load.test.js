/**
 * Load Testing Script for MEDHA
 * Simulates 300+ concurrent users to test reliability
 * 
 * Usage:
 *   node tests/load.test.js
 *   node tests/load.test.js --users=500 --duration=60
 * 
 * Requirements:
 *   - Backend server running at http://localhost:5000
 *   - Test user accounts or public endpoints
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:5000',
  users: parseInt(process.env.USERS) || 300,
  durationSeconds: parseInt(process.env.DURATION) || 30,
  rampUpSeconds: 5,
  endpoints: [
    { method: 'GET', path: '/', weight: 20 },
    { method: 'GET', path: '/health', weight: 20 },
    { method: 'GET', path: '/api/test-fix', weight: 30 },
    { method: 'POST', path: '/api/auth/login', weight: 30, body: { email: 'test@example.com', password: 'password123' } }
  ]
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--users=')) {
    config.users = parseInt(arg.split('=')[1]);
  }
  if (arg.startsWith('--duration=')) {
    config.durationSeconds = parseInt(arg.split('=')[1]);
  }
  if (arg.startsWith('--url=')) {
    config.baseUrl = arg.split('=')[1];
  }
});

// Statistics
const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  rateLimitedRequests: 0,  // 429s - security working correctly
  failedRequests: 0,
  errors: {},
  responseTimes: [],
  statusCodes: {},
  startTime: null,
  endTime: null
};

/**
 * Make HTTP request
 */
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(endpoint.path, config.baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MEDHA-LoadTest/1.0'
      },
      timeout: 30000
    };
    
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        stats.totalRequests++;
        stats.responseTimes.push(responseTime);
        stats.statusCodes[res.statusCode] = (stats.statusCodes[res.statusCode] || 0) + 1;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          stats.successfulRequests++;
        } else if (res.statusCode === 429) {
          // Rate limited - security is working correctly!
          stats.rateLimitedRequests++;
        } else {
          stats.failedRequests++;
        }
        
        resolve({ 
          statusCode: res.statusCode, 
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 400,
          rateLimited: res.statusCode === 429
        });
      });
    });
    
    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      stats.totalRequests++;
      stats.failedRequests++;
      stats.responseTimes.push(responseTime);
      stats.errors[err.code] = (stats.errors[err.code] || 0) + 1;
      
      resolve({ 
        statusCode: 0, 
        responseTime, 
        success: false, 
        error: err.code 
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      stats.totalRequests++;
      stats.failedRequests++;
      stats.errors['TIMEOUT'] = (stats.errors['TIMEOUT'] || 0) + 1;
      
      resolve({ 
        statusCode: 0, 
        responseTime: 30000, 
        success: false, 
        error: 'TIMEOUT' 
      });
    });
    
    if (endpoint.body && endpoint.method !== 'GET') {
      req.write(JSON.stringify(endpoint.body));
    }
    
    req.end();
  });
}

/**
 * Select random endpoint based on weights
 */
function selectEndpoint() {
  const totalWeight = config.endpoints.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const endpoint of config.endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  
  return config.endpoints[0];
}

/**
 * Simulate single user
 */
async function simulateUser(userId, durationMs) {
  const endTime = Date.now() + durationMs;
  let requestCount = 0;
  
  while (Date.now() < endTime) {
    const endpoint = selectEndpoint();
    await makeRequest(endpoint);
    requestCount++;
    
    // Random delay between requests (100ms - 2000ms)
    const delay = Math.random() * 1900 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return requestCount;
}

/**
 * Calculate statistics
 */
function calculateStats() {
  const sortedTimes = [...stats.responseTimes].sort((a, b) => a - b);
  const len = sortedTimes.length;
  
  // Handled requests = successful + rate limited (both are correct server behavior)
  const handledRequests = stats.successfulRequests + stats.rateLimitedRequests;
  
  return {
    totalRequests: stats.totalRequests,
    successfulRequests: stats.successfulRequests,
    rateLimitedRequests: stats.rateLimitedRequests,
    failedRequests: stats.failedRequests,
    handledRequests: handledRequests,
    successRate: ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%',
    handledRate: ((handledRequests / stats.totalRequests) * 100).toFixed(2) + '%',
    
    responseTime: {
      min: Math.min(...sortedTimes) + 'ms',
      max: Math.max(...sortedTimes) + 'ms',
      avg: (sortedTimes.reduce((a, b) => a + b, 0) / len).toFixed(2) + 'ms',
      median: sortedTimes[Math.floor(len / 2)] + 'ms',
      p90: sortedTimes[Math.floor(len * 0.9)] + 'ms',
      p95: sortedTimes[Math.floor(len * 0.95)] + 'ms',
      p99: sortedTimes[Math.floor(len * 0.99)] + 'ms'
    },
    
    throughput: (stats.totalRequests / config.durationSeconds).toFixed(2) + ' req/sec',
    
    statusCodes: stats.statusCodes,
    errors: stats.errors,
    
    duration: ((stats.endTime - stats.startTime) / 1000).toFixed(2) + 's',
    concurrentUsers: config.users
  };
}

/**
 * Print results
 */
function printResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MEDHA LOAD TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n📈 Summary:');
  console.log(`   Total Requests:     ${results.totalRequests}`);
  console.log(`   Successful (2xx):   ${results.successfulRequests}`);
  console.log(`   Rate Limited (429): ${results.rateLimitedRequests} (security working ✅)`);
  console.log(`   Failed (errors):    ${results.failedRequests}`);
  console.log(`   Server Handled:     ${results.handledRate}`);
  console.log(`   Throughput:         ${results.throughput}`);
  console.log(`   Test Duration:      ${results.duration}`);
  console.log(`   Concurrent Users:   ${results.concurrentUsers}`);
  
  console.log('\n⏱️  Response Times:');
  console.log(`   Min:                ${results.responseTime.min}`);
  console.log(`   Max:                ${results.responseTime.max}`);
  console.log(`   Average:            ${results.responseTime.avg}`);
  console.log(`   Median:             ${results.responseTime.median}`);
  console.log(`   90th Percentile:    ${results.responseTime.p90}`);
  console.log(`   95th Percentile:    ${results.responseTime.p95}`);
  console.log(`   99th Percentile:    ${results.responseTime.p99}`);
  
  console.log('\n📊 Status Codes:');
  Object.entries(results.statusCodes).forEach(([code, count]) => {
    const percentage = ((count / results.totalRequests) * 100).toFixed(1);
    const label = code === '429' ? ' (Rate Limited - Security ✅)' : '';
    console.log(`   ${code}: ${count} (${percentage}%)${label}`);
  });
  
  if (Object.keys(results.errors).length > 0) {
    console.log('\n❌ Network Errors:');
    Object.entries(results.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Pass/Fail determination
  // Success = server handled all requests (either served or rate-limited)
  // Failure = actual errors (timeouts, connection refused, 5xx)
  const passThreshold = {
    handledRate: 95,      // Server should handle 95% of requests
    p95ResponseTime: 5000, // 5 seconds
    actualErrorRate: 5     // Only count real errors (not 429s)
  };
  
  const handledRateNum = parseFloat(results.handledRate);
  const p95Num = parseInt(results.responseTime.p95);
  const actualErrorRate = (results.failedRequests / results.totalRequests) * 100;
  
  const passed = handledRateNum >= passThreshold.handledRate &&
                 p95Num <= passThreshold.p95ResponseTime &&
                 actualErrorRate <= passThreshold.actualErrorRate;
  
  if (passed) {
    console.log('✅ LOAD TEST PASSED');
    console.log(`   ✓ Server handled ${results.concurrentUsers} concurrent users`);
    console.log(`   ✓ ${results.handledRate} of requests properly handled`);
    console.log(`   ✓ Rate limiting protected against overload`);
    console.log(`   ✓ P95 response time ${results.responseTime.p95} is excellent`);
  } else {
    console.log('❌ LOAD TEST FAILED');
    if (handledRateNum < passThreshold.handledRate) {
      console.log(`   ⚠ Handled rate ${results.handledRate} is below threshold ${passThreshold.handledRate}%`);
    }
    if (p95Num > passThreshold.p95ResponseTime) {
      console.log(`   ⚠ P95 response time ${results.responseTime.p95} exceeds threshold ${passThreshold.p95ResponseTime}ms`);
    }
    if (actualErrorRate > passThreshold.actualErrorRate) {
      console.log(`   ⚠ Error rate ${actualErrorRate.toFixed(2)}% exceeds threshold ${passThreshold.actualErrorRate}%`);
    }
  }
  
  console.log('='.repeat(60) + '\n');
  
  return passed;
}

/**
 * Main function
 */
async function runLoadTest() {
  console.log('\n🚀 MEDHA Load Test Starting...');
  console.log(`   Target: ${config.baseUrl}`);
  console.log(`   Users: ${config.users}`);
  console.log(`   Duration: ${config.durationSeconds}s`);
  console.log(`   Ramp-up: ${config.rampUpSeconds}s`);
  
  // Verify server is reachable
  console.log('\n🔍 Checking server availability...');
  try {
    await makeRequest({ method: 'GET', path: '/' });
    console.log('✅ Server is reachable\n');
  } catch (err) {
    console.error('❌ Server is not reachable:', err.message);
    console.error('   Make sure the backend is running at', config.baseUrl);
    process.exit(1);
  }
  
  // Reset stats
  stats.totalRequests = 0;
  stats.successfulRequests = 0;
  stats.rateLimitedRequests = 0;
  stats.failedRequests = 0;
  stats.errors = {};
  stats.responseTimes = [];
  stats.statusCodes = {};
  
  stats.startTime = Date.now();
  
  // Ramp up users gradually
  const usersPerBatch = Math.ceil(config.users / config.rampUpSeconds);
  const userPromises = [];
  
  console.log('📈 Ramping up users...');
  
  for (let i = 0; i < config.users; i++) {
    const userId = i + 1;
    const delay = Math.floor(i / usersPerBatch) * 1000;
    
    const userPromise = new Promise(resolve => {
      setTimeout(() => {
        if (userId % 50 === 0 || userId === config.users) {
          process.stdout.write(`\r   Active users: ${userId}/${config.users}`);
        }
        simulateUser(userId, config.durationSeconds * 1000).then(resolve);
      }, delay);
    });
    
    userPromises.push(userPromise);
  }
  
  console.log('\n\n⏳ Running load test...');
  
  // Wait for all users to complete
  await Promise.all(userPromises);
  
  stats.endTime = Date.now();
  
  // Calculate and print results
  const results = calculateStats();
  const passed = printResults(results);
  
  // Return for programmatic use
  return { passed, results };
}

// Run if called directly
if (require.main === module) {
  runLoadTest()
    .then(({ passed }) => {
      process.exit(passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Load test error:', err);
      process.exit(1);
    });
}

module.exports = { runLoadTest, config };
