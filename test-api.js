
async function testApi() {
  try {
    console.log("Running test scan on https://example.com...");
    const res = await fetch("http://localhost:8080/api/public/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "lum_live_01502eb6d4cf50e30c29cb0711ad8708081dc48b94a82d9a3f7ed4d8e8ca012f"
      },
      body: JSON.stringify({ url: "https://discord.com/" })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testApi();
