const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Sneaker API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let token;
    let sneakerId;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        token = loginResponse.body.token;
    });

    it('should create a new sneaker', async () => {
        const response = await request(app)
            .post('/api/sneakers/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Air Jordan 1',
                description: 'Classic sneakers',
                price: 200,
                brand: 'Nike',
                image: 'image_url',
                usdzFile: 'usdz_file_url',
                size: '10',
                condition: 'good'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('sneaker');
        sneakerId = response.body.sneaker._id;
    });

    it('should update a sneaker', async () => {
        const response = await request(app)
            .put(`/api/sneakers/update/${sneakerId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Air Jordan 1 - Updated',
                price: 220
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.sneaker).toHaveProperty('title', 'Air Jordan 1 - Updated');
    });

    it('should delete a sneaker', async () => {
        const response = await request(app)
            .delete(`/api/sneakers/delete/${sneakerId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Sneaker deleted successfully');
    });

    it('should get all sneakers', async () => {
        const response = await request(app).get('/api/sneakers/all');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('sneakers');
    });

    it('should get a sneaker by ID', async () => {
        const response = await request(app).get(`/api/sneakers/${sneakerId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.sneaker).toHaveProperty('_id', sneakerId);
    });
});
