// Neo uses TinyBase as the local database for managing query results. This ensures Neo can remain
// performant while enabling you to also have multiple grids synced to one query.
import { createStore } from "tinybase";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db";

// Main Store
const store = createStore();

// Store schema for the Editors and Results sync layer
store.setSchema({
  editors: {
    sql: { type: "string" },
    state: { type: "boolean" },
    lastRunSql: { type: "string" },
    database: { type: "string" },
    queryId: { type: "string" },
  },
  result: {
    queryName: { type: "string" },
    queryId: { type: "string" },
    data: { type: "string" },
    connectionId: { type: "string" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  logHistory: {
    queryId: { type: "string" },
    history: { type: "string" },
  },
});

// Use a Persiser to save data in the browsers IndexedDB. I think that session storage is to short as you'll likely want to come back to data later. Feel free to change this.
const databaseName = "Neo-Results-Sync-Datastore";

export const persister = createIndexedDbPersister(store, databaseName);
let isInitialized = false;
// Start auto-persisting
export async function initializePersister() {
  try {
    if (!isInitialized) {
      console.log("Initializing TinyBase persister");
      await persister.startAutoPersisting();
      isInitialized = true;
    }
    // console.log("TinyBase IndexedDB persister initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize TinyBase persister:", error);
  }
}

// Logging for debug purposes
// persister.addStatusListener((status) => {
//   console.warn("TINYBASE STATUS [UPDATING STATE]", status.getStats());
// });

export default store;
