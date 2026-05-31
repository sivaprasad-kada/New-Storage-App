import { connectDB, client } from "./db.js";
try {
  const db = await connectDB()
  await db.command({
    collMod: "users",
    validationLevel: "off"
  })
  await db.command({
    collMod: "directories",
    validationLevel: "off"
  })
   await db.command({
    collMod: "files",
    validationLevel: "off"
  })
  /*  const db = await connectDB();
 
   const command = "collMod";
 
   await db.command({
     [command]: "users",
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: ["_id", "name", "email", "rootDirId"],
         properties: {
           _id: {
             bsonType: "objectId",
           },
           name: {
             bsonType: "string",
             minLength: 1,
             description:
               "name field should a string with at least one character",
           },
           email: {
             bsonType: "string",
             description: "please enter a valid email",
           },
           password: {
             bsonType: "string",
             minLength: 4,
           },
           rootDirId: {
             bsonType: "objectId",
           },
           picture: {
             bsonType: "string",
           },
           role: {
             enum: ["Admin", "Manager", "User"],
           },
           maxStorageInBytes: {
             bsonType: "number",
           },
           usedStorageInBytes: {
             bsonType: "number",
           },
           // __v: {
           //   bsonType: "int",
           // },
         },
         additionalProperties: false,
       },
     },
     validationAction: "error",
     validationLevel: "strict",
   });
 
   await db.command({
     [command]: "directories",
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: ["_id", "name", "userId", "parentDirId"],
         properties: {
           _id: {
             bsonType: "objectId",
           },
           name: {
             bsonType: "string",
           },
           size: {
             bsonType: "number"
           },
           userId: {
             bsonType: "objectId",
           },
           parentDirId: {
             bsonType: ["objectId", "null"],
           },
           createdAt: {
             bsonType: "date",
           },
           updatedAt: {
             bsonType: "date",
           },
         },
         additionalProperties: false,
       },
     },
     validationAction: "error",
     validationLevel: "strict",
   });
 
   await db.command({
     [command]: "files",
     validator: {
       $jsonSchema: {
         bsonType: "object",
         required: ["_id", "name", "extension", "userId", "parentDirId"],
         properties: {
           _id: {
             bsonType: "objectId",
           },
           name: {
             bsonType: "string",
           },
           extension: {
             bsonType: "string",
           },
           userId: {
             bsonType: "objectId",
           },
           parentDirId: {
             bsonType: ["objectId", "null"],
           },
           size: {
             bsonType: "number",
           },
           createdAt: {
             bsonType: "date",
           },
           updatedAt: {
             bsonType: "date",
           },
         },
         additionalProperties: false,
       },
     },
     validationAction: "error",
     validationLevel: "strict",
   }); */

} catch (err) {
  console.log("Error setting up the database", err);
} finally {
  await client.close();
}
