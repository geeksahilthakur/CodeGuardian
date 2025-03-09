// Constants and Configuration
const SEVERITY = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
}

const VULNERABILITY_RESOURCES = {
  xss: {
    title: "Cross-Site Scripting (XSS)",
    link: "https://owasp.org/www-community/attacks/xss/",
  },
  csrf: {
    title: "Cross-Site Request Forgery (CSRF)",
    link: "https://owasp.org/www-community/attacks/csrf",
  },
  "sql-injection": {
    title: "SQL Injection",
    link: "https://owasp.org/www-community/attacks/SQL_Injection",
  },
  "input-validation": {
    title: "Input Validation",
    link: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html",
  },
  "insecure-direct-object-reference": {
    title: "Insecure Direct Object References",
    link: "https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html",
  },
  "security-misconfiguration": {
    title: "Security Misconfiguration",
    link: "https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration",
  },
  "sensitive-data-exposure": {
    title: "Sensitive Data Exposure",
    link: "https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure",
  },
  "broken-auth": {
    title: "Broken Authentication",
    link: "https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication",
  },
  "eval-usage": {
    title: "Dangerous eval() Usage",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!",
  },
  "innerHTML-risk": {
    title: "innerHTML Security Risks",
    link: "https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations",
  },
}

// Global variables to track changes
let changesMade = []
let fixedLineNumbers = new Set()

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI components
  initThemeToggle()
  initLineNumbers()
  initEditorFunctionality()
  initTabSystem()
  initFileSystem()
  initButtons()
  initModals()

  // Apply syntax highlighting
  if (typeof hljs !== "undefined") {
    hljs.highlightAll()
  }
})

// Theme Toggle
function initThemeToggle() {
  const themeSwitch = document.getElementById("theme-switch")
  // Check for saved theme preference or prefer-color-scheme
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")
  const savedTheme = localStorage.getItem("theme")

  if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add("dark-theme")
    themeSwitch.checked = true
  }

  themeSwitch.addEventListener("change", function () {
    if (this.checked) {
      document.body.classList.add("dark-theme")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-theme")
      localStorage.setItem("theme", "light")
    }
    // Update syntax highlighting theme
    updateSyntaxTheme()
  })
}

function updateSyntaxTheme() {
  const isDark = document.body.classList.contains("dark-theme")
  const currentLink = document.querySelector("link[href*='highlight.js']")

  if (currentLink) {
    const newHref = isDark
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-light.min.css"

    if (currentLink.href !== newHref) {
      const newLink = document.createElement("link")
      newLink.rel = "stylesheet"
      newLink.href = newHref

      newLink.onload = () => {
        currentLink.remove()
        // Reapply highlighting
        if (typeof hljs !== "undefined") {
          document.querySelectorAll("pre code").forEach((el) => {
            hljs.highlightElement(el)
          })
        }
      }

      document.head.appendChild(newLink)
    }
  }
}

// Line Numbers
function initLineNumbers() {
  const codeInput = document.getElementById("code-input")
  const lineNumbers = document.getElementById("line-numbers")
  const lineNumbersBtn = document.getElementById("line-numbers-btn")

  function updateLineNumbers() {
    const lines = codeInput.value.split("\n")
    lineNumbers.innerHTML = Array(lines.length)
      .fill()
      .map((_, i) => `<div>${i + 1}</div>`)
      .join("")
  }

  codeInput.addEventListener("input", updateLineNumbers)
  codeInput.addEventListener("scroll", () => {
    lineNumbers.scrollTop = codeInput.scrollTop
  })

  lineNumbersBtn.addEventListener("click", function () {
    this.classList.toggle("active")
    if (this.classList.contains("active")) {
      lineNumbers.style.display = "block"
      codeInput.style.paddingLeft = "3.5rem"
    } else {
      lineNumbers.style.display = "none"
      codeInput.style.paddingLeft = "0.75rem"
    }
  })

  // Initial line numbers
  updateLineNumbers()
}

// Update line numbers for fixed code
function updateFixedLineNumbers(code) {
  const lineNumbersFixed = document.querySelector(".line-numbers-fixed")
  if (!lineNumbersFixed) return

  const lines = code.split("\n")
  lineNumbersFixed.innerHTML = Array(lines.length)
    .fill()
    .map((_, i) => {
      const lineNum = i + 1
      const className = fixedLineNumbers.has(lineNum) ? "fixed-line-number" : ""
      return `<div class="${className}">${lineNum}</div>`
    })
    .join("")
}

// Editor Functionality
function initEditorFunctionality() {
  const codeInput = document.getElementById("code-input")

  // Tab key handling
  codeInput.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault()

      const start = this.selectionStart
      const end = this.selectionEnd

      // Insert 2 spaces
      this.value = this.value.substring(0, start) + "  " + this.value.substring(end)

      // Put caret at right position
      this.selectionStart = this.selectionEnd = start + 2
    }
  })

  // Format code button
  document.getElementById("format-btn").addEventListener("click", () => {
    const activeFileType = document.querySelector("#file-list li.active").dataset.type
    const currentCode = codeInput.value

    try {
      let formattedCode = currentCode

      // Simple formatting for different languages
      if (activeFileType === "html") {
        formattedCode = formatHTML(currentCode)
      } else if (activeFileType === "css") {
        formattedCode = formatCSS(currentCode)
      } else if (activeFileType === "js") {
        formattedCode = formatJS(currentCode)
      }

      codeInput.value = formattedCode
      // Update line numbers
      document.getElementById("line-numbers").dispatchEvent(new Event("input"))
    } catch (error) {
      console.error("Formatting error:", error)
      showTemporaryMessage("Formatting failed: " + error.message)
    }
  })
}

// Tab System
function initTabSystem() {
  const tabButtons = document.querySelectorAll(".tab-btn")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.dataset.tab

      // Remove active class from all tabs and buttons
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active")
      })
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active")
      })

      // Add active class to current tab and button
      this.classList.add("active")
      document.getElementById(tabId).classList.add("active")
    })
  })
}

// File System
function initFileSystem() {
  const fileList = document.querySelectorAll("#file-list li")
  const codeInput = document.getElementById("code-input")
  const editorTitle = document.getElementById("editor-title")

  // Store code for each file type
  const codeStore = {
    html: "",
    css: "",
    js: "",
  }

  fileList.forEach((file) => {
    file.addEventListener("click", function () {
      const fileType = this.dataset.type

      // Save current code before switching
      const currentActive = document.querySelector("#file-list li.active")
      if (currentActive) {
        codeStore[currentActive.dataset.type] = codeInput.value
      }

      // Update active file
      document.querySelectorAll("#file-list li").forEach((f) => {
        f.classList.remove("active")
      })
      this.classList.add("active")

      // Load code for selected file
      codeInput.value = codeStore[fileType]
      editorTitle.textContent = fileType.toUpperCase() + " Editor"

      // Update line numbers
      document.getElementById("line-numbers").dispatchEvent(new Event("input"))

      // Update language for syntax highlighting in output
      updateOutputSyntaxHighlighting(fileType)
    })
  })
}

function updateOutputSyntaxHighlighting(fileType) {
  const fixedCode = document.getElementById("fixed-code")

  // Remove previous language classes
  fixedCode.className = "hljs"

  // Add new language class
  if (fileType === "html") {
    fixedCode.classList.add("language-html")
  } else if (fileType === "css") {
    fixedCode.classList.add("language-css")
  } else if (fileType === "js") {
    fixedCode.classList.add("language-javascript")
  }
}

