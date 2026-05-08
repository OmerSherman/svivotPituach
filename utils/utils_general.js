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

/**
 * Deletes an object from a JSON file containing an array based on a key-value match.
 * @param {string} filePath - The path to the JSON file.
 * @param {string} key - The property name to check (e.g., 'id').
 * @param {any} value - The value of the property to match for deletion.
 * @returns {boolean} - Returns true if successful, false otherwise.
 */
async function deleteObjectFromJsonFile(filePath, key, value) {
    try {
        // Read the current content of the file
        const fileData = await fs.readFile(filePath, 'utf8');
        
        // If the file is empty, there is nothing to delete
        if (!fileData) {
            return false;
        }

        // Parse string to JavaScript Array
        let jsonArray = JSON.parse(fileData);
        
        // Ensure the data is actually an array to prevent errors
        if (!Array.isArray(jsonArray)) {
            throw new Error('File does not contain a JSON array');
        }

        // Filter out the object that matches the key and value
        // This keeps all items where item[key] does NOT equal the target value
        const initialLength = jsonArray.length;
        jsonArray = jsonArray.filter(item => item[key] !== value);

        // (Optional) If you want to return false when the object wasn't found in the array:
        // if (jsonArray.length === initialLength) return false;

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

module.exports = {addObjectToJsonFile,deleteObjectFromJsonFile };