# QR Code Link Tracking

This is a Google Apps Script project that generates QR codes for links submitted via a Google Form and sends them to the user's email. It logs successful and failed scans in a Vault.gs database

## Setup

1. **Google Apps Script Project:**
   - Create a new Google Apps Script project in your Google Drive.
   - Copy and paste the provided code into the script editor.
   - Save the project.

2. **Database Initialization:**
   - Run the `databaseInit` function once to initialize the database tables.

3. **Form Initialization:**
   - Run the `formInit` function to create a Google Form for link submission.

## Usage

1. **Submit a Link:**
   - Fill out the Google Form with the link and your email address.
   - Submit the form.

2. **Receive Email:**
   - You will receive an email containing a QR code.
   - Scan the QR code to visit the submitted link.


## Dependencies

- **Google App Script:** For hosting web app code
- **VaultGS:** A Google Apps Script library for managing data securely in Google Sheets.
