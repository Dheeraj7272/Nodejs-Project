import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

const app = express();
dotenv.config();

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server started on port ${process.env.PORT || 8000}`);
    });

}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit the process with failure
});





















/*
const app = express();
(async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL+"/"+DB_NAME);
        console.log("Database connected successfully");
        const db = mongoose.connection;

        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

*/
