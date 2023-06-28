// Step 1: PDF Upload
const pdfFileInput = document.getElementById('pdf-file-input');
const pdfPasswordAlert = document.getElementById('pdf-password-alert');
const wordlistFileInput = document.getElementById('wordlist-file-input');
const wordlistAlert = document.getElementById('wordlist-alert');
const crackBtn = document.getElementById('crack-btn');
const crackAlert = document.getElementById('crack-alert');
const passwordDisplay = document.getElementById('password');

let pdfFile = null;
let wordlist = '';

pdfFileInput.addEventListener('change', function() {
  pdfFile = this.files[0];
  if (pdfFile) {
    // Check if PDF is password protected
    const reader = new FileReader();
    reader.onload = function(e) {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = PDFJS.getDocument(typedArray);
      pdf.promise.then(function(pdf) {
        pdf.getMetadata().then(function(metaData) {
          if (metaData && metaData.isEncrypted) {
            showWordlistUploadSection();
            showPdfPasswordAlert('Password protected PDF file is uploaded. Please upload the wordlist.');
          } else {
            showPdfPasswordAlert('The PDF file does not have a password.');
          }
        });
      });
    };
    reader.readAsArrayBuffer(pdfFile);
  }
});

// Step 2: Wordlist Upload
wordlistFileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    // Process the wordlist file
    const reader = new FileReader();
    reader.onload = function(e) {
      wordlist = e.target.result;
    };
    reader.readAsText(file);
  }
});

// Step 3: Password Crack
crackBtn.addEventListener('click', function() {
  if (!pdfFile) {
    showCrackAlert('Please upload a PDF file.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const typedArray = new Uint8Array(e.target.result);
    const pdf = PDFJS.getDocument(typedArray);
    pdf.promise.then(function(pdf) {
      const numPages = pdf.numPages;
      const passwordFound = bruteForceCrackPassword(pdf, numPages);
      if (passwordFound) {
        showPasswordDisplaySection(passwordFound);
      } else {
        showCrackAlert('Password not found in the wordlist. Please try another wordlist.');
      }
    });
  };
  reader.readAsArrayBuffer(pdfFile);
});

// Utility function to show the Wordlist Upload section
function showWordlistUploadSection() {
  const pdfUploadSection = document.getElementById('pdf-upload-section');
  const wordlistUploadSection = document.getElementById('wordlist-upload-section');

  pdfUploadSection.style.display = 'none';
  wordlistUploadSection.style.display = 'block';
}

// Utility function to show the Password Display section
function showPasswordDisplaySection(password) {
  const crackPasswordSection = document.getElementById('crack-password-section');
  const passwordDisplaySection = document.getElementById('password-display-section');

  crackPasswordSection.style.display = 'none';
  passwordDisplaySection.style.display = 'block';
  passwordDisplay.innerText = password;
}

// Utility function to show the PDF Password alert
function showPdfPasswordAlert(message) {
  pdfPasswordAlert.innerText = message;
  pdfPasswordAlert.style.display = 'block';
}

// Utility function to show the Crack Password alert
function showCrackAlert(message) {
  crackAlert.innerText = message;
  crackAlert.style.display = 'block';
}

// Utility function to perform brute force password cracking
function bruteForceCrackPassword(pdf, numPages) {
  const wordlistLines = wordlist.split('\n');
  for (let i = 0; i < wordlistLines.length; i++) {
    const password = wordlistLines[i].trim();
    for (let j = 1; j <= numPages; j++) {
      const pagePromise = pdf.getPage(j);
      pagePromise.then(function(page) {
        return page.getTextContent();
      }).then(function(textContent) {
        const text = textContent.items.map(item => item.str).join('');
        if (text.includes(password)) {
          return password;
        }
      });
    }
  }
  return null;
}