// Button Actions
function initButtons() {
  // Analyze button
  document.getElementById("analyze-btn").addEventListener("click", analyzeCode)

  // Upload button
  document.getElementById("upload-btn").addEventListener("click", () => {
    document.getElementById("file-upload").click()
  })

  // File upload handling
  document.getElementById("file-upload").addEventListener("change", handleFileUpload)

  // Download button
  document.getElementById("download-btn").addEventListener("click", downloadFixedCode)

  // Compare button
  document.getElementById("compare-btn").addEventListener("click", compareCode)

  // Copy Fixed Code button
  document.getElementById("copy-fixed-code").addEventListener("click", copyFixedCode)
}

// Modal Initialization
function initModals() {
  // Vulnerability modal
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("vulnerability-modal").style.display = "none"
  })

  // Fix preview modal
  document.getElementById("fix-preview-close-btn").addEventListener("click", () => {
    document.getElementById("fix-preview-modal").style.display = "none"
  })

  document.getElementById("apply-fix-btn").addEventListener("click", applyFixFromModal)

  // Issue search
  document.getElementById("issue-search").addEventListener("input", filterIssues)

  // Severity filter
  document.getElementById("severity-filter").addEventListener("change", filterIssues)
}

// Core Functionality

function analyzeCode() {
  // Reset global tracking variables
  changesMade = []
  fixedLineNumbers = new Set()

  // Get all code from store
  const codeStore = {
    html: getCodeForType("html"),
    css: getCodeForType("css"),
    js: getCodeForType("js"),
  }

  // Reset counters
  resetCounters()

  // Analyze each type of code
  const htmlResult = validateAndCorrectHTML(codeStore.html)
  const cssResult = validateAndCorrectCSS(codeStore.css)
  const jsResult = validateAndCorrectJS(codeStore.js)

  // Cross-check between different code types
  const htmlJsCrossIssues = crossCheckHTMLAndJS(codeStore.html, codeStore.js)
  const htmlCssCrossIssues = crossCheckHTMLAndCSS(codeStore.html, codeStore.css)

  // Combine all issues
  const allIssues = [
    ...htmlResult.issues.map((issue) => ({ ...issue, codeType: "HTML" })),
    ...cssResult.issues.map((issue) => ({ ...issue, codeType: "CSS" })),
    ...jsResult.issues.map((issue) => ({ ...issue, codeType: "JavaScript" })),
    ...htmlJsCrossIssues.map((issue) => ({ ...issue, codeType: "HTML/JS" })),
    ...htmlCssCrossIssues.map((issue) => ({ ...issue, codeType: "HTML/CSS" })),
  ]

  // Update the UI with issues and corrected code
  updateIssuesUI(allIssues)
  storeFixedCode("html", htmlResult.correctedCode)
  storeFixedCode("css", cssResult.correctedCode)
  storeFixedCode("js", jsResult.correctedCode)

  // Update changes log
  updateChangesLog()

  // Update counters in UI
  updateStatistics(allIssues)

  // Switch to output panel
  document.getElementById("editor-panel").classList.remove("active")
  document.getElementById("output-panel").classList.add("active")

  // Set active tab to issues
  document.querySelector('.tab-btn[data-tab="issues-tab"]').click()
}

function getCodeForType(type) {
  // Check if we're currently editing this type
  const currentActive = document.querySelector("#file-list li.active")
  if (currentActive && currentActive.dataset.type === type) {
    return document.getElementById("code-input").value
  }

  // Get from our code store
  const fileList = document.querySelectorAll("#file-list li")
  let code = ""

  fileList.forEach((file) => {
    if (file.dataset.type === type) {
      const index = Array.from(fileList).indexOf(file)
      const storedCode = localStorage.getItem(`code_${type}`) || ""
      code = storedCode || ""
    }
  })

  return code
}

function storeFixedCode(type, code) {
  localStorage.setItem(`fixed_code_${type}`, code)

  // If this is the active type, update the fixed code tab
  const currentActive = document.querySelector("#file-list li.active")
  if (currentActive && currentActive.dataset.type === type) {
    const fixedCode = document.getElementById("fixed-code")
    fixedCode.textContent = code

    // Update line numbers for fixed code
    updateFixedLineNumbers(code)

    // Apply syntax highlighting
    if (typeof hljs !== "undefined") {
      hljs.highlightElement(fixedCode)
    }

    // Add highlighting for fixed lines
    highlightFixedLines(fixedCode)
  }
}

function highlightFixedLines(codeElement) {
  // Get all lines in the code element
  const codeLines = codeElement.innerHTML.split("\n")

  // Apply highlighting to fixed lines
  const highlightedLines = codeLines.map((line, index) => {
    if (fixedLineNumbers.has(index + 1)) {
      return `<div class="fixed-line">${line}</div>`
    }
    return `<div>${line}</div>`
  })

  // Replace the content
  codeElement.innerHTML = highlightedLines.join("\n")
}

function getFixedCode(type) {
  return localStorage.getItem(`fixed_code_${type}`) || ""
}

function resetCounters() {
  document.getElementById("critical-count").textContent = "0"
  document.getElementById("warning-count").textContent = "0"
  document.getElementById("info-count").textContent = "0"
  document.getElementById("total-count").textContent = "0"
  document.getElementById("fixed-count").textContent = "0"
}

function updateStatistics(issues) {
  const criticalCount = issues.filter((issue) => issue.severity === SEVERITY.CRITICAL).length
  const warningCount = issues.filter((issue) => issue.severity === SEVERITY.WARNING).length
  const infoCount = issues.filter((issue) => issue.severity === SEVERITY.INFO).length

  document.getElementById("critical-count").textContent = criticalCount
  document.getElementById("warning-count").textContent = warningCount
  document.getElementById("info-count").textContent = infoCount
  document.getElementById("total-count").textContent = issues.length
  document.getElementById("fixed-count").textContent = changesMade.length
}

// Code Analysis Functions

