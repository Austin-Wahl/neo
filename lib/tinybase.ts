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
    lastRunSql: { type: "string" },
    database: { type: "string" },
    queryId: { type: "string" },
  },
  result: {
    queryName: { type: "string" },
    queryId: { type: "string" },
    data: { type: "string" },
  },
});

// Use a Persiser to save data in the browsers IndexedDB. I think that session storage is to short as you'll likely want to come back to data later. Feel free to change this.
const databaseName = "Neo-Results-Sync-Datastore";

const persister = createIndexedDbPersister(store, databaseName);

// Start auto-persisting
async function initializePersister() {
  try {
    await persister.startAutoPersisting();

    console.log("TinyBase IndexedDB persister initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize TinyBase persister:", error);
  }
}

// Call the initialization function
initializePersister();

// Logging for debug purposes
// persister.addStatusListener((status) => {
//   console.warn("TINYBASE STATUS [UPDATING STATE]", status.getStats());
// });

export default store;
