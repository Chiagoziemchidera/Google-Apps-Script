function sendWelcomeEmail(e) {
  // Check if 'e' and 'e.values' exist
  if (!e || !e.values) {
    Logger.log('Error: No event object or event values found.');
    return;
  }

// Proceed with the rest of the code
  var firstName = e.values[1];  // Assumes the first name is in the 2nd column
  var emailAddress = e.values[3];  // Assumes email is in the 4th column

  // Create the email subject
  var subject = 'Welcome to Heritage Academy!';

  // Create the HTML body of the email
  var htmlBody = `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; margin: 0;">
      <!-- Header -->
      <div style="background-color: #54b02c; padding: 20px; text-align: center; color: #ffffff;">
        <img src="https://drive.google.com/uc?export=view&id=1hwRrw3_odz4deXRSiIjicdqbIOhcRryi" alt="Academy Logo" width="150px" style="margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to Heritage Academy, ${firstName}!</h1>
      </div>

      <!-- Main Content Section -->
      <div style="background-color: #ffffff; padding: 30px;">
        <h2 style="color: #333333;">We are thrilled to have you with us!</h2>
        <p style="color: #666666; line-height: 1.6;">
          Dear ${firstName},<br><br>
          We are thrilled to have you join the academy. Starting this journey with us is a step toward something truly special, and we couldn’t be happier to support you along the way.<br><br>
          At Heritage Academy, you’re not just another student—you’re part of a family. Here, we believe in nurturing every individual’s unique potential, and we are excited to see where your growth will take you. As you dive into your learning experience, know that we’re here to guide, inspire, and encourage you every step of the way. This is the beginning of an amazing chapter, and we are honored to be a part of your story.
        </p>

        <!-- Image Section -->
        <div style="text-align: center; margin: 20px 0;">
          <img src="https://drive.google.com/uc?export=view&id=1UjvyzdPpfykJURkzgi3rkOJfRaMJgSn5" alt="Welcome Image" width="400px" style="border-radius: 10px;">
        </div>

        <!-- Key Features Section -->
        <div style="color: #333333;">
          <h3>What You Can Expect:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li style="background-color: #f4f4f4; padding: 10px 15px; margin-bottom: 10px; border-radius: 5px;">
              <strong>Faith-Based Learning:</strong> Our curriculum is centered on Christian values, helping you grow both academically and spiritually.
            </li>
            <li style="background-color: #f4f4f4; padding: 10px 15px; margin-bottom: 10px; border-radius: 5px;">
              <strong>Supportive Community:</strong> You’ll find support and encouragement from tutors, the admins unit, and peers  who are eager to help you succeed.
            </li>
            <li style="background-color: #f4f4f4; padding: 10px 15px; margin-bottom: 10px; border-radius: 5px;">
              <strong>Lifelong Friendships:</strong> You’ll create lasting bonds with fellow students, forming friendships that will stay with you for years to come.
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #4f4f4f; padding: 20px; text-align: center; color: #ffffff;">
        <p style="margin: 0;">&copy; 2024 Heritage Academy | All Rights Reserved</p>
        <p style="margin: 5px 0;">
          <a href="mailto:academyunithotr@gmail.com" style="color: #ffffff; text-decoration: underline;">Contact Support</a>
        </p>
      </div>
    </body>
  </html>
  `;

  // Send the email
  GmailApp.sendEmail(emailAddress, subject, '', {htmlBody: htmlBody});
}

// Set up trigger to run function on form submission
function setUpTrigger() {
  ScriptApp.newTrigger('sendWelcomeEmail')
    .forForm(FormApp.openById('1aiQGTdkWOgnXVK5MLF3WHYv75xNYb9zJiBKzEPzY6nM'))
    .onFormSubmit()
    .create();
}
