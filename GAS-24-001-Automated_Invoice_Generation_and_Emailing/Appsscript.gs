function generateAndSendInvoices() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const invoiceSheet = spreadsheet.getSheetByName("Invoice Data Sheet");
  const itemSheet = spreadsheet.getSheetByName("Item Data Sheet");
  const templateSheet = spreadsheet.getSheetByName("Invoice Template");

  const invoiceData = invoiceSheet.getDataRange().getValues();
  const itemData = itemSheet.getDataRange().getValues();

  for (let i = 1; i < invoiceData.length; i++) {
    const sendInvoice = invoiceData[i][7]; // Assuming Column H is the checkbox column
    if (!sendInvoice) continue; // Skip this row if the checkbox is not checked

    const clientName = invoiceData[i][0];
    const email = invoiceData[i][1];
    const address = invoiceData[i][2];
    const invoiceNumber = invoiceData[i][3];
    const invoiceDate = invoiceData[i][4];
    const totalAmount = invoiceData[i][5];
    const dueDate = invoiceData[i][6];

    // Clear the template for the next invoice
    templateSheet.getRange("B19:G28").clearContent();

    // Populate the invoice template with header details
    templateSheet.getRange("C9").setValue(invoiceDate);
    templateSheet.getRange("B12").setValue(clientName);
    templateSheet.getRange("B13").setValue(email);
    templateSheet.getRange("B14").setValue(address);
    templateSheet.getRange("G12").setValue(invoiceNumber);
    templateSheet.getRange("G15").setValue(dueDate);
    templateSheet.getRange("G32").setValue(totalAmount);

    // Populate the items in the invoice
    let itemRow = 19;
    for (let j = 1; j < itemData.length; j++) {
      if (itemData[j][0] === invoiceNumber) {
        templateSheet.getRange(`B${itemRow}`).setValue(itemData[j][1]); // Item Description
        templateSheet.getRange(`E${itemRow}`).setValue(itemData[j][2]); // Quantity
        templateSheet.getRange(`F${itemRow}`).setValue(itemData[j][3]); // Unit Price
        templateSheet.getRange(`G${itemRow}`).setValue(itemData[j][4]); // Total Price
        itemRow++;
      }
    }

    // Create a new temporary spreadsheet for the invoice
    const tempSpreadsheet = SpreadsheetApp.create(`Invoice_${invoiceNumber}`);
    const tempSheet = templateSheet.copyTo(tempSpreadsheet);

    // Remove the default first sheet in the new spreadsheet
    tempSpreadsheet.deleteSheet(tempSpreadsheet.getSheets()[0]);

    tempSheet.setName("Invoice");

    // Convert the temporary spreadsheet to PDF
    const pdfFile = DriveApp.createFile(tempSpreadsheet.getAs('application/pdf').setName(`Invoice_${invoiceNumber}.pdf`));

    // Send the invoice via email
    GmailApp.sendEmail(email, `Invoice #${invoiceNumber}`, `Dear ${clientName},\n\nPlease find attached your invoice from ${invoiceDate}.\n\nBest regards,\nShopMate`, {
      attachments: [pdfFile],
      name: 'ShopMate'
    });

    // Log the process
    Logger.log(`Invoice #${invoiceNumber} sent to ${clientName} (${email})`);

    // Delete the temporary spreadsheet
    DriveApp.getFileById(tempSpreadsheet.getId()).setTrashed(true);

    // Pause to avoid exceeding Google quotas
    Utilities.sleep(1000);
  }
}
