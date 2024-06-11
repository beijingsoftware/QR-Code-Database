// Non Tracking Version.
 /**
 * Initializes the form creation process, capturing user input and sending an email with a QR code.
 */
function init() {
  // Create a new Google Form
  const form = FormApp.create("QR Code Generator");

  // Add a text item to the form for capturing data
  form.addTextItem()
    .setTitle("Data")
    .setRequired(true);

  // Add a text item to the form for capturing email
  form.addTextItem()
    .setTitle("Email")
    .setRequired(true);

  // Set up the trigger for form submission
  var trigger = ScriptApp.newTrigger("onInitFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
}

/**
 * Handles form submission for initialization form.
 * Sends an email with a QR code containing the submitted data.
 * @param {Object} e - The form submission event object.
 */
function onInitFormSubmit(e) {
  var formResponse = e.response;
  var data = getResponseValue(formResponse, "Data");
  var email = getResponseValue(formResponse, "Email");

  // Generate QR code containing the submitted data
  var qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  // Send email with the form data and QR code
  sendEmailWithQRCode(data, qrCodeUrl, email);
}

/**
 * Helper function to retrieve response value based on item title.
 * @param {FormResponse} formResponse - The form response object.
 * @param {string} title - The title of the form item.
 * @returns {string} - The response value.
 */
function getResponseValue(formResponse, title) {
  var itemResponses = formResponse.getItemResponses();

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    if (itemResponse.getItem().getTitle() === title) {
      return itemResponse.getResponse();
    }
  }

  return null;
}

/**
 * Sends an email containing the submitted data and a QR code.
 * @param {string} data - The submitted data.
 * @param {string} qrCodeUrl - The URL of the QR code.
 * @param {string} email - The recipient's email address.
 */
function sendEmailWithQRCode(data, qrCodeUrl, email) {
  var subject = "QR Code Generation";
  var body = `
    <html>
      <body>
        <p>Thank you for your submission!</p>
        <p>Your submitted data: ${data}</p>
        <p>Scan the QR code below to view your data:</p>
        <img src="${qrCodeUrl}" alt="QR Code">
      </body>
    </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });
}
