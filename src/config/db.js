const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://Sportsconnect:Sportsconnect%40123@cluster0.46abq.mongodb.net/sportsconnect?retryWrites=true&w=majority&appName=Cluster0,Sportsconnect%40123", {

    //   useNewUrlParser: true, // Ensures compatibility with the MongoDB connection string
    //   useUnifiedTopology: true, // Enables the new connection management engine
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;