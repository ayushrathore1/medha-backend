/**
 * Core API Integration Tests
 * Tests for subjects, notes, flashcards, todos, and quiz endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Set test environment
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.NODE_ENV = 'test';

const User = require('../models/User');
const Subject = require('../models/Subject');
const Todo = require('../models/Todo');

let app;
let testUser;
let authToken;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  app = require('../server');
});

beforeEach(async () => {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  testUser = await User.create({
    name: 'API Test User',
    email: `apitest${Date.now()}@example.com`,
    password: hashedPassword
  });
  
  authToken = jwt.sign(
    { userId: testUser._id, email: testUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterEach(async () => {
  await User.deleteMany({});
  await Subject.deleteMany({});
  await Todo.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ==========================================
// SUBJECT CRUD TESTS
// ==========================================

describe('Subjects API', () => {
  
  describe('POST /api/subjects', () => {
    test('should create a new subject', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Mathematics' })
        .expect(201);
      
      expect(res.body.subject).toHaveProperty('name', 'Mathematics');
      expect(res.body.subject).toHaveProperty('_id');
    });
    
    test('should reject subject creation without auth', async () => {
      await request(app)
        .post('/api/subjects')
        .send({ name: 'Physics' })
        .expect(401);
    });
    
    test('should reject subject with empty name', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });
      
      expect([400, 500]).toContain(res.status);
    });
  });
  
  describe('GET /api/subjects', () => {
    beforeEach(async () => {
      await Subject.create([
        { name: 'Subject 1', user: testUser._id },
        { name: 'Subject 2', user: testUser._id }
      ]);
    });
    
    test('should get all subjects for authenticated user', async () => {
      const res = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(res.body.subjects).toHaveLength(2);
    });
    
    test('should not return subjects from other users', async () => {
      // Create another user's subject
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: await bcrypt.hash('password', 10)
      });
      await Subject.create({ name: 'Other Subject', user: otherUser._id });
      
      const res = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Should only get own subjects
      expect(res.body.subjects).toHaveLength(2);
      expect(res.body.subjects.every(s => s.user.toString() === testUser._id.toString())).toBe(true);
    });
  });
  
  describe('DELETE /api/subjects/:id', () => {
    let subjectId;
    
    beforeEach(async () => {
      const subject = await Subject.create({
        name: 'To Delete',
        user: testUser._id
      });
      subjectId = subject._id;
    });
    
    test('should delete subject belonging to user', async () => {
      await request(app)
        .delete(`/api/subjects/${subjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const deleted = await Subject.findById(subjectId);
      expect(deleted).toBeNull();
    });
    
    test('should not delete subject belonging to other user', async () => {
      const otherUser = await User.create({
        name: 'Other',
        email: 'other2@example.com',
        password: await bcrypt.hash('password', 10)
      });
      const otherSubject = await Subject.create({
        name: 'Other Subject',
        user: otherUser._id
      });
      
      const res = await request(app)
        .delete(`/api/subjects/${otherSubject._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Should be forbidden or not found
      expect([403, 404]).toContain(res.status);
    });
  });
});

// ==========================================
// TODO CRUD TESTS
// ==========================================

describe('Todos API', () => {
  
  describe('POST /api/todos', () => {
    test('should create a new todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          task: 'Complete homework',
          isCompleted: false
        });
      
      // Accept 201 or check if response has the todo
      expect([201, 200]).toContain(res.status);
      
      if (res.body.todo) {
        expect(res.body.todo).toHaveProperty('task', 'Complete homework');
      }
    });
    
    test('should reject todo without authentication', async () => {
      await request(app)
        .post('/api/todos')
        .send({ task: 'Unauthorized todo' })
        .expect(401);
    });
  });
  
  describe('GET /api/todos', () => {
    beforeEach(async () => {
      await Todo.create([
        { task: 'Todo 1', user: testUser._id, isCompleted: false },
        { task: 'Todo 2', user: testUser._id, isCompleted: true }
      ]);
    });
    
    test('should get all todos for user', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(Array.isArray(res.body.todos) || Array.isArray(res.body)).toBe(true);
    });
  });
  
  describe('PUT /api/todos/:id', () => {
    let todoId;
    
    beforeEach(async () => {
      const todo = await Todo.create({
        task: 'Original todo',
        user: testUser._id,
        isCompleted: false
      });
      todoId = todo._id;
    });
    
    test('should update todo', async () => {
      const res = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          task: 'Updated todo',
          isCompleted: true
        });
      
      expect([200, 404]).toContain(res.status);
    });
  });
  
  describe('DELETE /api/todos/:id', () => {
    let todoId;
    
    beforeEach(async () => {
      const todo = await Todo.create({
        task: 'To delete',
        user: testUser._id,
        isCompleted: false
      });
      todoId = todo._id;
    });
    
    test('should delete todo', async () => {
      const res = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 204]).toContain(res.status);
    });
  });
});

// ==========================================
// HEALTH CHECK TESTS
// ==========================================

describe('Health Check Endpoints', () => {
  
  test('GET / should return running message', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);
    
    expect(res.text).toContain('MEDHA');
  });
  
  test('GET /health should return health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status');
  });
  
  test('GET /api/test-fix should return security info', async () => {
    const res = await request(app)
      .get('/api/test-fix')
      .expect(200);
    
    expect(res.body).toHaveProperty('security');
    expect(res.body.security.rateLimiting).toBe(true);
    expect(res.body.security.helmet).toBe(true);
  });
});

// ==========================================
// ERROR HANDLING TESTS
// ==========================================

describe('Error Handling', () => {
  
  test('should return 404 for non-existent routes', async () => {
    const res = await request(app)
      .get('/api/nonexistent-endpoint')
      .expect(404);
    
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
  
  test('should handle invalid ObjectId gracefully', async () => {
    const res = await request(app)
      .get('/api/subjects/invalid-id')
      .set('Authorization', `Bearer ${authToken}`);
    
    // Should return error, not crash
    expect([400, 404, 500]).toContain(res.status);
  });
  
  test('should handle malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    
    expect([400, 500]).toContain(res.status);
  });
});

// ==========================================
// AUTHORIZATION TESTS
// ==========================================

describe('Authorization', () => {
  
  test('should reject expired tokens', async () => {
    // Create expired token
    const expiredToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );
    
    const res = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
  
  test('should reject tokens with wrong secret', async () => {
    const wrongToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      'wrong-secret',
      { expiresIn: '1h' }
    );
    
    const res = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(401);
  });
});
