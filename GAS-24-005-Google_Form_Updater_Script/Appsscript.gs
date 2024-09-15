function updateGoogleForm() {
  var formId = '1IylJaepyw0X-o5d40ZAfGtk6G5ZxnqY3SpLOXxBKE3Y'; // Replace with your Google Form ID
  var sheetId = '107UmCah7s5FzliF6hydB7h87v4hnBByOntt6WSwqN_I'; // Replace with your Google Sheet ID
  var sheetName = 'Form Responses 2';

  var form = FormApp.openById(formId);
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

  var values = sheet.getRange('B2:B').getValues();
  var options = values.flat().filter(function(item) {
    return item !== '';
  });

  var items = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE);
  var multipleChoiceItem = items[0].asMultipleChoiceItem();

  multipleChoiceItem.setChoiceValues(options);
}