function validateAndCorrectHTML(htmlCode) {
  if (!htmlCode.trim()) {
    return { issues: [], correctedCode: htmlCode }
  }

  const issues = []
  let correctedCode = htmlCode

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, "text/html")

    // Check for parsing errors
    const parserErrors = doc.querySelectorAll("parsererror")
    if (parserErrors.length > 0) {
      issues.push({
        message: "HTML parsing error detected",
        line: findErrorLine(htmlCode, parserErrors[0].textContent),
        severity: SEVERITY.CRITICAL,
        impact: "Malformed HTML may lead to rendering issues and security vulnerabilities",
        category: "syntax-error",
      })
    }

    // Check for missing DOCTYPE
    if (!htmlCode.trim().toLowerCase().startsWith("<!doctype html>")) {
      const originalCode = correctedCode
      correctedCode = "<!DOCTYPE html>\n" + correctedCode

      issues.push({
        message: "Missing DOCTYPE declaration",
        line: 1,
        severity: SEVERITY.INFO,
        impact: "Without DOCTYPE, browsers may render in quirks mode causing inconsistencies",
        category: "best-practice",
        originalCode: "",
        fixedCode: "<!DOCTYPE html>",
        fixed: true,
      })

      // Track the change
      trackChange({
        type: "HTML",
        line: 1,
        description: "Added DOCTYPE declaration",
        originalCode: "",
        fixedCode: "<!DOCTYPE html>",
        reason: "DOCTYPE is required for proper rendering in modern browsers",
      })

      fixedLineNumbers.add(1)
    }

    // Check for forms without CSRF protection
    const forms = doc.querySelectorAll("form")
    forms.forEach((form, index) => {
      const hasCSRFToken = Array.from(form.elements).some(
        (el) => (el.name && el.name.toLowerCase().includes("csrf")) || (el.id && el.id.toLowerCase().includes("csrf")),
      )

      if (!hasCSRFToken && form.method && form.method.toLowerCase() !== "get") {
        const formLine = findElementLine(htmlCode, form.outerHTML)

        issues.push({
          message: `Form #${index + 1} lacks CSRF protection token`,
          line: formLine,
          severity: SEVERITY.CRITICAL,
          impact: "Forms without CSRF tokens are vulnerable to Cross-Site Request Forgery attacks",
          category: "csrf",
          originalCode: form.outerHTML,
          fixed: true,
        })

        // Add hidden input for CSRF token
        const inputs = form.querySelectorAll("input")
        const lastInput = inputs[inputs.length - 1]
        const csrfInput = doc.createElement("input")
        csrfInput.type = "hidden"
        csrfInput.name = "csrf_token"
        csrfInput.value = "{{ csrf_token }}"

        if (lastInput) {
          lastInput.after(csrfInput)
        } else {
          form.prepend(csrfInput)
        }

        // Track the change
        const csrfInputHTML = '<input type="hidden" name="csrf_token" value="{{ csrf_token }}">'
        trackChange({
          type: "HTML",
          line: formLine,
          description: `Added CSRF token to form #${index + 1}`,
          originalCode: form.outerHTML,
          fixedCode: form.outerHTML + csrfInputHTML,
          reason: "CSRF tokens protect against cross-site request forgery attacks",
        })

        fixedLineNumbers.add(formLine)
      }
    })

    // Check for inputs without validation
    const inputs = doc.querySelectorAll("input")
    inputs.forEach((input) => {
      if (input.type === "text" || input.type === "email" || input.type === "url") {
        // Check for missing patterns or validations
        if (!input.pattern && !input.getAttribute("required") && !input.getAttribute("minlength")) {
          const inputLine = findElementLine(htmlCode, input.outerHTML)
          const originalInput = input.outerHTML

          issues.push({
            message: `Input "${input.name || input.id || "unnamed"}" lacks validation constraints`,
            line: inputLine,
            severity: SEVERITY.WARNING,
            impact: "Inputs without validation may allow injection of malicious data",
            category: "input-validation",
            originalCode: originalInput,
            fixed: true,
          })

          // Auto-correct by adding appropriate pattern
          if (input.type === "email" && !input.pattern) {
            input.setAttribute("pattern", "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
            trackChange({
              type: "HTML",
              line: inputLine,
              description: `Added email validation pattern to input ${input.name || input.id || "unnamed"}`,
              originalCode: originalInput,
              fixedCode: input.outerHTML,
              reason: "Email inputs should validate the format to prevent invalid data",
            })
          } else if (input.type === "url" && !input.pattern) {
            input.setAttribute("pattern", "https?://.*")
            trackChange({
              type: "HTML",
              line: inputLine,
              description: `Added URL validation pattern to input ${input.name || input.id || "unnamed"}`,
              originalCode: originalInput,
              fixedCode: input.outerHTML,
              reason: "URL inputs should validate the format to prevent invalid data",
            })
          } else if (!input.pattern) {
            input.setAttribute("minlength", "3")
            trackChange({
              type: "HTML",
              line: inputLine,
              description: `Added minlength validation to input ${input.name || input.id || "unnamed"}`,
              originalCode: originalInput,
              fixedCode: input.outerHTML,
              reason: "Text inputs should have minimum length requirements to prevent empty or too short values",
            })
          }

          fixedLineNumbers.add(inputLine)
        }
      }
    })

    // Check for insecure resource loading
    const insecureResources = [
      ...doc.querySelectorAll("script[src^='http:']"),
      ...doc.querySelectorAll("link[href^='http:']"),
      ...doc.querySelectorAll("img[src^='http:']"),
    ]

    insecureResources.forEach((resource) => {
      const resourceLine = findElementLine(htmlCode, resource.outerHTML)
      const originalResource = resource.outerHTML

      issues.push({
        message: `Insecure resource loaded over HTTP: ${resource.src || resource.href}`,
        line: resourceLine,
        severity: SEVERITY.WARNING,
        impact: "Resources loaded over HTTP are vulnerable to man-in-the-middle attacks",
        category: "security-misconfiguration",
        originalCode: originalResource,
        fixed: true,
      })

      // Convert http to https
      if (resource.src) {
        resource.src = resource.src.replace("http://", "https://")
      } else if (resource.href) {
        resource.href = resource.href.replace("http://", "https://")
      }

      trackChange({
        type: "HTML",
        line: resourceLine,
        description: "Converted HTTP resource to HTTPS",
        originalCode: originalResource,
        fixedCode: resource.outerHTML,
        reason: "HTTPS prevents man-in-the-middle attacks and is required for secure websites",
      })

      fixedLineNumbers.add(resourceLine)
    })

    // Check for missing lang attribute on html tag
    const htmlTag = doc.querySelector("html")
    if (!htmlTag.getAttribute("lang")) {
      const htmlLine = findElementLine(htmlCode, "<html")
      const originalHtml = htmlTag.outerHTML

      issues.push({
        message: "Missing lang attribute on <html> element",
        line: htmlLine,
        severity: SEVERITY.INFO,
        impact: "Missing language attribute affects accessibility and screen readers",
        category: "accessibility",
        originalCode: "<html>",
        fixed: true,
      })

      htmlTag.setAttribute("lang", "en")

      trackChange({
        type: "HTML",
        line: htmlLine,
        description: "Added lang attribute to HTML element",
        originalCode: "<html>",
        fixedCode: '<html lang="en">',
        reason: "The lang attribute improves accessibility for screen readers and search engines",
      })

      fixedLineNumbers.add(htmlLine)
    }

    // Regenerate the corrected HTML
    correctedCode = doc.documentElement.outerHTML
  } catch (e) {
    issues.push({
      message: `Error analyzing HTML: ${e.message}`,
      line: 1,
      severity: SEVERITY.CRITICAL,
      impact: "Unable to parse HTML properly, possibly due to severe syntax errors",
      category: "syntax-error",
      fixed: false,
    })
  }

  return { issues, correctedCode }
}

