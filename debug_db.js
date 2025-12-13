const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        // Fetch all users
        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log("------------------------------------------------");
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`CreatedAt: ${u.createdAt}`);
            console.log(`Full Object:`, JSON.stringify(u, null, 2));
        });

        process.exit();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
