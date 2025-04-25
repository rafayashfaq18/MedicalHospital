const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

const API_URL = 'http://localhost:5000/api';

describe('Authentication System Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/hospital-auth-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear test data
    await User.deleteMany({});
    await LoginLog.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Registration Flow', () => {
    test('should register a new admin user', async () => {
      const response = await axios.post(`${API_URL}/users/register`, {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Test@123',
        role: 'admin'
      });

      expect(response.status).toBe(201);
      expect(response.data.user.role).toBe('admin');
      expect(response.data.token).toBeDefined();
    });

    test('should register a new doctor user', async () => {
      const response = await axios.post(`${API_URL}/users/register`, {
        name: 'Doctor User',
        email: 'doctor@test.com',
        password: 'Test@123',
        role: 'doctor'
      });

      expect(response.status).toBe(201);
      expect(response.data.user.role).toBe('doctor');
    });

    test('should register a new patient user', async () => {
      const response = await axios.post(`${API_URL}/users/register`, {
        name: 'Patient User',
        email: 'patient@test.com',
        password: 'Test@123',
        role: 'patient'
      });

      expect(response.status).toBe(201);
      expect(response.data.user.role).toBe('patient');
    });

    test('should not register with existing email', async () => {
      try {
        await axios.post(`${API_URL}/users/register`, {
          name: 'Duplicate User',
          email: 'admin@test.com',
          password: 'Test@123',
          role: 'admin'
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('User already exists');
      }
    });
  });

  describe('Login Flow', () => {
    test('should login with valid credentials', async () => {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'admin@test.com',
        password: 'Test@123'
      });

      expect(response.status).toBe(200);
      expect(response.data.token).toBeDefined();
      expect(response.data.user.role).toBe('admin');
    });

    test('should not login with invalid credentials', async () => {
      try {
        await axios.post(`${API_URL}/users/login`, {
          email: 'admin@test.com',
          password: 'WrongPassword'
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid credentials');
      }
    });

    test('should log login attempts', async () => {
      const logs = await LoginLog.find({});
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Protected Routes', () => {
    let adminToken;

    beforeAll(async () => {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'admin@test.com',
        password: 'Test@123'
      });
      adminToken = response.data.token;
    });

    test('should access protected route with valid token', async () => {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.role).toBe('admin');
    });

    test('should not access protected route without token', async () => {
      try {
        await axios.get(`${API_URL}/users/me`);
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should not access admin route with patient role', async () => {
      const patientResponse = await axios.post(`${API_URL}/users/login`, {
        email: 'patient@test.com',
        password: 'Test@123'
      });

      try {
        await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${patientResponse.data.token}` }
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });

  describe('Logout Flow', () => {
    test('should logout successfully', async () => {
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        email: 'admin@test.com',
        password: 'Test@123'
      });

      const response = await axios.post(`${API_URL}/users/logout`, {}, {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Logged out successfully');
    });
  });
}); 