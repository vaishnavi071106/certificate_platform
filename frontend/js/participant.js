async function fetchCertificates() {
  const email = document.getElementById("email").value.trim();
  const result = document.getElementById("result");

  if (!email) {
    result.innerHTML = "❌ Please enter your registered email";
    return;
  }

  result.innerHTML = `Fetching certificates for <strong>${email}</strong>...`;

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/certificates/by-email/${encodeURIComponent(email)}`
    );

    const data = await response.json();

    if (!data.certificates || data.certificates.length === 0) {
      result.innerHTML = "❌ No certificates found for this email";
      return;
    }

    // Clear and render certificates
    result.innerHTML = "";

    data.certificates.forEach(cert => {
      const card = document.createElement("div");
      card.className = "certificate-item";
      card.style.marginBottom = "16px";

      card.innerHTML = `
        <strong>Event:</strong> ${cert.event_name}<br>
        <strong>Certificate ID:</strong> ${cert.certificate_uid}<br>
        <strong>Issued At:</strong> ${new Date(cert.issued_at).toLocaleString()}<br>
        <a 
          href="http://127.0.0.1:5000/certificates/${cert.certificate_uid}.png" 
          target="_blank"
          class="btn btn-primary"
          style="margin-top:8px; display:inline-block;"
        >
          Download Certificate
        </a>
      `;

      result.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    result.innerHTML = "❌ Server error while fetching certificates";
  }
}
