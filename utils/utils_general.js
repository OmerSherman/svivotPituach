const fs = require('fs').promises;

/**
 * Appends an object to a JSON file containing an array.
 * @param {string} filePath - The path to the JSON file.
 * @param {object} newObj - The object to append.
 * @returns {boolean} - Returns true if successful, false otherwise.
 */
async function addObjectToJsonFile(filePath, newObj) {
    try {
        // Read the current content of the file
        const fileData = await fs.readFile(filePath, 'utf8');
        
        // Parse string to JavaScript Array. 
        // If the file is empty, initialize a new array.
        let jsonArray = fileData ? JSON.parse(fileData) : [];
        
        // Ensure the data is actually an array to prevent overwriting
        if (!Array.isArray(jsonArray)) {
            throw new Error('File does not contain a JSON array');
        }

        // Append the new object to the array
        jsonArray.push(newObj);

        // Convert back to a JSON string with 4 spaces indentation
        const updatedJsonText = JSON.stringify(jsonArray, null, 4);

        // Write the updated data back to the file
        await fs.writeFile(filePath, updatedJsonText);
        
        return true; 
        
    } catch (error) {
        console.error(`Error updating file ${filePath}:`, error.message);
        return false; 
    }
}

module.exports = addObjectToJsonFile;