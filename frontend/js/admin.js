async function generateCertificates() {
  const status = document.getElementById("status");

  const eventName = document.getElementById("eventName").value.trim();
  const template = document.getElementById("template").files[0];
  const csv = document.getElementById("csv").files[0];

  if (!eventName || !template || !csv) {
    status.innerText = "❌ Please fill all fields";
    return;
  }

  status.innerText = "⏳ Generating certificates...";

  const formData = new FormData();
  formData.append("eventName", eventName);
  formData.append("template", template);
  formData.append("csv", csv);

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/certificates/generate",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      status.innerText = "❌ " + (data.message || "Generation failed");
      console.error("Backend error:", data);
      return;
    }

    status.innerText = `✅ ${data.total} certificates generated successfully`;
  } catch (err) {
    console.error(err);
    status.innerText = "❌ Backend server not reachable";
  }
}
