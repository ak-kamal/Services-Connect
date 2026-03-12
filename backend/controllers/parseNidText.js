// controllers/parseNidText.js

// Function to parse OCR text and extract name, date of birth, and address
const parseNidText = (frontText, backText) => {
  // Extract name (assuming it's the first line of the front-side text)
  const name = frontText.split('\n')[0];  // First line of the front text (name)

  // Extract date of birth (e.g., DD MMM YYYY format)
  const dobMatch = frontText.match(/\d{1,2} [A-Za-z]{3} \d{4}/);  // Format like "12 Jan 2000"
  const dateOfBirth = dobMatch ? dobMatch[0] : 'Not Found';  // If found, use it; else 'Not Found'

  // Extract address from the back text (assuming the back contains the address)
  const address = backText.trim() || 'Not Found';  // If address is empty, default to 'Not Found'

  // Return the extracted data
  return {
    name,
    dateOfBirth,
    address
  };
};

export default parseNidText;