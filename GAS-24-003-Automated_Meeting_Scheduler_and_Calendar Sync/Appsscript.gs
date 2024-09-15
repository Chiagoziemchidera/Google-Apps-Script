function scheduleMeeting() {
  try {
    // Retrieve user availability and preferences
    var formResponses = getFormResponses();  // Function to fetch form responses
    formResponses.forEach(response => {
      
      // Validate meeting duration (must be a number and greater than 0)
      if (isNaN(response.meetingDuration) || response.meetingDuration <= 0) {
        Logger.log("Invalid meeting duration for " + response.email);
        sendEmailNotification(response.email, "Meeting Scheduling Failed", "Invalid meeting duration provided. Please enter a valid number of minutes.");
        return;  // Skip this response and do not attempt to schedule the meeting
      }
      
      // Proceed with scheduling the meeting if the meeting duration is valid
      var calendarId = 'primary'; // Use the user's primary calendar
      
      // Ensure the start and end times are valid
      var availability = getUserAvailability(calendarId, response.preferredStartDate, response.preferredStartDate); // Check for busy times only on the start date
      var availableSlot = findAvailableSlot(availability, response.preferredStartDate, response.meetingDuration);
      
      if (availableSlot) {
        var eventId = createMeeting(calendarId, availableSlot.start, availableSlot.end, response.meetingTitle, response.meetingDescription, response.attendeesEmails);
        sendEmailNotification(response.email, "Meeting Scheduled: " + response.meetingTitle, "Your meeting has been scheduled.", getMeetLink(calendarId, eventId));
      } else {
        Logger.log("No available slot found for " + response.email);
        sendEmailNotification(response.email, "Meeting Scheduling Failed", "No available slots found for your requested time.");
      }
    });
  } catch (e) {
    Logger.log("Error in scheduling meeting: " + e.message);
  }
}

// Fetch responses from a sample Google Form
function getFormResponses() {
  var form = FormApp.openById('1RTmkSQFW0YvWBCGvqs67nv4FH-c4f8SzqcRsXdbsBNk'); // Replace with your Google Form ID
  var formResponses = form.getResponses();
  var responsesArray = [];
  
  formResponses.forEach(response => {
    var itemResponses = response.getItemResponses();
    responsesArray.push({
      preferredStartDate: new Date(itemResponses[0].getResponse()), // Assumes the first question is the start date
      meetingDuration: parseInt(itemResponses[1].getResponse()), // Assumes the second question is meeting duration in minutes
      meetingTitle: itemResponses[2].getResponse(), // Assumes the third question is meeting title
      meetingDescription: itemResponses[3].getResponse(), // Assumes the fourth question is meeting description
      attendeesEmails: itemResponses[4].getResponse().split(','), // Assumes the fifth question is attendees emails separated by commas
      email: response.getRespondentEmail() // Collects the respondent's email
    });
  });
  
  return responsesArray;
}

// Get user availability using Google Calendar API with valid date range check
function getUserAvailability(calendarId, startDate, endDate) {
  // Ensure that startDate and endDate are valid Date objects and create a time range
  if (!startDate || !(startDate instanceof Date) || isNaN(startDate.getTime())) {
    Logger.log("Invalid startDate provided.");
    return [];
  }
  
  if (!endDate || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
    Logger.log("Invalid endDate provided.");
    return [];
  }
  
  // Ensure that the endDate is not before startDate, extend it by 1 hour if they are the same
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Extend by 1 hour
  }
  
  // Freebusy API call
  var freeBusy = Calendar.Freebusy.query({
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    items: [{ id: calendarId }]
  });
  
  // Ensure the result is valid before returning
  return freeBusy.calendars[calendarId].busy || [];
}

// Find available slot for the meeting based on preferred start time and duration
function findAvailableSlot(busySlots, preferredStartDate, meetingDuration) {
  var slotFound = null;
  var meetingEndTime = new Date(preferredStartDate.getTime() + meetingDuration * 60 * 1000);
  
  // Ensure meeting time does not overlap with any busy slot
  var isSlotFree = true;
  for (var i = 0; i < busySlots.length; i++) {
    var busyStart = new Date(busySlots[i].start);
    var busyEnd = new Date(busySlots[i].end);
    
    if ((preferredStartDate >= busyStart && preferredStartDate < busyEnd) || (meetingEndTime > busyStart && meetingEndTime <= busyEnd)) {
      isSlotFree = false;
      break;
    }
  }
  
  if (isSlotFree) {
    slotFound = { start: preferredStartDate, end: meetingEndTime };
  }
  
  return slotFound;
}

// Create a meeting in Google Calendar with Google Meet link
function createMeeting(calendarId, startTime, endTime, summary, description, attendeesEmails) {
  var event = {
    summary: summary,
    description: description,
    start: { dateTime: startTime.toISOString(), timeZone: Session.getScriptTimeZone() },
    end: { dateTime: endTime.toISOString(), timeZone: Session.getScriptTimeZone() },
    attendees: attendeesEmails.map(email => ({ email: email.trim() })),
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: { type: 'hangoutsMeet' },
        requestId: Utilities.getUuid()
      }
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 24 * 60 }, { method: 'popup', minutes: 10 }]
    }
  };
  
  var createdEvent = Calendar.Events.insert(event, calendarId, { conferenceDataVersion: 1 });
  return createdEvent.id;
}

// Get Google Meet link from the event
function getMeetLink(calendarId, eventId) {
  var event = Calendar.Events.get(calendarId, eventId, { conferenceDataVersion: 1 });
  return event.conferenceData.entryPoints ? event.conferenceData.entryPoints[0].uri : null;
}

// Send email notification
function sendEmailNotification(email, subject, message, meetLink) {
  try {
    var body = message + "<br/><br/>Join the meeting: " + (meetLink || "No link available.");
    GmailApp.sendEmail(email, subject, '', { htmlBody: body });
  } catch (e) {
    Logger.log("Error sending email to " + email + ": " + e.message);
  }
}
