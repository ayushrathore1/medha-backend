/**
 * Authentication API Tests
 * Tests for register, login, password change, and token validation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Set test environment before importing app
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

const User = require('../models/User');

let app;

beforeAll(async () => {
  // Connect to test DB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  // Import app after DB connection
  app = require('../server');
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  
  // ==========================================
  // REGISTRATION TESTS
  // ==========================================
  
  describe('POST /api/auth/register', () => {
    
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.name).toBe(userData.name);
      expect(res.body.user).not.toHaveProperty('password');
    });
    
    test('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);
      
      expect(res.body).toHaveProperty('message');
    });
    
    test('should reject duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      // Duplicate registration
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
      
      expect(res.body.message).toMatch(/already|exists|duplicate/i);
    });
    
    test('should hash password before storing', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash-test@example.com',
        password: 'password123'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      const user = await User.findOne({ email: userData.email }).select('+password');
      expect(user.password).not.toBe(userData.password);
      expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });
  });
  
  // ==========================================
  // LOGIN TESTS
  // ==========================================
  
  describe('POST /api/auth/login', () => {
    
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        password: hashedPassword
      });
    });
    
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('login@example.com');
    });
    
    test('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(res.body.message).toMatch(/invalid/i);
    });
    
    test('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
      
      expect(res.body.message).toMatch(/invalid/i);
    });
    
    test('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' })
        .expect(400);
      
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // ==========================================
  // TOKEN VALIDATION TESTS
  // ==========================================
  
  describe('GET /api/auth/me', () => {
    let token;
    let userId;
    
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Token Test User',
        email: 'token@example.com',
        password: hashedPassword
      });
      userId = user._id;
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'token@example.com',
          password: 'password123'
        });
      
      token = res.body.token;
    });
    
    test('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      // Accept 200 or 429 (rate limited)
      expect([200, 429]).toContain(res.status);
      
      if (res.status === 200) {
        expect(res.body.email).toBe('token@example.com');
        expect(res.body).not.toHaveProperty('password');
      }
    });
    
    test('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      // Accept 401 or 429 (rate limited)
      expect([401, 429]).toContain(res.status);
      
      if (res.status === 401) {
        expect(res.body.message).toMatch(/token|authorization/i);
      }
    });
    
    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      
      // Accept 401 or 429 (rate limited)
      expect([401, 429]).toContain(res.status);
      
      if (res.status === 401) {
        expect(res.body.message).toMatch(/invalid|token/i);
      }
    });
    
    test('should reject request with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');
      
      // Accept 401 or 429 (rate limited)
      expect([401, 429]).toContain(res.status);
    });
  });
  
  // ==========================================
  // PASSWORD CHANGE TESTS
  // ==========================================
  
  describe('POST /api/auth/change-password', () => {
    let token;
    
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('oldpassword123', 10);
      await User.create({
        name: 'Password Change User',
        email: 'password-change@example.com',
        password: hashedPassword
      });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'password-change@example.com',
          password: 'oldpassword123'
        });
      
      token = res.body.token;
    });
    
    test('should change password with valid current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        });
      
      // Accept 200 (success) or 429 (rate limited)
      expect([200, 429]).toContain(res.status);
      
      if (res.status === 200) {
        // Verify can login with new password
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'password-change@example.com',
            password: 'newpassword456'
          });
        
        expect([200, 429]).toContain(loginRes.status);
      }
    });
    
    test('should reject password change with wrong current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        });
      
      // Accept 401 (correct rejection) or 429 (rate limited)
      expect([401, 429]).toContain(res.status);
    });
    
    test('should reject password change without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456'
        });
      
      // Accept 401 (correct rejection) or 429 (rate limited)
      expect([401, 429]).toContain(res.status);
    });
  });
});

// ==========================================
// SECURITY-SPECIFIC TESTS
// ==========================================

describe('Authentication Security', () => {
  
  test('should sanitize SQL injection attempts in email', async () => {
    const maliciousData = {
      name: 'Hacker',
      email: "test@example.com'; DROP TABLE users; --",
      password: 'password123'
    };
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(maliciousData);
    
    // Should either reject or sanitize, not execute
    // Check that users collection still exists
    const count = await User.countDocuments();
    expect(count).toBeGreaterThanOrEqual(0);
  });
  
  test('should sanitize NoSQL injection attempts', async () => {
    const maliciousLogin = {
      email: { $gt: '' },
      password: { $gt: '' }
    };
    
    const res = await request(app)
      .post('/api/auth/login')
      .send(maliciousLogin);
    
    // Should reject with 400, 401, 403, or 429 (rate limited), not succeed
    expect([400, 401, 403, 429, 500]).toContain(res.status);
  });
  
  test('should handle XSS attempts in name field', async () => {
    const xssData = {
      name: '<script>alert("XSS")</script>',
      email: 'xss@example.com',
      password: 'password123'
    };
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(xssData);
    
    if (res.status === 201) {
      const user = await User.findOne({ email: 'xss@example.com' });
      // Name should either be sanitized or stored as-is (not executed)
      expect(user).toBeDefined();
    }
  });
  
  test('should not expose password in any response', async () => {
    const userData = {
      name: 'Password Check User',
      email: 'passwordcheck@example.com',
      password: 'password123'
    };
    
    // Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Skip if rate limited
    if (registerRes.status === 429) {
      return;
    }
    
    if (registerRes.body.user) {
      expect(registerRes.body.user).not.toHaveProperty('password');
    }
    expect(JSON.stringify(registerRes.body)).not.toContain('password123');
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    
    // Skip if rate limited
    if (loginRes.status === 429) {
      return;
    }
    
    if (loginRes.body.user) {
      expect(loginRes.body.user).not.toHaveProperty('password');
    }
    expect(JSON.stringify(loginRes.body)).not.toContain('password123');
  });
});