function validateAndCorrectCSS(cssCode) {
  if (!cssCode.trim()) {
    return { issues: [], correctedCode: cssCode }
  }

  const issues = []
  let correctedCode = cssCode

  try {
    // Check for unbalanced braces
    const openBraces = (cssCode.match(/{/g) || []).length
    const closeBraces = (cssCode.match(/}/g) || []).length

    if (openBraces !== closeBraces) {
      const braceLine = findUnbalancedBraceLine(cssCode)

      issues.push({
        message: "Unbalanced braces in CSS",
        line: braceLine,
        severity: SEVERITY.WARNING,
        impact: "Syntax error may cause entire CSS blocks to be ignored",
        category: "syntax-error",
        originalCode: cssCode.substring(Math.max(0, braceLine - 10), braceLine + 10),
        fixed: true,
      })

      // Simple auto-correction: add missing closing braces
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces
        const originalCode = correctedCode
        correctedCode += "\n" + "}".repeat(missing) + " /* Auto-added */"

        trackChange({
          type: "CSS",
          line: braceLine,
          description: `Added ${missing} missing closing brace(s)`,
          originalCode: originalCode.substring(originalCode.length - 20),
          fixedCode: correctedCode.substring(correctedCode.length - 20),
          reason: "CSS requires balanced braces for proper parsing",
        })

        fixedLineNumbers.add(braceLine)
      }
    }

    // Check for potentially unsafe CSS properties
    const unsafeProperties = [
      { regex: /expression\s*\(/g, property: "expression" },
      { regex: /-moz-binding\s*:/g, property: "-moz-binding" },
    ]

    unsafeProperties.forEach(({ regex, property }) => {
      if (regex.test(cssCode)) {
        const line = findLineNumber(cssCode, property)
        const match = findMatchInLine(cssCode, regex, line)
        const originalLine = getLineContent(cssCode, line)

        issues.push({
          message: `Potentially unsafe CSS property: ${property}`,
          line,
          severity: SEVERITY.CRITICAL,
          impact: "This property can be used for CSS-based attacks and may execute code",
          category: "injection",
          originalCode: originalLine,
          fixed: true,
        })

        // Replace unsafe property
        const fixedLine = originalLine.replace(regex, `/* Removed unsafe ${property}: */`)
        correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

        trackChange({
          type: "CSS",
          line,
          description: `Removed unsafe CSS property: ${property}`,
          originalCode: originalLine,
          fixedCode: fixedLine,
          reason: "This property can be exploited for CSS-based attacks",
        })

        fixedLineNumbers.add(line)
      }
    })

    // Check for missing vendor prefixes
    const propertiesNeedingPrefixes = [
      { standard: /\b(transform)\s*:/g, prefix: "-webkit-transform" },
      { standard: /\b(transition)\s*:/g, prefix: "-webkit-transition" },
      { standard: /\b(user-select)\s*:/g, prefix: "-webkit-user-select" },
    ]

    propertiesNeedingPrefixes.forEach(({ standard, prefix }) => {
      const matches = cssCode.match(standard)
      if (matches) {
        const prefixRegex = new RegExp(`\\b(${prefix})\\s*:`, "g")
        if (!prefixRegex.test(cssCode)) {
          const line = findLineNumber(cssCode, matches[0])
          const originalLine = getLineContent(cssCode, line)

          issues.push({
            message: `Missing vendor prefix: ${prefix}`,
            line,
            severity: SEVERITY.INFO,
            impact: "Some browsers may not render the style correctly without vendor prefixes",
            category: "compatibility",
            originalCode: originalLine,
            fixed: true,
          })

          // Add vendor prefix
          const indentation = getIndentation(originalLine)
          const propertyValue = getPropertyValue(cssCode, cssCode.indexOf(matches[0]))
          const prefixLine = `${indentation}${prefix}: ${propertyValue};`

          const lines = correctedCode.split("\n")
          lines.splice(line - 1, 0, prefixLine)
          correctedCode = lines.join("\n")

          trackChange({
            type: "CSS",
            line,
            description: `Added vendor prefix: ${prefix}`,
            originalCode: originalLine,
            fixedCode: prefixLine + "\n" + originalLine,
            reason: "Vendor prefixes ensure compatibility with older browsers",
          })

          fixedLineNumbers.add(line)
        }
      }
    })

    // Check for !important overuse
    const importantMatches = cssCode.match(/!important/g)
    if (importantMatches && importantMatches.length > 3) {
      const line = findLineNumber(cssCode, "!important")

      issues.push({
        message: "Excessive use of !important",
        line,
        severity: SEVERITY.WARNING,
        impact: "Overuse of !important makes CSS harder to maintain and may indicate specificity issues",
        category: "best-practice",
        originalCode: getLineContent(cssCode, line),
        fixed: false,
      })
    }

    // Check for potential z-index issues (very high values)
    const highZIndexRegex = /z-index\s*:\s*([0-9]{4,})/g
    let match
    while ((match = highZIndexRegex.exec(cssCode)) !== null) {
      const line = findLineNumber(cssCode, match[0])
      const originalLine = getLineContent(cssCode, line)

      issues.push({
        message: `Extremely high z-index value: ${match[1]}`,
        line,
        severity: SEVERITY.INFO,
        impact: "Very high z-index values can cause stacking context issues and maintainability problems",
        category: "best-practice",
        originalCode: originalLine,
        fixed: true,
      })

      // Suggest a more reasonable z-index
      const fixedLine = originalLine.replace(match[0], `z-index: 100 /* Reduced from ${match[1]} */`)
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "CSS",
        line,
        description: `Reduced excessive z-index value from ${match[1]} to 100`,
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "Extremely high z-index values can cause maintainability issues",
      })

      fixedLineNumbers.add(line)
    }
  } catch (e) {
    issues.push({
      message: `Error analyzing CSS: ${e.message}`,
      line: 1,
      severity: SEVERITY.CRITICAL,
      impact: "Unable to analyze CSS properly, possibly due to severe syntax errors",
      category: "syntax-error",
      fixed: false,
    })
  }

  return { issues, correctedCode }
}

