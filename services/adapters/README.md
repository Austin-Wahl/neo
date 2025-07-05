# NEO Connection Abstraction API (NEO CAAPI)

In order to handle connections for various database providers, NEO abstracts connections using something we call a Connection Service. Connection Services are individual modules which build up the NEO Abstraction API. A Connection Service is quite litterly, an adapter which allows for NEO to seemless integrate databses which have varying technical standards acorss the NEO codebase, without having to change the fundementals in the NEO API. For example, MySQL and Posgres both have different drivers for connecting and interacting with these databases. While NEO could handle this within a giant IF or Switch statement, we instead chose to abstract these connections to keep files simple.

Here is an example of connection to a database using the NEO Connection Abstraction API

This works for both MySQL and Postgres connections. Just be sure to define the database type. This is super import for ensuring the NEO Abstraction API handles the connection corectly.

```js
const connection = new NeoConnection({
  database: "Postgres",
  connection: {
    hostname: "",
    username: "",
    password: "",
    port: "",
    ssl: {},
  },
});

connection.query(sql, options);
```
