/**
 * Global setup for Jest tests
 * Starts in-memory MongoDB server
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  console.log('\n🔧 Starting in-memory MongoDB for tests...');
  
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'medha-test'
    }
  });
  
  const uri = mongod.getUri();
  
  // Store for use in tests and teardown
  global.__MONGOD__ = mongod;
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.NODE_ENV = 'test';
  
  console.log(`✅ Test MongoDB running at: ${uri}\n`);
};
