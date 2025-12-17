/**
 * Global teardown for Jest tests
 * Stops in-memory MongoDB server
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...');
  
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
    console.log('✅ Test MongoDB stopped\n');
  }
};
