// lib/paymentQueries.js
import clientPromise from './mongodb';

export const paymentQueries = {
  async createPayment(paymentData) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    return db.collection('payments').insertOne({
      ...paymentData,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });
  },

  async getPaymentByReference(reference) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    return db.collection('payments').findOne({ reference });
  },

  async updatePaymentStatus(reference, status, paid_at = null) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const updateData = {
      status,
      updated_at: new Date()
    };
    
    if (paid_at) {
      updateData.paid_at = paid_at;
    }
    
    const result = await db.collection('payments').updateOne(
      { reference },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  },

  async getPaymentsByEmail(email) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    return db.collection('payments')
      .find({ customer_email: email })
      .sort({ created_at: -1 })
      .toArray();
  }
};