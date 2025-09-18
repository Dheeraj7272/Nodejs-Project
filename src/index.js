import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

connectDB().then(() => {
    app.listen(process.env.PORT , () => {
        console.log(`Server started on port ${process.env.PORT}`);
    });

}).catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit the process with failure
});

