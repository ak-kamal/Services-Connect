// controllers/parseNidText.js

// Function to parse OCR text and extract name, date of birth, and address
const parseNidText = (frontText) => {
  // Extract name (assuming it's the first line of the front-side text)
  const nameMatch = frontText.match(/Name:\s*([A-Za-z.\s]+)/);
  const name = nameMatch ? nameMatch[1].trim() : 'Not Found';

  // Extract date of birth (e.g., DD MMM YYYY format)
  const dobMatch = frontText.match(/\d{1,2} [A-Za-z]{3} \d{4}/);  // Format like "12 Jan 2000"
  const dob = dobMatch ? dobMatch[0] : 'Not Found';  // If found, use it; else 'Not Found'

  // Parse the date using Date object
const parsedDate = new Date(dob);

const year = parsedDate.getFullYear();
const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
const day = String(parsedDate.getDate()).padStart(2, '0');

const dateOfBirth = `${year}-${month}-${day}`;

  // Extract address from the back text (assuming the back contains the address)
  //const address = backText.trim() || 'Not Found';  // If address is empty, default to 'Not Found'

  // Return the extracted data
  return {
    name,
    dateOfBirth
  };
};

export default parseNidText;