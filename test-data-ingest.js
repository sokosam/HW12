const testPayload = {
  containerId: 1,
  errorMessage: "test failure",
};

fetch("http://localhost:3000/api/agent/data-ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testPayload),
})
  .then((res) => res.json())
  .then((data) => console.log("Response:", JSON.stringify(data, null, 2)))
  .catch((err) => console.error("Error:", err));