function validateAndCorrectJS(jsCode) {
  if (!jsCode.trim()) {
    return { issues: [], correctedCode: jsCode }
  }

  const issues = []
  let correctedCode = jsCode

  try {
    // Check for eval() usage
    const evalRegex = /\beval\s*\(/g
    let match
    while ((match = evalRegex.exec(jsCode)) !== null) {
      const line = findLineNumber(jsCode, match[0])
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Dangerous use of eval()",
        line,
        severity: SEVERITY.CRITICAL,
        impact: "eval() executes arbitrary code strings and is a major security risk",
        category: "eval-usage",
        originalCode: originalLine,
        fixed: true,
      })

      // Replace eval with a safer alternative (commented out)
      const fixedLine = originalLine.replace(
        match[0],
        `/* SECURITY RISK - eval was removed: */ (function() { /* ${match[0]} */ })`,
      )
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "JavaScript",
        line,
        description: "Removed dangerous eval() usage",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "eval() is a security risk as it can execute arbitrary code",
      })

      fixedLineNumbers.add(line)
    }

    // Check for innerHTML usage
    const innerHTMLRegex = /\.innerHTML\s*=/g
    while ((match = innerHTMLRegex.exec(jsCode)) !== null) {
      const line = findLineNumber(jsCode, match[0])
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Potentially unsafe assignment to innerHTML",
        line,
        severity: SEVERITY.WARNING,
        impact: "Using innerHTML with unsanitized data can lead to XSS vulnerabilities",
        category: "innerHTML-risk",
        originalCode: originalLine,
        fixed: true,
      })

      // Replace with suggestions
      const fixedLine = originalLine.replace(match[0], `.innerHTML = DOMPurify.sanitize(`)
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "JavaScript",
        line,
        description: "Added sanitization for innerHTML assignment",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "innerHTML can lead to XSS vulnerabilities if used with unsanitized data",
      })

      fixedLineNumbers.add(line)
    }

    // Check for document.write usage
    const docWriteRegex = /document\.write\s*\(/g
    while ((match = docWriteRegex.exec(jsCode)) !== null) {
      const line = findLineNumber(jsCode, match[0])
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Deprecated use of document.write()",
        line,
        severity: SEVERITY.WARNING,
        impact: "document.write is vulnerable to XSS and can cause performance issues",
        category: "xss",
        originalCode: originalLine,
        fixed: true,
      })

      // Suggest an alternative
      const fixedLine = originalLine.replace(
        match[0],
        `/* Unsafe - Use DOM methods instead: */ (function() { const content = `,
      )
      correctedCode = replaceLineInCode(
        correctedCode,
        line,
        fixedLine + `; document.body.insertAdjacentHTML('beforeend', DOMPurify.sanitize(content)); })(`,
      )

      trackChange({
        type: "JavaScript",
        line,
        description: "Replaced document.write() with safer alternative",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "document.write() is deprecated and can lead to XSS vulnerabilities",
      })

      fixedLineNumbers.add(line)
    }

    // Check for usage of new Function() (similar to eval)
    const newFunctionRegex = /new\s+Function\s*\(/g
    while ((match = newFunctionRegex.exec(jsCode)) !== null) {
      const line = findLineNumber(jsCode, match[0])
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Unsafe use of new Function()",
        line,
        severity: SEVERITY.CRITICAL,
        impact: "new Function() is similar to eval() and can execute arbitrary code",
        category: "eval-usage",
        originalCode: originalLine,
        fixed: true,
      })

      // Comment it out
      const fixedLine = originalLine.replace(match[0], `/* SECURITY RISK - was: new Function */(`)
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "JavaScript",
        line,
        description: "Removed unsafe new Function() usage",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "new Function() is a security risk similar to eval()",
      })

      fixedLineNumbers.add(line)
    }

    // Check for localStorage without try/catch
    if (/localStorage\./.test(jsCode) && !/try\s*\{[^}]*localStorage/.test(jsCode)) {
      const line = findLineNumber(jsCode, "localStorage")
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "localStorage used without try/catch block",
        line,
        severity: SEVERITY.INFO,
        impact: "localStorage can throw in private browsing modes or when disabled",
        category: "best-practice",
        originalCode: originalLine,
        fixed: true,
      })

      // Wrap localStorage usage in try/catch
      const fixedLine = `try {\n  ${originalLine}\n} catch (e) {\n  console.error('localStorage is not available:', e);\n}`
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "JavaScript",
        line,
        description: "Added try/catch block for localStorage usage",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "localStorage can throw exceptions in private browsing modes",
      })

      fixedLineNumbers.add(line)
    }

    // Check for potential prototype pollution
    if (/\.__proto__/.test(jsCode) || /Object\.prototype/.test(jsCode)) {
      const line = findLineNumber(jsCode, /\.__proto__|Object\.prototype/)
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Potential prototype pollution vulnerability",
        line,
        severity: SEVERITY.CRITICAL,
        impact: "Modifying object prototypes can lead to prototype pollution attacks",
        category: "injection",
        originalCode: originalLine,
        fixed: false,
      })
    }

    // Check for unsanitized input in SQL queries (basic check)
    const sqlQueryRegex = /\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\+/gi
    while ((match = sqlQueryRegex.exec(jsCode)) !== null) {
      const line = findLineNumber(jsCode, match[0])
      const originalLine = getLineContent(jsCode, line)

      issues.push({
        message: "Potential SQL injection vulnerability",
        line,
        severity: SEVERITY.CRITICAL,
        impact: "Concatenating user input directly into SQL queries can lead to SQL injection attacks",
        category: "sql-injection",
        originalCode: originalLine,
        fixed: true,
      })

      // Suggest using parameterized queries
      const fixedLine = originalLine.replace(match[0], `/* SQL Injection risk: Use parameterized queries instead */`)
      correctedCode = replaceLineInCode(correctedCode, line, fixedLine)

      trackChange({
        type: "JavaScript",
        line,
        description: "Flagged potential SQL injection vulnerability",
        originalCode: originalLine,
        fixedCode: fixedLine,
        reason: "Direct concatenation in SQL queries can lead to SQL injection attacks",
      })

      fixedLineNumbers.add(line)
    }
  } catch (e) {
    issues.push({
      message: `Error analyzing JavaScript: ${e.message}`,
      line: 1,
      severity: SEVERITY.CRITICAL,
      impact: "Unable to analyze JavaScript properly, possibly due to severe syntax errors",
      category: "syntax-error",
      fixed: false,
    })
  }

  return { issues, correctedCode }
}

