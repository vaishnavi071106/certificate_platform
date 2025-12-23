async function verifyCertificate() {
  const certIdInput = document.getElementById("certId");
  const output = document.getElementById("output");

  const certId = certIdInput.value.trim();

  // Basic validation
  if (!certId) {
    output.innerHTML = `
      <div class="alert alert-error">
        <span>❌ Please enter a Certificate ID</span>
      </div>`;
    return;
  }

  // Show loading state
  output.innerHTML = `<div class="status-loading">🔍 Verifying authenticity...</div>`;

  try {
    // Note: Using localhost:5000 to match your backend port
    const response = await fetch(`http://localhost:5000/api/verify/${certId}`);
    
    if (!response.ok) {
      throw new Error("Server response was not ok");
    }

    const data = await response.json();

    if (data.valid) {
      const info = data.data;
      // Success Output
      output.innerHTML = `
        <div class="verify-success" style="padding: 20px; border: 2px solid #22c55e; border-radius: 8px; background-color: #f0fdf4; margin-top: 20px;">
          <h3 style="color: #166534; margin-bottom: 10px;">✅ Valid Certificate</h3>
          <p><strong>Issued To:</strong> ${info.name}</p>
          <p><strong>Event:</strong> ${info.event_name}</p>
          <p><strong>Issue Date:</strong> ${new Date(info.issued_at).toLocaleDateString()}</p>
          <hr style="border: 0; border-top: 1px solid #bbf7d0; margin: 15px 0;">
          <a href="http://localhost:5000/${info.file_path}" target="_blank" class="btn btn-secondary">View Original Document</a>
        </div>
      `;
    } else {
      // Invalid Output
      output.innerHTML = `
        <div class="verify-error" style="padding: 20px; border: 2px solid #ef4444; border-radius: 8px; background-color: #fef2f2; margin-top: 20px;">
          <h3 style="color: #991b1b;">❌ Invalid Certificate</h3>
          <p>We couldn't find a record for this ID. Please check the ID and try again.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Verification Error:", error);
    output.innerHTML = `
      <div class="verify-error" style="padding: 20px; border: 2px solid #ef4444; border-radius: 8px; background-color: #fef2f2; margin-top: 20px;">
        <h3 style="color: #991b1b;">❌ Connection Error</h3>
        <p>Could not connect to the verification server. Please ensure the backend is running.</p>
      </div>
    `;
  }
}

// Allow "Enter" key to trigger verification
document.getElementById("certId").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    verifyCertificate();
  }
});