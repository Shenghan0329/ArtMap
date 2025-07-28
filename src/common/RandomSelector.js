export default class RandomSelector {
    constructor(ids) {
        // Store the original array (make a copy to avoid mutation)
        this.originalArray = [...ids];
        // Track available elements for selection
        this.availableElements = [...ids];
    }
    
    /**
     * Select a specified number of random elements from the available array
     * Selected elements won't be available for future selections until reset
     * @param {number} number - Number of elements to select
     * @returns {Array} - Array of selected elements
     */
    select(number) {
        // Handle edge cases
        if (number <= 0) {
            return [];
        }
        
        // If requested number exceeds available elements, return all remaining
        if (number >= this.availableElements.length) {
            const result = [...this.availableElements];
            this.availableElements = []; // Clear available elements
            return result;
        }
        
        // Select random elements without replacement
        const selected = [];
        
        for (let i = 0; i < number; i++) {
            // Generate random index from remaining available elements
            const randomIndex = Math.floor(Math.random() * this.availableElements.length);
            
            // Remove and add to selected array
            const selectedElement = this.availableElements.splice(randomIndex, 1)[0];
            selected.push(selectedElement);
        }
        
        return selected;
    }
    
    /**
     * Reset the selector
     * @param {Array} [newArray] - Optional new array to replace the current one
     */
    reset(newArray) {
        if (newArray && Array.isArray(newArray)) {
            // Replace with new array
            this.originalArray = [...this.originalArray, ...newArray];
            this.availableElements = [...this.availableElements, ...newArray];
        } else {
            // Reset to original array, making all elements selectable again
            this.availableElements = [...this.originalArray];
        }
    }
    
    /**
     * Get the number of remaining available elements
     * @returns {number} - Number of elements still available for selection
     */
    getRemainingCount() {
        return this.availableElements.length;
    }
    
    /**
     * Check if there are any elements available for selection
     * @returns {boolean} - True if elements are available, false otherwise
     */
    hasElementsAvailable() {
        return this.availableElements.length > 0;
    }
    
    /**
     * Get a copy of the original array
     * @returns {Array} - Copy of the original array
     */
    getOriginalArray() {
        return [...this.originalArray];
    }
    
    /**
     * Get a copy of currently available elements
     * @returns {Array} - Copy of available elements
     */
    getAvailableElements() {
        return [...this.availableElements];
    }
}