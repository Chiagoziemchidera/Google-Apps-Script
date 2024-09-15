function categorizeFeedback() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Loop through all rows of data, starting from the second row (i = 1)
  for (var i = 1; i < data.length; i++) {
    var overallRating = data[i][5]; // Column 6: Overall Satisfaction Rating (1-5)
    var comments = data[i][10];     // Column 11: Additional Comments or Suggestions
    var category = '';              // To store the feedback category

    // Categorize based on overall rating
    if (overallRating >= 5) {
      category = 'Very Positive';
    } else if (overallRating == 4) {
      category = 'Positive';
    } else if (overallRating == 3) {
      category = 'Neutral';
    } else if (overallRating <= 2) {
      category = 'Negative';
    } else if (overallRating <= 1) {
      category = 'Very Negative';
    }

    // Additional categorization based on comment keywords
    category = categorizeComment(comments, category);

    // Set the category in Column 13
    sheet.getRange(i + 1, 13).setValue(category); // Adjust column number if needed
  }

  // Refresh the chart after categorization
  refreshChart();
}

// Function to categorize comments using the updated categorization logic
function categorizeComment(comments, currentCategory) {
  if (comments) {
    var commentText = comments.toLowerCase();

    // Very Positive feedback
    if (commentText.includes('excellent') || commentText.includes('fantastic') || 
        commentText.includes('amazing') || commentText.includes('outstanding') || 
        commentText.includes('great') || commentText.includes('superb') || 
        commentText.includes('perfect')) {
      return 'Very Positive';
    } 
    // Positive feedback
    else if (commentText.includes('good') || commentText.includes('satisfactory') || 
             commentText.includes('nice') || commentText.includes('well done') || 
             commentText.includes('impressive') || commentText.includes('decent') || 
             commentText.includes('fine')) {
      return 'Positive';
    } 
    // Negative feedback
    else if (commentText.includes('slow') || commentText.includes('bad') || 
             commentText.includes('poor') || commentText.includes('disappointing') || 
             commentText.includes('unsatisfactory') || commentText.includes('below expectations') || 
             commentText.includes('subpar')) {
      return 'Negative';
    }
    // Very Negative feedback
    else if (commentText.includes('terrible') || commentText.includes('awful') || 
             commentText.includes('horrible') || commentText.includes('unacceptable') || 
             commentText.includes('disaster') || commentText.includes('worst') || 
             commentText.includes('pathetic')) {
      return 'Very Negative';
    }
  }
  return currentCategory; // Return the category based on rating if no keywords are found
}

// Function to refresh the chart after categorization
function refreshChart() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var chartSheet = ss.getSheetByName("Summary");
  
  // Assuming there is already a chart added to the "Summary" sheet
  var charts = chartSheet.getCharts();
  
  // Loop through and refresh any existing charts
  for (var i = 0; i < charts.length; i++) {
    chartSheet.updateChart(charts[i]);
  }
}


