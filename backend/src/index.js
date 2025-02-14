import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Application runnning on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect", err);
  });
