const DB_KEY = "****************************************";
const APP_URL = "**************************************";

function databaseInit() {
    try {
        const actions = [{
                action: "create",
                type: "table",
                table: "Scans"
            },
            {
                action: "create",
                type: "column",
                table: "Scans",
                column: "CodeID",
                dataType: "integer",
                required: true
            },
            {
                action: "create",
                type: "column",
                table: "Scans",
                column: "Success",
                dataType: "boolean",
                required: true,
            },
            {
                action: "create",
                type: "column",
                table: "Scans",
                column: "Date",
                dataType: "string",
                required: true,
            },
            {
                action: "create",
                type: "table",
                table: "Links"
            },
            {
                action: "create",
                type: "column",
                table: "Links",
                column: "Link",
                dataType: "string",
                required: true
            },
            {
                action: "create",
                type: "column",
                table: "Links",
                column: "Secret",
                dataType: "string",
                required: true
            }
        ]

        actions.forEach((action) => {
            action.key = DB_KEY
            VaultGS.evaluate(action)
        })

        console.log("Database initialized successfully")
    } catch (error) {
        console.log("Error initializing database:", error)
    }
}

/**
 * Initializes the form creation process, capturing user input and sending an email with a QR code.
 */
function formInit() {
    // Create a new Google Form
    const form = FormApp.create("QR Code Link Generator");

    // Add a text item to the form for capturing data
    form.addTextItem()
        .setTitle("Link")
        .setRequired(true);

    // Add a text item to the form for capturing email
    form.addTextItem()
        .setTitle("Email")
        .setRequired(true);

    // Set up the trigger for form submission
    ScriptApp.newTrigger("onInitFormSubmit")
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
    var link = getResponseValue(formResponse, "Link");
    var email = getResponseValue(formResponse, "Email");

    // Generate a secret (a simple random string, for example)
    var secret = Math.random().toString(36).substring(2, 15);

    const apiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";

    try {
        const result = VaultGS.evaluate({
            key: DB_KEY,
            action: "create",
            type: "entry",
            table: "Links",
            entry: {
                "Link": link,
                "Secret": secret
            }
        });

        var id = result.entry.id;

        var qrCodeUrl = apiUrl + encodeURIComponent(`${APP_URL}?id=${id}&secret=${secret}`);

        // Send email with the form data and QR code
        sendEmailWithQRCode(link, qrCodeUrl, email);
    } catch (error) {
        Logger.log("Error storing data or generating QR code: " + error.message);
    }
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
function sendEmailWithQRCode(link, qrCodeUrl, email) {
    var subject = "QR Code Generation";
    var body = `
    <html>
      <body>
        <p>Thank you for your submission!</p>
        <p>Your submitted link: ${link}</p>
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

/**
 * Handles HTTP GET requests to fetch and display data.
 * @param {Object} e - The event object containing request parameters.
 * @returns {HtmlOutput} - The HTML output displaying the fetched content.
 */
function doGet(e) {
    if (e.parameters.id && e.parameters.secret) {
        try {
            var id = parseInt(e.parameters.id[0], 10); // Updated to handle id parameter correctly

            const result = VaultGS.evaluate({
                key: DB_KEY,
                action: "read",
                type: "entry",
                table: "Links",
                id: id
            });

            if (result.data["Secret"] === e.parameters.secret[0]) { // Updated to handle secret parameter correctly
                var link = result.data["Link"];

                // Ensure the link includes the protocol (http or https)
                if (!/^https?:\/\//i.test(link)) {
                    link = 'http://' + link;
                }

                var htmlOutput = HtmlService.createHtmlOutput(`
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f7f9fc;
                }
                .container {
                  text-align: center;
                  background: #fff;
                  padding: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                }
                .link {
                  font-size: 20px;
                  color: #007BFF;
                  text-decoration: none;
                  display: inline-block;
                  margin-top: 20px;
                  padding: 10px 20px;
                  border: 1px solid #007BFF;
                  border-radius: 5px;
                  transition: background-color 0.3s, color 0.3s;
                }
                .link:hover {
                  background-color: #007BFF;
                  color: #fff;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <p>Your link:</p>
                <a class="link" href="${link}" target="_top">${link}</a>
              </div>
            </body>
          </html>
        `);
                logScan(id, true, new Date().toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles"
                }));
                return htmlOutput;
            } else {
                logScan(id, false, new Date().toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles"
                }));
                return HtmlService.createHtmlOutput("Invalid secret.");
            }
        } catch (error) {
            return HtmlService.createHtmlOutput("Error fetching data: " + error.message);
        }
    } else {
        return HtmlService.createHtmlOutput("Invalid request parameters.");
    }
}


/**
 * Logs the scan event.
 * @param {number} codeId - The ID of the QR code.
 * @param {boolean} success - Whether the scan was successful.
 * @param {string} date - The date and time of the scan.
 */
function logScan(codeId, success, date) {
    try {
        VaultGS.evaluate({
            key: DB_KEY,
            action: "create",
            type: "entry",
            table: "Scans",
            entry: {
                "CodeID": codeId,
                "Success": success,
                "Date": date
            }
        });
    } catch (error) {
        Logger.log("Error logging scan: " + error.message);
    }
}