function crossCheckHTMLAndJS(htmlCode, jsCode) {
  if (!htmlCode.trim() || !jsCode.trim()) {
    return []
  }

  const issues = []

  try {
    // Parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, "text/html")

    // Extract IDs from HTML
    const htmlIds = new Set()
    const elementsWithId = doc.querySelectorAll("[id]")
    elementsWithId.forEach((el) => htmlIds.add(el.id))

    // Look for getElementById calls in JS
    const getByIdRegex = /document\.getElementById$$\s*["']([\w-]+)["']\s*$$/g
    let match
    while ((match = getByIdRegex.exec(jsCode)) !== null) {
      const id = match[1]
      if (!htmlIds.has(id)) {
        const line = findLineNumber(jsCode, match[0])

        issues.push({
          message: `getElementById references non-existent ID: "${id}"`,
          line,
          severity: SEVERITY.WARNING,
          impact: "Accessing non-existent DOM elements can cause null reference errors",
          category: "cross-reference",
          originalCode: getLineContent(jsCode, line),
          fixed: false,
        })
      }
    }

    // Check for querySelector with ID selectors
    const querySelectorRegex = /querySelector$$\s*["']#([\w-]+)["']\s*$$/g
    while ((match = querySelectorRegex.exec(jsCode)) !== null) {
      const id = match[1]
      if (!htmlIds.has(id)) {
        const line = findLineNumber(jsCode, match[0])

        issues.push({
          message: `querySelector references non-existent ID: "${id}"`,
          line,
          severity: SEVERITY.WARNING,
          impact: "Using querySelector with non-existent IDs will return null and may cause errors",
          category: "cross-reference",
          originalCode: getLineContent(jsCode, line),
          fixed: false,
        })
      }
    }

    // Check for event listeners on non-existent elements
    const addEventListenerRegex = /document\.getElementById$$\s*["']([\w-]+)["']\s*$$\.addEventListener/g
    while ((match = addEventListenerRegex.exec(jsCode)) !== null) {
      const id = match[1]
      if (!htmlIds.has(id)) {
        const line = findLineNumber(jsCode, match[0])

        issues.push({
          message: `Event listener attached to non-existent element with ID: "${id}"`,
          line,
          severity: SEVERITY.WARNING,
          impact: "Adding event listeners to null elements will throw exceptions",
          category: "cross-reference",
          originalCode: getLineContent(jsCode, line),
          fixed: false,
        })
      }
    }
  } catch (e) {
    issues.push({
      message: `Error during HTML-JS cross-check: ${e.message}`,
      line: 1,
      severity: SEVERITY.WARNING,
      impact: "Unable to properly verify relationships between HTML and JavaScript",
      category: "cross-reference",
      fixed: false,
    })
  }

  return issues
}

function crossCheckHTMLAndCSS(htmlCode, cssCode) {
  if (!htmlCode.trim() || !cssCode.trim()) {
    return []
  }

  const issues = []

  try {
    // Extract classes from HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlCode, "text/html")

    const htmlClasses = new Set()
    const elementsWithClass = doc.querySelectorAll("[class]")
    elementsWithClass.forEach((el) => {
      el.classList.forEach((className) => {
        htmlClasses.add(className)
      })
    })

    // Extract IDs from HTML
    const htmlIds = new Set()
    const elementsWithId = doc.querySelectorAll("[id]")
    elementsWithId.forEach((el) => htmlIds.add(el.id))

    // Extract class selectors from CSS
    const classSelectors = new Set()
    const classSelectorRegex = /\.([\w-]+)/g
    let match
    while ((match = classSelectorRegex.exec(cssCode)) !== null) {
      // Ignore pseudo-classes like :hover
      if (!match[1].includes(":")) {
        classSelectors.add(match[1])
      }
    }

    // Extract ID selectors from CSS
    const idSelectors = new Set()
    const idSelectorRegex = /#([\w-]+)/g
    while ((match = idSelectorRegex.exec(cssCode)) !== null) {
      idSelectors.add(match[1])
    }

    // Check for CSS classes not used in HTML
    classSelectors.forEach((cssClass) => {
      if (!htmlClasses.has(cssClass)) {
        const selector = `.${cssClass}`
        const line = findLineNumber(cssCode, selector)

        issues.push({
          message: `CSS class not found in HTML: "${cssClass}"`,
          line,
          severity: SEVERITY.INFO,
          impact: "Unused CSS selectors increase file size and may indicate outdated or incorrect styling",
          category: "unused-code",
          originalCode: getLineContent(cssCode, line),
          fixed: false,
        })
      }
    })

    // Check for CSS IDs not used in HTML
    idSelectors.forEach((cssId) => {
      if (!htmlIds.has(cssId)) {
        const selector = `#${cssId}`
        const line = findLineNumber(cssCode, selector)

        issues.push({
          message: `CSS ID selector not found in HTML: "${cssId}"`,
          line,
          severity: SEVERITY.INFO,
          impact: "Unused CSS selectors increase file size and may indicate outdated or incorrect styling",
          category: "unused-code",
          originalCode: getLineContent(cssCode, line),
          fixed: false,
        })
      }
    })
  } catch (e) {
    issues.push({
      message: `Error during HTML-CSS cross-check: ${e.message}`,
      line: 1,
      severity: SEVERITY.WARNING,
      impact: "Unable to properly verify relationships between HTML and CSS",
      category: "cross-reference",
      fixed: false,
    })
  }

  return issues
}

// UI Update Functions

function updateIssuesUI(issues) {
  const issuesContainer = document.getElementById("issues-container")
  issuesContainer.innerHTML = ""

  if (issues.length === 0) {
    issuesContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" style="fill: var(--success-color)">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>No issues were found!</p>
      </div>
    `
    return
  }

  // Sort issues by severity (critical first)
  issues.sort((a, b) => {
    const severityOrder = {
      [SEVERITY.CRITICAL]: 0,
      [SEVERITY.WARNING]: 1,
      [SEVERITY.INFO]: 2,
    }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  issues.forEach((issue, index) => {
    const issueCard = document.createElement("div")
    issueCard.className = `issue-card ${issue.severity}`
    issueCard.dataset.severity = issue.severity
    issueCard.dataset.category = issue.category || ""
    issueCard.dataset.index = index

    issueCard.addEventListener("click", () => showVulnerabilityDetails(issue))

    let fixButton = ""
    if (issue.fixed) {
      fixButton = `<button class="issue-fix-btn">View Fix</button>`
    }

    issueCard.innerHTML = `
      <div class="issue-header">
        <span class="issue-type">${issue.codeType || ""}</span>
        <span class="issue-severity ${issue.severity}">${issue.severity.toUpperCase()}</span>
      </div>
      <div class="issue-message">${issue.message}</div>
      <div class="issue-location">Line: ${issue.line || "unknown"}</div>
      <div class="issue-impact">${issue.impact}</div>
      ${fixButton}
    `

    if (issue.fixed) {
      const fixBtn = issueCard.querySelector(".issue-fix-btn")
      fixBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        showFixPreview(issue)
      })
    }

    issuesContainer.appendChild(issueCard)
  })
}

function showVulnerabilityDetails(issue) {
  const modal = document.getElementById("vulnerability-modal")
  const modalTitle = document.getElementById("modal-title")
  const vulnerabilityDetails = document.getElementById("vulnerability-details")
  const learnMoreLink = document.getElementById("learn-more-link")

  // Set modal content
  modalTitle.textContent = issue.message

  const categoryKey = issue.category || "general"
  const resourceInfo = VULNERABILITY_RESOURCES[categoryKey] || {
    title: "Security Best Practices",
    link: "https://owasp.org/www-project-top-ten/",
  }

  learnMoreLink.href = resourceInfo.link
  learnMoreLink.textContent = `Learn More about ${resourceInfo.title}`

  const fixedStatus = issue.fixed
    ? `<div class="fix-status fixed">✓ Automatically Fixed</div>`
    : `<div class="fix-status not-fixed">⚠️ Manual Fix Required</div>`

  vulnerabilityDetails.innerHTML = `
    <div class="vulnerability-info">
      <h3>Description</h3>
      <p>${issue.impact}</p>
      
      <h3>Security Category</h3>
      <p>${resourceInfo.title}</p>
      
      <h3>Location</h3>
      <p>Code Type: ${issue.codeType || "Unknown"}<br>
      Line Number: ${issue.line || "Unknown"}</p>
      
      <h3>Severity</h3>
      <div class="severity-indicator ${issue.severity}">
        ${issue.severity.toUpperCase()}
      </div>
      
      <h3>Status</h3>
      ${fixedStatus}
      
      <h3>Remediation</h3>
      <p>${getRemediationAdvice(issue)}</p>
    </div>
  `

  // Show modal
  modal.style.display = "block"
}

function showFixPreview(issue) {
  const modal = document.getElementById("fix-preview-modal")
  const previewContent = document.getElementById("fix-preview-content")

  previewContent.innerHTML = ""

  // Create original code display
  const originalCode = issue.originalCode || ""
  const fixedCode = issue.fixedCode || ""

  // Find the differences
  const diff = Diff.diffLines(originalCode, fixedCode)

  // Create the preview content
  diff.forEach((part) => {
    const lines = part.value.split("\n")
    // Remove empty last line that comes from split
    if (lines[lines.length - 1] === "") {
      lines.pop()
    }

    lines.forEach((line) => {
      const lineDiv = document.createElement("div")
      lineDiv.className = "fix-preview-line"

      if (part.added) {
        lineDiv.classList.add("added")
        lineDiv.innerHTML = `
          <div class="fix-preview-line-content">+ ${escapeHTML(line)}</div>
        `
      } else if (part.removed) {
        lineDiv.classList.add("removed")
        lineDiv.innerHTML = `
          <div class="fix-preview-line-content">- ${escapeHTML(line)}</div>
        `
      } else {
        lineDiv.innerHTML = `
          <div class="fix-preview-line-content">${escapeHTML(line)}</div>
        `
      }

      previewContent.appendChild(lineDiv)
    })
  })

  // Store the issue for apply fix button
  document.getElementById("apply-fix-btn").dataset.issueIndex = issue.index

  // Show modal
  modal.style.display = "block"
}

function applyFixFromModal() {
  const issueIndex = document.getElementById("apply-fix-btn").dataset.issueIndex
  const issue = changesMade[issueIndex]

  if (issue) {
    const activeFileType = document.querySelector("#file-list li.active").dataset.type
    let code = getCodeForType(activeFileType)

    // Apply the fix
    code = replaceLineInCode(code, issue.line, issue.fixedCode)

    // Update the code in the editor
    document.getElementById("code-input").value = code

    // Update the fixed code
    storeFixedCode(activeFileType, code)

    // Update line numbers
    document.getElementById("line-numbers").dispatchEvent(new Event("input"))

    // Close the modal
    document.getElementById("fix-preview-modal").style.display = "none"

    // Show a success message
    showTemporaryMessage("Fix applied successfully!")
  } else {
    showTemporaryMessage("Error: Could not apply fix.")
  }
}

function getRemediationAdvice(issue) {
  const category = issue.category || ""

  const remediationAdvice = {
    csrf: "Implement CSRF tokens in all forms that change state. Generate a unique token for each user session and validate it on form submission.",
    injection:
      "Validate and sanitize all user inputs. Use parameterized queries for database operations and encode outputs in the correct context.",
    xss: "Encode user-generated content before displaying it. Avoid using innerHTML with untrusted data. Consider using DOMPurify or similar libraries.",
    "eval-usage":
      "Avoid using eval(), new Function(), or other code execution functions. Find alternative approaches using standard JavaScript features.",
    "innerHTML-risk":
      "Use safer alternatives like textContent for text or the DOM API (createElement, appendChild) for HTML elements.",
    "syntax-error": "Review and fix the syntax error at the indicated line. Use a code linter to help identify issues.",
    "best-practice":
      "Follow established coding standards and best practices. Consider using automated code quality tools.",
    "cross-reference":
      "Ensure IDs and classes are consistent between HTML, CSS, and JavaScript. Implement better error handling for DOM operations.",
    "unused-code": "Remove or refactor unused code to improve performance and maintainability.",
    compatibility: "Test across multiple browsers and add appropriate vendor prefixes or use a tool like Autoprefixer.",
    "security-misconfiguration":
      "Ensure all resources are loaded securely (HTTPS). Review server configuration for security best practices.",
    accessibility:
      "Follow web accessibility guidelines (WCAG) to ensure your site is usable by people with disabilities.",
    "input-validation":
      "Implement strict input validation for all user inputs. Use appropriate HTML5 input types and attributes, and validate on both client and server sides.",
    "sql-injection":
      "Use parameterized queries or prepared statements instead of concatenating user input into SQL queries. Always validate and sanitize user input.",
  }

  return (
    remediationAdvice[category] ||
    "Review the code for security best practices and implement appropriate fixes based on the issue description."
  )
}

function closeModal() {
  document.getElementById("vulnerability-modal").style.display = "none"
}

function filterIssues() {
  const searchTerm = document.getElementById("issue-search").value.toLowerCase()
  const severityFilter = document.getElementById("severity-filter").value
  const issueCards = document.querySelectorAll(".issue-card")

  issueCards.forEach((card) => {
    const issueText = card.textContent.toLowerCase()
    const issueSeverity = card.dataset.severity

    const matchesSearch = searchTerm === "" || issueText.includes(searchTerm)
    const matchesSeverity = severityFilter === "all" || issueSeverity === severityFilter

    if (matchesSearch && matchesSeverity) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

// Track changes made to the code
function trackChange(change) {
  changesMade.push(change)
}

// Update the changes log tab
function updateChangesLog() {
  const changesContainer = document.getElementById("changes-container")
  changesContainer.innerHTML = ""

  if (changesMade.length === 0) {
    changesContainer.innerHTML = `
      <div class="empty-state">
        <p>No changes were made to the code.</p>
      </div>
    `
    return
  }

  changesMade.forEach((change) => {
    const changeItem = document.createElement("div")
    changeItem.className = "change-item"

    changeItem.innerHTML = `
      <div class="change-header">
        <span>${change.type} Change</span>
        <span>Line ${change.line}</span>
      </div>
      <div class="change-description">${change.description}</div>
      <div class="change-code">
        <div>Before: ${escapeHTML(change.originalCode)}</div>
        <div>After: ${escapeHTML(change.fixedCode)}</div>
      </div>
      <div class="change-reason">${change.reason}</div>
    `

    changesContainer.appendChild(changeItem)
  })
}

// File Operations

function handleFileUpload(event) {
  const files = event.target.files
  if (!files.length) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target.result
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        document.querySelector("#file-list li[data-type='html']").click()
        document.getElementById("code-input").value = content
      } else if (fileName.endsWith(".css")) {
        document.querySelector("#file-list li[data-type='css']").click()
        document.getElementById("code-input").value = content
      } else if (fileName.endsWith(".js")) {
        document.querySelector("#file-list li[data-type='js']").click()
        document.getElementById("code-input").value = content
      }

      // Update line numbers
      const event = new Event("input")
      document.getElementById("code-input").dispatchEvent(event)
    }

    reader.readAsText(file)
  }

  // Reset file input
  event.target.value = ""
}

function downloadFixedCode() {
  const activeFileType = document.querySelector("#file-list li.active").dataset.type
  const fixedCode = getFixedCode(activeFileType)

  if (!fixedCode) {
    showTemporaryMessage("No fixed code available to download")
    return
  }

  // Create file extension based on type
  const extensionMap = {
    html: ".html",
    css: ".css",
    js: ".js",
  }

  const fileName = `fixed-code${extensionMap[activeFileType]}`

  // Create blob and download link
  const blob = new Blob([fixedCode], { type: "text/plain" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.style.display = "none"

  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

function compareCode() {
  const activeFileType = document.querySelector("#file-list li.active").dataset.type
  const originalCode = getCodeForType(activeFileType)
  const fixedCode = getFixedCode(activeFileType)

  if (!originalCode || !fixedCode) {
    showTemporaryMessage("Original or fixed code not available for comparison")
    return
  }

  // Generate diff
  const diffContainer = document.getElementById("diff-container")
  diffContainer.innerHTML = ""

  const diffHeader = document.createElement("div")
  diffHeader.className = "diff-header"
  diffHeader.innerHTML = `
    <div>Original Code</div>
    <div>Fixed Code</div>
  `
  diffContainer.appendChild(diffHeader)

  const diffContent = document.createElement("div")
  diffContent.className = "diff-content"

  // Create line-by-line diff
  const originalLines = originalCode.split("\n")
  const fixedLines = fixedCode.split("\n")

  // Use jsdiff to get differences
  if (typeof Diff === "undefined") {
    // Fallback if Diff library is not available
    diffContent.innerHTML = `
      <div class="error-message">
        Diff library not loaded. Please check your internet connection and reload the page.
      </div>
    `
    diffContainer.appendChild(diffContent)
    return
  }

  const diff = Diff.diffLines(originalCode, fixedCode)

  let originalLineNumber = 1
  let fixedLineNumber = 1

  diff.forEach((part) => {
    const value = part.value
    const lines = value.split("\n")
    // Remove last empty line that comes from split
    if (lines[lines.length - 1] === "") {
      lines.pop()
    }

    lines.forEach((line) => {
      const lineDiff = document.createElement("div")
      lineDiff.className = "line-diff"

      if (part.added) {
        lineDiff.classList.add("added")
        lineDiff.innerHTML = `
          <div class="line-number"></div>
          <div class="line-number">${fixedLineNumber++}</div>
          <div class="line-text">+ ${escapeHTML(line)}</div>
        `
      } else if (part.removed) {
        lineDiff.classList.add("removed")
        lineDiff.innerHTML = `
          <div class="line-number">${originalLineNumber++}</div>
          <div class="line-number"></div>
          <div class="line-text">- ${escapeHTML(line)}</div>
        `
      } else {
        lineDiff.innerHTML = `
          <div class="line-number">${originalLineNumber++}</div>
          <div class="line-number">${fixedLineNumber++}</div>
          <div class="line-text">${escapeHTML(line)}</div>
        `
      }

      diffContent.appendChild(lineDiff)
    })
  })

  diffContainer.appendChild(diffContent)

  // Switch to diff tab
  document.querySelector('.tab-btn[data-tab="diff-tab"]').click()
}

function copyFixedCode() {
  const activeFileType = document.querySelector("#file-list li.active").dataset.type
  const fixedCode = getFixedCode(activeFileType)

  if (!fixedCode) {
    showTemporaryMessage("No fixed code available to copy")
    return
  }

  navigator.clipboard.writeText(fixedCode).then(
    () => {
      showTemporaryMessage("Fixed code copied to clipboard!")
    },
    (err) => {
      console.error("Could not copy text: ", err)
      showTemporaryMessage("Failed to copy fixed code. Please try again.")
    },
  )
}

// Helper Functions

function showTemporaryMessage(message, duration = 3000) {
  // Create message element
  const messageEl = document.createElement("div")
  messageEl.className = "temporary-message"
  messageEl.textContent = message
  messageEl.style.position = "fixed"
  messageEl.style.bottom = "20px"
  messageEl.style.left = "50%"
  messageEl.style.transform = "translateX(-50%)"
  messageEl.style.padding = "10px 20px"
  messageEl.style.backgroundColor = "var(--bg-secondary)"
  messageEl.style.color = "var(--text-color)"
  messageEl.style.borderRadius = "4px"
  messageEl.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)"
  messageEl.style.zIndex = "9999"

  document.body.appendChild(messageEl)

  // Remove after duration
  setTimeout(() => {
    messageEl.style.opacity = "0"
    messageEl.style.transition = "opacity 0.5s"
    setTimeout(() => {
      document.body.removeChild(messageEl)
    }, 500)
  }, duration)
}

function findLineNumber(code, pattern) {
  if (!code || (typeof pattern !== "string" && !(pattern instanceof RegExp))) {
    return 1
  }

  const lines = code.split("\n")
  const regex = pattern instanceof RegExp ? pattern : new RegExp(escapeRegExp(pattern))

  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      return i + 1
    }
  }

  return 1
}

function findElementLine(html, elementHtml) {
  const escapedHtml = escapeRegExp(elementHtml.substring(0, Math.min(elementHtml.length, 100)))
  return findLineNumber(html, new RegExp(escapedHtml.replace(/\s+/g, "\\s+")))
}

function findErrorLine(html, errorMessage) {
  // For parser errors, try to extract line information
  const lineMatch = errorMessage.match(/line\s+(\d+)/i)
  if (lineMatch && lineMatch[1]) {
    return Number.parseInt(lineMatch[1])
  }

  return 1
}

function findUnbalancedBraceLine(cssCode) {
  const lines = cssCode.split("\n")
  let openCount = 0
  let closeCount = 0

  for (let i = 0; i < lines.length; i++) {
    openCount += (lines[i].match(/{/g) || []).length
    closeCount += (lines[i].match(/}/g) || []).length

    if (openCount !== closeCount && i === lines.length - 1) {
      return i + 1
    }
  }

  return 1
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function escapeHTML(str) {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function getIndentation(line) {
  const match = line.match(/^(\s*)/)
  return match ? match[1] : ""
}

function getPropertyValue(code, offset) {
  const colonPos = code.indexOf(":", offset)
  const semiColonPos = code.indexOf(";", colonPos)
  const valueEnd = semiColonPos > -1 ? semiColonPos : code.length
  return code.substring(colonPos + 1, valueEnd).trim()
}

function getLineContent(code, lineNumber) {
  const lines = code.split("\n")
  return lineNumber > 0 && lineNumber <= lines.length ? lines[lineNumber - 1] : ""
}

function replaceLineInCode(code, lineNumber, newLine) {
  const lines = code.split("\n")
  if (lineNumber > 0 && lineNumber <= lines.length) {
    lines[lineNumber - 1] = newLine
  }
  return lines.join("\n")
}

function findMatchInLine(code, regex, lineNumber) {
  const line = getLineContent(code, lineNumber)
  const match = line.match(regex)
  return match ? match[0] : null
}

// Code Formatting Functions

function formatHTML(html) {
  let formattedHtml = ""
  let indentLevel = 0
  const indentSize = 2
  const lines = html.split(/\n+/)

  lines.forEach((line) => {
    // Remove leading/trailing whitespace
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Check for closing tags to decrease indent
    const isClosingTag = /^<\//.test(trimmedLine)
    if (isClosingTag && indentLevel > 0) {
      indentLevel--
    }

    // Add the line with correct indentation
    const spaces = " ".repeat(indentLevel * indentSize)
    formattedHtml += spaces + trimmedLine + "\n"

    // Check for opening tags to increase indent
    const isOpeningTag = /<[^/>]+>/.test(trimmedLine) && !/<\/.+>/.test(trimmedLine)
    // Don't indent for self-closing tags or specific tags
    const isSelfClosingTag =
      /<.+\/>/.test(trimmedLine) || /<(meta|link|img|br|hr|input|source|track|wbr)/.test(trimmedLine)

    if (isOpeningTag && !isSelfClosingTag) {
      indentLevel++
    }
  })

  return formattedHtml.trim()
}

function formatCSS(css) {
  let formattedCSS = ""
  let indentLevel = 0
  const indentSize = 2

  // Remove all whitespace between selectors, properties, and values
  css = css.replace(/\s*{\s*/g, " {\n")
  css = css.replace(/;\s*/g, ";\n")
  css = css.replace(/\s*}\s*/g, "\n}\n")

  const lines = css.split("\n")

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Closing brace - decrease indent
    if (trimmedLine === "}") {
      indentLevel--
    }

    // Add proper indentation
    const spaces = " ".repeat(indentLevel * indentSize)
    formattedCSS += spaces + trimmedLine + "\n"

    // Opening brace - increase indent
    if (trimmedLine.endsWith("{")) {
      indentLevel++
    }
  })

  return formattedCSS.trim()
}

function formatJS(js) {
  // A very simple JS formatter - for a real app, you would use a proper library
  let formattedJS = ""
  let indentLevel = 0
  const indentSize = 2

  // Basic formatting for blocks
  js = js.replace(/{\s*/g, " {\n")
  js = js.replace(/\s*}/g, "\n}")
  js = js.replace(/;\s*/g, ";\n")
  js = js.replace(/\/\*\s*/g, "/* ")
  js = js.replace(/\s*\*\//g, " */")

  const lines = js.split("\n")

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Adjust indent based on braces
    if (trimmedLine === "}" && indentLevel > 0) {
      indentLevel--
    }

    // Add proper indentation
    const spaces = " ".repeat(indentLevel * indentSize)
    formattedJS += spaces + trimmedLine + "\n"

    // Increase indent after opening brace
    if (trimmedLine.endsWith("{")) {
      indentLevel++
    }
  })

  return formattedJS.trim()
}

// Initialize global variables for libraries that might be loaded asynchronously
var hljs = window.hljs || undefined
var Diff = window.Diff || undefined

