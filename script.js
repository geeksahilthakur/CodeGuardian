// Security Library for Input Validation and Sanitization

// Import DOMPurify if running in a Node.js environment
let DOMPurify
if (typeof window === "undefined") {
  DOMPurify = require("dompurify")
} else {
  DOMPurify = window.DOMPurify
}

const SecurityLibrary = {
  // Sanitize HTML input
  sanitizeHTML: (input) => DOMPurify.sanitize(input),

  // Validate and sanitize email
  validateEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format")
    } 
    return email.trim().toLowerCase()
  },

  // Validate and sanitize URL
  validateURL: (url) => {
    try {
      const parsedURL = new URL(url)
      return parsedURL.href
    } catch (error) {
      throw new Error("Invalid URL format")
    }
  },

  // Escape special characters to prevent XSS
  escapeHTML: (text) => {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  },

  // Prevent SQL injection by escaping special characters
  escapeSQLInput: (input) => {
    if (typeof input !== "string") {
      return input
    }
    return input.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
      switch (char) {
        case "\0":
          return "\\0"
        case "\x08":
          return "\\b"
        case "\x09":
          return "\\t"
        case "\x1a":
          return "\\z"
        case "\n":
          return "\\n"
        case "\r":
          return "\\r"
        case '"':
        case "'":
        case "\\":
        case "%":
          return "\\" + char
      }
    })
  },

  // Validate and sanitize a generic input field
  sanitizeInput: function (input, type = "text", options = {}) {
    let sanitizedInput = typeof input === "string" ? input.trim() : String(input)

    switch (type) {
      case "email":
        return this.validateEmail(sanitizedInput)
      case "url":
        return this.validateURL(sanitizedInput)
      case "html":
        return this.sanitizeHTML(sanitizedInput)
      case "sql":
        return this.escapeSQLInput(sanitizedInput)
      case "number":
        if (isNaN(sanitizedInput)) {
          throw new Error("Invalid number format")
        }
        const num = Number(sanitizedInput)
        if (options.min !== undefined && num < options.min) {
          throw new Error(`Number must be at least ${options.min}`)
        }
        if (options.max !== undefined && num > options.max) {
          throw new Error(`Number must not exceed ${options.max}`)
        }
        return num
      default:
        if (options.maxLength && sanitizedInput.length > options.maxLength) {
          sanitizedInput = sanitizedInput.slice(0, options.maxLength)
        }
        return this.escapeHTML(sanitizedInput)
    }
  },

  // Generate a random CSRF token
  generateCSRFToken: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),

  // Validate CSRF token
  validateCSRFToken: (token, storedToken) => token === storedToken,
}

// Export the library for use in other scripts
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = SecurityLibrary
} else {
  window.SecurityLibrary = SecurityLibrary
}

