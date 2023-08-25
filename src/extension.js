"use strict";

/* The code snippet is setting up an interval that repeatedly checks if the `_gmailjs` object is
available in the `window` object. If it is not available, the function returns and continues
checking. Once the `_gmailjs` object is available, the interval is cleared and the `startExtension`
function is called with the `_gmailjs` object as an argument. This code is commonly used to ensure
that the required dependencies are loaded before executing the main functionality of the code. */
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }
    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

/**
 * The function `startExtension` is a JavaScript function that listens for the `view_email` event in
 * Gmail and retrieves the email data, including the sent date. It then replaces dates in the email
 * body with the sent date.
 * @param gmail - The `gmail` parameter is an object that represents the Gmail API. It provides various
 * methods and properties to interact with Gmail functionality. In this code snippet, it is used to
 * observe the `view_email` event and retrieve email data using the `new.get.email_data` method.
 */
function startExtension (gmail) {
    console.log("Extension loading...");
    window.gmail = gmail;
    gmail.observe.on('view_email', email => {
        const emailId = email.id; // Get the email ID
        const emailData = gmail.new.get.email_data(emailId); // Use the new.get.email_data method with the email ID

        // Check if emailData is not null or undefined
        if (emailData) {
            const sentDate = new Date(emailData.date); // Get the email's sent date from the 'date' property
            console.log("Email sent date: " + sentDate.toLocaleDateString());
            const content = email.body();
            var newBody = replaceDates(content, sentDate); // Pass the sent date to the replaceDates function
            email.body(newBody);
        } else {
            console.warn("Email data not found for ID: " + emailId);
        }
    });
}



/**
 * The function `replaceDates` replaces specific date-related words in a given text with their
 * corresponding dates based on a provided sentDate.
 * @param body - The `body` parameter is a string that represents the text in which we want to replace
 * the dates. It could be an email body, a message, or any other text content.
 * @param sentDate - The `sentDate` parameter is a Date object representing the date when the message
 * was sent.
 * @returns the modified body text with the dates replaced.
 */
function replaceDates (body, sentDate) {
    //var today = new Date();
    var replacements = {
        "today": sentDate.toLocaleDateString(),
        "yesterday": new Date(sentDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString(),
        "tomorrow": new Date(sentDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        "monday": getDateForDayOfWeek(1).toLocaleDateString(),
        "tuesday": getDateForDayOfWeek(2).toLocaleDateString(),
        "wednesday": getDateForDayOfWeek(3).toLocaleDateString(),
        "thursday": getDateForDayOfWeek(4).toLocaleDateString(),
        "friday": getDateForDayOfWeek(5).toLocaleDateString(),
        "saturday": getDateForDayOfWeek(6).toLocaleDateString(),
        "sunday": getDateForDayOfWeek(0).toLocaleDateString(),
        "next week": new Date(sentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        "last week": new Date(sentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    function replaceWithPreservedCapitalization (match) {
        var replacement = replacements[match.toLowerCase()];
        if (match.charAt(0).toUpperCase() === match.charAt(0)) {
            replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return match + " (" + replacement + ")";
    }

    for (var key in replacements) {
        var regex = new RegExp("\\b" + key + "\\b", "gi");
        body = body.replace(regex, replaceWithPreservedCapitalization);
    }

    return body;
}


/**
 * The function returns the date for a specific day of the week, taking into account if the day has
 * already occurred in the current week.
 * @param dayOfWeek - The `dayOfWeek` parameter is the day of the week for which you want to get the
 * date. It should be a number between 0 and 6, where 0 represents Sunday, 1 represents Monday, and so
 * on.
 * @returns a Date object that represents the next occurrence of the specified day of the week.
 */
function getDateForDayOfWeek (dayOfWeek) {
    var resultDate = new Date();
    var difference = dayOfWeek - resultDate.getDay();
    if (difference <= 0) {
        difference += 7; // If the day has already occurred this week, assume it refers to the following week
    }
    resultDate.setDate(resultDate.getDate() + difference);
    return resultDate;
}


