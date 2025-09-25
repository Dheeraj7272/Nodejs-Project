import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { User } from "./models/user.models.js";

dotenv.config();

(async () => {
  try {
    await connectDB();

    // Perform the update and wait for it to finish
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
