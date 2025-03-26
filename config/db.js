import mongoose from "mongoose";

export const connectDB = () => {
  const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
  } = process.env;

  if (
    !MONGO_USERNAME ||
    !MONGO_PASSWORD ||
    !MONGO_HOSTNAME ||
    !MONGO_PORT ||
    !MONGO_DB
  ) {
    console.error(
      "❌ Missing database configuration (MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOSTNAME, MONGO_PORT, MONGO_DB) in .env file"
    );
    process.exit(1);
  }

  const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
  };

  mongoose
    .connect(url, options)
    .then(() => {
      console.log(`✅ Successfully connected to database: ${MONGO_DB}`);
    })
    .catch((error) => {
      console.error("❌ Failed to connect:", error);
      process.exit(1);
    });

  const dbConnection = mongoose.connection;
  dbConnection.on("error", (err) =>
    console.error(`❌ Connection error: ${err}`)
  );
  dbConnection.once("open", () =>
    console.log(`📂 Database ${MONGO_DB} is ready!`)
  );
};
