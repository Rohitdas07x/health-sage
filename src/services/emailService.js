const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReportReadyEmail = async (
  email,
  reportName
) => {
  try {
    await transporter.sendMail({
      from: `"Health Sage" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Your Health Report is Ready 🩺",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        ">
          <h2 style="color: #0f766e;">
            Your Health Report is Ready 🩺
          </h2>

          <p>
            Your medical report has been successfully
            analyzed by Health Sage.
          </p>

          <p>
            <strong>Report:</strong> ${reportName}
          </p>

          <p>
            You can now log in to Health Sage to:
          </p>

          <ul>
            <li>View your health metrics</li>
            <li>Check abnormal results</li>
            <li>Ask AI questions about your report</li>
            <li>Track historical health trends</li>
          </ul>

          <p style="
            margin-top: 25px;
            color: #64748b;
            font-size: 14px;
          ">
            This email is a notification only and does not
            provide medical advice. Please consult a qualified
            healthcare professional for medical concerns.
          </p>

          <hr />

          <p style="color: #0f766e;">
            — Health Sage
          </p>
        </div>
      `,
    });

    console.log(
      `Email notification sent to ${email}`
    );
  } catch (error) {
    // Email failure should NOT break report upload
    console.error(
      "Email sending failed:",
      error.message
    );
  }
};

module.exports = {
  sendReportReadyEmail,
};