function generateDailyFeedbackReport() {
  // Open the Google Sheet and get necessary data
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = sheet.getSheetByName('Form Responses 1');
  var summarySheet = sheet.getSheetByName('Summary');
  var emailSheet = sheet.getSheetByName('Stakeholder Email');
  
  // Get feedback category counts from the summary sheet
  var positiveCount = summarySheet.getRange("B2").getValue();
  var neutralCount = summarySheet.getRange("B3").getValue();
  var negativeCount = summarySheet.getRange("B4").getValue();
  var veryPositiveCount = summarySheet.getRange("B5").getValue();
  var veryNegativeCount = summarySheet.getRange("B6").getValue();
  
  // Find key comments: positive and negative comments
  var commentsData = responseSheet.getRange(2, 11, responseSheet.getLastRow() - 1).getValues(); // Assuming comments in column 11
  var keyPositiveComments = [];
  var keyNegativeComments = [];
  
  for (var i = 0; i < commentsData.length; i++) {
    var comment = commentsData[i][0];
    if (comment.toLowerCase().includes("excellent") || comment.toLowerCase().includes("great") || comment.toLowerCase().includes("fantastic")) {
      keyPositiveComments.push(comment);
    }
    if (comment.toLowerCase().includes("slow") || comment.toLowerCase().includes("bad") || comment.toLowerCase().includes("poor")) {
      keyNegativeComments.push(comment);
    }
  }
  
  // Create a new Google Doc for the report, including the current date in the title
  var reportDate = new Date();
  var reportTitle = "Client Feedback Report - " + Utilities.formatDate(reportDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var doc = DocumentApp.create(reportTitle);
  var body = doc.getBody();
  
  // Add title to the report
  body.appendParagraph("Client Feedback Report").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  
  // Add summary of overall feedback distribution
  body.appendParagraph("Overall Feedback Summary:").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Positive: " + positiveCount);
  body.appendParagraph("Neutral: " + neutralCount);
  body.appendParagraph("Negative: " + negativeCount);
  body.appendParagraph("Very Positive: " + veryPositiveCount);
  body.appendParagraph("Very Negative: " + veryNegativeCount);
  
  // Add key comments section
  body.appendParagraph("Key Positive Comments:").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (keyPositiveComments.length > 0) {
    for (var j = 0; j < keyPositiveComments.length; j++) {
      body.appendListItem(keyPositiveComments[j]);
    }
  } else {
    body.appendParagraph("No key positive comments found.");
  }

  body.appendParagraph("Key Negative Comments:").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (keyNegativeComments.length > 0) {
    for (var k = 0; k < keyNegativeComments.length; k++) {
      body.appendListItem(keyNegativeComments[k]);
    }
  } else {
    body.appendParagraph("No key negative comments found.");
  }

  // Add visual chart from Google Sheets
  var charts = summarySheet.getCharts();
  if (charts.length > 0) {
    // Insert the first chart found in the summary sheet
    var chart = charts[0];
    var image = chart.getAs('image/png');
    body.appendParagraph("Feedback Distribution Chart:").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendImage(image);
  } else {
    body.appendParagraph("No chart found in summary sheet.");
  }

  // Save the document
  doc.saveAndClose();
  
  // Convert Google Doc to PDF
  var docId = doc.getId();
  var docFile = DriveApp.getFileById(docId);
  var pdfFile = docFile.getAs('application/pdf');

  // Store the PDF in a specific Google Drive folder
  var folderName = "Feedback Reports";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName); // Create folder if it doesn't exist
  }
  
  var storedPdfFile = folder.createFile(pdfFile).setName(reportTitle + ".pdf");

  // Fetch email addresses from "Stakeholder Email" sheet
  var emailRange = emailSheet.getRange(2, 1, emailSheet.getLastRow() - 1); // Starting from A2
  var emailList = emailRange.getValues().filter(function(row) {
    return row[0] != ''; // Filter out empty cells
  }).map(function(row) {
    return row[0]; // Return the email address from each row
  }).join(',');

  // Email the PDF report to predefined recipients
  var subject = "Client Feedback Report - " + Utilities.formatDate(reportDate, Session.getScriptTimeZone(), "MMMM yyyy");
  var emailBody = "Dear Team,\n\nPlease find attached the Client Feedback Report for " +
                  Utilities.formatDate(reportDate, Session.getScriptTimeZone(), "MMMM yyyy") + ".\n\nBest Regards,\nYour Company";
  
  MailApp.sendEmail({
    to: emailList,
    subject: subject,
    body: emailBody,
    attachments: [storedPdfFile.getAs(MimeType.PDF)]
  });
  
}


function sendFeedbackReplies() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
  var range = sheet.getDataRange();
  var values = range.getValues();
  
  var emailTemplate = HtmlService.createHtmlOutputFromFile('emailTemplate').getContent();
  
  for (var i = 1; i < values.length; i++) { // Assuming first row is header
    var email = values[i][2]; // Assuming email is in column C
    var reply = values[i][13]; // Assuming reply is in column N
    var send = values[i][14]; // Assuming checkbox is in column M
    
    if (send === true && reply) {
      // Prepare the email content
      var clientName = values[i][1]; // Assuming client name is in column B
      var emailBody = emailTemplate.replace(/{{clientName}}/g, clientName)
                                   .replace('{{reply}}', reply);
      
      // Send email
      MailApp.sendEmail({
        to: email,
        subject: "Response to Your Feedback",
        htmlBody: emailBody
      });
      
      // Mark the reply as sent
      sheet.getRange(i + 1, 15).setValue(false); // Uncheck the checkbox
    }
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Send Feedback Replies', 'sendFeedbackReplies')
    .addToUi();
}
