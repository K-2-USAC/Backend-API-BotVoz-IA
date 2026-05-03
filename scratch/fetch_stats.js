import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CallLog from '../src/callLog/callLog.model.js';

dotenv.config();

const getStats = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        const totalCalls = await CallLog.countDocuments();
        
        const stats = await CallLog.aggregate([
            { $unwind: "$messages" },
            { $match: { "messages.role": "assistant" } },
            { $count: "assistantMessages" }
        ]);

        const linesGenerated = stats.length > 0 ? stats[0].assistantMessages : 0;

        console.log('--- STATS ---');
        console.log(`API Calls: ${totalCalls}`);
        console.log(`Lines Generated: ${linesGenerated}`);
        console.log('--------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error fetching stats:', error);
        process.exit(1);
    }
};

getStats();
