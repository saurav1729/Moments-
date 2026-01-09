import { connectToDatabase } from "@/lib/mongodb"

async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase()

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("events")) {
      await db.createCollection("events")
      await db.collection("events").createIndex({ userId: 1, date: 1 })
      console.log("Created events collection")
    }

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("Created users collection")
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  }
}

initializeDatabase()
