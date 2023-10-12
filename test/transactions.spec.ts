import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app'
import { execSync } from 'node:child_process';

describe('transactions routes', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
    })

    it('should be able to list all transaction', async () => {
        const createTransactionRespose = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionRespose.get('Set-Cookie')

        const listTransactionRespose = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionRespose.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000
            })
        ])
    })


    it('should be able to get a specific transaction', async () => {
        const createTransactionRespose = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionRespose.get('Set-Cookie')

        const listTransactionRespose = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

        const transactionId = listTransactionRespose.body.transactions[0].id

        const getTransactionRespose = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(listTransactionRespose.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000
            })
        ])
    })

    it('should be able to get the summer', async () => {
        const createTransactionRespose = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionRespose.get('Set-Cookie')

        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit Transaction',
                amount: 2000,
                type: 'debit'
            })

        const summaryRespose = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

        expect(summaryRespose.body.summary).toEqual({
            amount: 3000,
        })
    })
})

