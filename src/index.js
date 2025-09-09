import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config();

connectDB();





















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
