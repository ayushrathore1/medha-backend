/**
 * Test setup - runs before each test file
 */

const mongoose = require('mongoose');

// Extend Jest matchers
expect.extend({
  toBeValidMongoId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid MongoDB ObjectId`,
      pass
    };
  }
});

// Connect to test database before tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

// Clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests in this file
afterAll(async () => {
  await mongoose.connection.close();
});

// Test utilities
global.testUtils = {
  /**
   * Create a test user and return token
   */
  async createTestUser(overrides = {}) {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const defaultUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: await bcrypt.hash('password123', 10),
      ...overrides
    };
    
    const user = await User.create(defaultUser);
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return { user, token };
  },
  
  /**
   * Create test subject
   */
  async createTestSubject(userId, overrides = {}) {
    const Subject = require('../models/Subject');
    
    const defaultSubject = {
      name: 'Test Subject',
      user: userId,
      ...overrides
    };
    
    return await Subject.create(defaultSubject);
  },
  
  /**
   * Generate random string
   */
  randomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
  }
};
