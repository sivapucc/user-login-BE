import mongoose from "mongoose";

export async function createDbConnection() {
  try {
    await mongoose.connect(
      "mongodb+srv://sivapucc:siva95@cluster0.zdqwd.mongodb.net/?"
    );
    return console.log("DB Connected successfully.....");
  } catch (error) {
    console.log(error);
  }
}