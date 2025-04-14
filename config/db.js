import mongoose from "mongoose";

export const connectDB = () => {
  const { MONGO_DB_NAME, MONGO_CONNECT_URI } = process.env;

  if (!MONGO_CONNECT_URI || !MONGO_DB_NAME) {
    console.error("❌ Missing MongoDB Atlas configuration in .env");
    process.exit(1);
  }

  const url = `${MONGO_CONNECT_URI}`;

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  mongoose
    .connect(url, options)
    .then(() => {
      console.log(`✅ Connected to MongoDB Atlas: ${MONGO_DB_NAME}`);
    })
    .catch((error) => {
      console.error("❌ Connection failed:", error);
      process.exit(1);
    });

  const dbConnection = mongoose.connection;
  dbConnection.on("error", (err) => console.error(`❌ MongoDB error: ${err}`));
  dbConnection.once("open", () =>
    console.log(`📂 MongoDB Atlas ${MONGO_DB_NAME} is ready!`)
  );
};
