/**
 * Recipe Form Dynamic Functionality
 * Handles adding/removing ingredients, steps, images, and form validation
 */

// Global variables (set by server in EJS template)
let ingredientCount = window.recipeFormData?.ingredientCount || 1;
let stepCount = window.recipeFormData?.stepCount || 1;
let imageCount = window.recipeFormData?.imageCount || 1;
const measurementUnits = window.recipeFormData?.measurementUnits || ['gram', 'litre', 'dl', 'ts', 'ss', 'small', 'medium', 'large'];

// Validation helper function
function isValidImagePath(url) {
  if (!url || typeof url !== 'string') return false;

  // Allow local paths starting with /
  if (url.startsWith('/')) return true;

  // Allow external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) return true;

  return false;
}

// Generate unit options HTML
function generateUnitOptions() {
  let options = '<option value="">-- Select Unit --</option>';
  measurementUnits.forEach((unit) => {
    options += `<option value="${unit}">${unit}</option>`;
  });
  return options;
}

function updateStepNumbers() {
  const stepRows = document.querySelectorAll('.step-row');
  stepRows.forEach((row, index) => {
    const label = row.querySelector('label');
    if (label) {
      label.textContent = `Step ${index + 1}`;
    }
  });
}

function updateImageNumbers() {
  const imageRows = document.querySelectorAll('.image-row');
  imageRows.forEach((row, index) => {
    const urlInput = row.querySelector('input[name^="image_url_"]');
    const descInput = row.querySelector('input[name^="image_desc_"]');
    if (urlInput) {
      urlInput.name = `image_url_${index + 1}`;
    }
    if (descInput) {
      descInput.name = `image_desc_${index + 1}`;
    }
  });
}

function saveDirectly() {
  const form = document.getElementById('recipeForm');
  form.action = '/admin/recipes/save';

  // Use requestSubmit() instead of submit() to trigger HTML5 validation
  // This shows native browser validation messages (hover text)
  if (form.requestSubmit) {
    form.requestSubmit();
  } else {
    // Fallback for older browsers
    form.submit();
  }
}

function addIngredient() {
  ingredientCount += 1;
  const container = document.getElementById('ingredientsContainer');
  const newRow = document.createElement('div');
  newRow.className = 'ingredient-row mb-3';
  newRow.innerHTML = `
    <div class="card">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-2">
            <label class="form-label small">Amount *</label>
            <input 
              type="number" 
              class="form-control form-control-sm" 
              name="ingredient_amount_${ingredientCount}" 
              placeholder="2"
              min="0.01"
              step="0.01"
              required
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small">Unit *</label>
            <select class="form-select form-select-sm" name="ingredient_unit_${ingredientCount}" required>
              ${generateUnitOptions()}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small">Ingredient * <small class="text-muted">(max 30 chars)</small></label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              name="ingredient_name_${ingredientCount}" 
              placeholder="flour"
              maxlength="30"
              required
            >
          </div>
          <div class="col-md-3">
            <label class="form-label small">Note (optional) <small class="text-muted">(max 100 chars)</small></label>
            <input 
              type="text" 
              class="form-control form-control-sm" 
              name="ingredient_note_${ingredientCount}" 
              placeholder="room temperature"
              maxlength="100"
            >
          </div>
          <div class="col-md-1">
            <label class="form-label small">&nbsp;</label>
            <button type="button" class="btn btn-outline-danger btn-sm remove-ingredient d-block">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(newRow);
}

function addStep() {
  stepCount += 1;
  const container = document.getElementById('stepsContainer');
  const newRow = document.createElement('div');
  newRow.className = 'step-row mb-3';
  newRow.innerHTML = `
    <label class="form-label">Step ${stepCount}</label>
    <div class="input-group mb-2">
      <textarea 
        class="form-control" 
        name="step_${stepCount}" 
        rows="2"
        maxlength="500"
        placeholder="Describe this cooking step... (max 500 characters)"
        required
      ></textarea>
      <button type="button" class="btn btn-outline-danger remove-step">
        🗑️
      </button>
    </div>
    <!-- Note field for step -->
    <div class="ms-4">
      <div class="form-check mb-2">
        <input class="form-check-input step-note-toggle" type="checkbox" id="noteToggle_${stepCount}">
        <label class="form-check-label" for="noteToggle_${stepCount}">
          💡 Add special note for this step
        </label>
      </div>
      <div class="step-note-field" style="display: none">
        <textarea 
          class="form-control form-control-sm" 
          name="step_note_${stepCount}" 
          rows="2"
          maxlength="100"
          placeholder="Add a special note or tip for this step... (max 100 characters)"
        ></textarea>
      </div>
    </div>
  `;
  container.appendChild(newRow);
}

function addImage() {
  imageCount += 1;
  const container = document.getElementById('imagesContainer');
  const newRow = document.createElement('div');
  newRow.className = 'image-row mb-3 p-3 border rounded';
  newRow.innerHTML = `
    <div class="row g-2">
      <div class="col-md-5">
        <label class="form-label small">Image URL/Path <small class="text-muted">(max 100 chars)</small></label>
        <input 
          type="text" 
          class="form-control" 
          name="image_url_${imageCount}" 
          maxlength="100"
          placeholder="beef.jpg or https://..."
          list="image-suggestions"
        >
        <small class="text-muted">Type to search recipe images, or paste external URL</small>
      </div>
      <div class="col-md-5">
        <label class="form-label small">Description * <small class="text-muted">(max 20 chars)</small></label>
        <input 
          type="text" 
          class="form-control" 
          name="image_desc_${imageCount}" 
          maxlength="20"
          placeholder="Image description"
          required
        >
      </div>
      <div class="col-md-2 d-flex align-items-end pb-0">
        <button type="button" class="btn btn-outline-danger btn-sm w-100 remove-image mb-0">
          🗑️ Remove
        </button>
      </div>
    </div>
  `;
  container.appendChild(newRow);
}

function handleRemoveButtons(e) {
  if (e.target.classList.contains('remove-ingredient')) {
    e.target.closest('.ingredient-row').remove();
  }
  if (e.target.classList.contains('remove-step')) {
    e.target.closest('.step-row').remove();
    updateStepNumbers();
  }
  if (e.target.classList.contains('remove-image')) {
    e.target.closest('.image-row').remove();
    updateImageNumbers();
  }
}

function handleNoteToggle(e) {
  if (e.target.classList.contains('step-note-toggle')) {
    const noteField = e.target.closest('.ms-4').querySelector('.step-note-field');
    if (e.target.checked) {
      noteField.style.display = 'block';
    } else {
      noteField.style.display = 'none';
      // Clear note text when hiding
      const textarea = noteField.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
      }
    }
  }
}

// Wait for DOM to be ready - moved to end to avoid "use before define" errors
document.addEventListener('DOMContentLoaded', () => {
  // Add Ingredient Button
  const addIngredientBtn = document.getElementById('addIngredient');
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', addIngredient);
  }

  // Add Step Button
  const addStepBtn = document.getElementById('addStep');
  if (addStepBtn) {
    addStepBtn.addEventListener('click', addStep);
  }

  // Add Image Button
  const addImageBtn = document.getElementById('addImage');
  if (addImageBtn) {
    addImageBtn.addEventListener('click', addImage);
  }

  // Remove buttons (event delegation)
  document.addEventListener('click', handleRemoveButtons);

  // Note toggle functionality (event delegation)
  document.addEventListener('change', handleNoteToggle);

  // Add was-validated class on invalid submit to show red/green borders
  const recipeForm = document.getElementById('recipeForm');
  if (recipeForm) {
    recipeForm.addEventListener('submit', (e) => {
      if (!recipeForm.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      recipeForm.classList.add('was-validated');
    }, false);
  }

  // Add live image preview functionality
  document.addEventListener('input', (e) => {
    if (e.target.name && e.target.name.startsWith('image_url_')) {
      const imageRow = e.target.closest('.image-row');
      if (imageRow) {
        const imageUrl = e.target.value.trim();
        let preview = imageRow.querySelector('.image-preview');

        // Remove existing preview if URL is empty
        if (!imageUrl) {
          if (preview) {
            preview.remove();
          }
          return;
        }

        // Validate image path
        const isValid = isValidImagePath(imageUrl);

        // Create preview if it doesn't exist
        if (!preview) {
          preview = document.createElement('div');
          preview.className = 'image-preview mt-2';
          imageRow.appendChild(preview);
        }

        // Show validation warning if path format is invalid
        if (!isValid) {
          preview.innerHTML = `
            <div class="text-warning small mt-1">
              ⚠️ Path should start with / (local) or http:// (external)
            </div>
          `;
          return;
        }

        // Update preview content
        preview.innerHTML = `
          <small class="text-muted">Preview:</small><br>
          <img src="${imageUrl}"
               alt="Recipe image preview"
               class="img-thumbnail mt-1"
               style="max-width: 200px; max-height: 150px;"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div class="text-danger small mt-1" style="display: none;">
            ⚠️ Image not found or invalid path
          </div>
        `;
      }
    }
  });

  // Make saveDirectly function globally available
  window.saveDirectly = saveDirectly;
});

// ===== IMAGE AUTOCOMPLETE FUNCTIONALITY =====

let autocompleteTimeout = null;
let currentAutocompleteInput = null;
let selectedAutocompleteIndex = -1;

// Debounce helper
function debounce(func, wait) {
  return (...args) => {
    clearTimeout(autocompleteTimeout);
    autocompleteTimeout = setTimeout(() => func(...args), wait);
  };
}

// Search images via API
async function searchImages(query) {
  try {
    const response = await fetch(`/api/images/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching images:', error);
    return [];
  }
}

// Hide autocomplete dropdown
function hideAutocomplete() {
  const dropdown = document.getElementById('image-autocomplete-dropdown');
  if (dropdown) {
    dropdown.remove();
  }
  currentAutocompleteInput = null;
}

// Select an autocomplete item
function selectAutocompleteItem(input, path) {
  const inputField = input;
  inputField.value = path;
  inputField.dispatchEvent(new Event('input', { bubbles: true }));
  hideAutocomplete();
}

// Create and show autocomplete dropdown
function showAutocomplete(input, results) {
  // Remove existing dropdown
  hideAutocomplete();

  if (results.length === 0) return;

  // Reset selection index
  selectedAutocompleteIndex = -1;

  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'list-group position-absolute shadow-sm';
  dropdown.id = 'image-autocomplete-dropdown';
  dropdown.style.cssText = 'z-index: 1050; max-height: 400px; overflow-y: auto; width: 100%;';

  // Add results
  results.forEach((result, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'list-group-item list-group-item-action d-flex align-items-center';
    item.style.cssText = 'cursor: pointer;';
    item.dataset.index = index;
    item.dataset.path = result.path;

    // Add thumbnail
    const img = document.createElement('img');
    img.src = result.path;
    img.alt = result.filename;
    img.className = 'rounded me-3';
    img.style.cssText = 'width: 60px; height: 60px; object-fit: cover;';
    img.onerror = () => {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
    };

    // Add filename
    const textDiv = document.createElement('div');
    textDiv.className = 'd-flex flex-column';

    const filename = document.createElement('strong');
    filename.textContent = result.filename;
    filename.className = 'text-truncate';

    const pathText = document.createElement('small');
    pathText.textContent = result.path;
    pathText.className = 'text-muted text-truncate';

    textDiv.appendChild(filename);
    textDiv.appendChild(pathText);

    item.appendChild(img);
    item.appendChild(textDiv);

    // Handle selection
    item.addEventListener('click', () => {
      selectAutocompleteItem(input, result.path);
    });

    dropdown.appendChild(item);
  });

  // Position dropdown below input
  const inputParent = input.parentElement;
  inputParent.style.position = 'relative';
  inputParent.appendChild(dropdown);

  currentAutocompleteInput = input;
}

// Highlight selected item in dropdown
function highlightAutocompleteItem(index) {
  const dropdown = document.getElementById('image-autocomplete-dropdown');
  if (!dropdown) return;

  const items = dropdown.querySelectorAll('.list-group-item');

  // Remove previous highlight
  items.forEach((item) => {
    item.classList.remove('active');
  });

  // Add highlight to selected item
  if (index >= 0 && index < items.length) {
    items[index].classList.add('active');
    items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Handle image URL input with autocomplete
const debouncedSearch = debounce(async (input, value) => {
  // Don't search for external URLs (starting with http)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    hideAutocomplete();
    return;
  }

  // Extract search query (remove /content/recipes/ prefix if present)
  let query = value;
  if (query.startsWith('/content/recipes/')) {
    query = query.replace('/content/recipes/', '');
  } else if (query.startsWith('/')) {
    // Remove leading slash
    query = query.substring(1);
  }

  // Search with query
  const results = await searchImages(query);
  showAutocomplete(input, results);
}, 300);

// Attach autocomplete to image URL inputs
document.addEventListener('input', (e) => {
  if (e.target.name && e.target.name.startsWith('image_url_')) {
    const value = e.target.value.trim();
    debouncedSearch(e.target, value);
  }
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (currentAutocompleteInput && !e.target.closest('.position-relative')) {
    hideAutocomplete();
  }
});

// Handle keyboard navigation for autocomplete
document.addEventListener('keydown', (e) => {
  const dropdown = document.getElementById('image-autocomplete-dropdown');

  // Only handle if dropdown is open
  if (!dropdown || !currentAutocompleteInput) {
    return;
  }

  const items = dropdown.querySelectorAll('.list-group-item');
  const totalItems = items.length;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, totalItems - 1);
      highlightAutocompleteItem(selectedAutocompleteIndex);
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, 0);
      highlightAutocompleteItem(selectedAutocompleteIndex);
      break;

    case 'Enter':
      if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < totalItems) {
        e.preventDefault();
        const selectedPath = items[selectedAutocompleteIndex].dataset.path;
        selectAutocompleteItem(currentAutocompleteInput, selectedPath);
      }
      break;

    case 'Escape':
      e.preventDefault();
      hideAutocomplete();
      break;

    default:
      // Reset selection on other keys
      selectedAutocompleteIndex = -1;
  }
});

// ===== IMAGE UPLOAD FUNCTIONALITY =====

let selectedFile = null;

// Reset upload modal state
function resetUploadModal() {
  selectedFile = null;
  const uploadIcon = document.getElementById('uploadIcon');
  const uploadPreview = document.getElementById('uploadPreview');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadSuccess = document.getElementById('uploadSuccess');
  const uploadError = document.getElementById('uploadError');
  const uploadButton = document.getElementById('uploadButton');
  const uploadProgressBar = document.getElementById('uploadProgressBar');

  if (uploadIcon) uploadIcon.style.display = 'block';
  if (uploadPreview) uploadPreview.style.display = 'none';
  if (uploadProgress) uploadProgress.style.display = 'none';
  if (uploadSuccess) uploadSuccess.style.display = 'none';
  if (uploadError) uploadError.style.display = 'none';
  if (uploadButton) uploadButton.disabled = true;
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
}

// Show upload error
function showUploadError(message) {
  const uploadError = document.getElementById('uploadError');
  const uploadErrorMessage = document.getElementById('uploadErrorMessage');

  if (uploadErrorMessage) uploadErrorMessage.textContent = message;
  if (uploadError) {
    uploadError.style.display = 'block';
    setTimeout(() => {
      uploadError.style.display = 'none';
    }, 5000);
  }
}

// Get modal elements
const uploadModal = document.getElementById('uploadImageModal');
const uploadDropZone = document.getElementById('uploadDropZone');
const imageFileInput = document.getElementById('imageFileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadIcon = document.getElementById('uploadIcon');
const previewImage = document.getElementById('previewImage');
const previewFilename = document.getElementById('previewFilename');
const previewFilesize = document.getElementById('previewFilesize');
const uploadButton = document.getElementById('uploadButton');
const uploadProgress = document.getElementById('uploadProgress');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadSuccess = document.getElementById('uploadSuccess');
const uploadError = document.getElementById('uploadError');

// Reset upload modal when opened
if (uploadModal) {
  uploadModal.addEventListener('show.bs.modal', () => {
    resetUploadModal();
  });
}

// Handle file selection
function handleFileSelect(file) {
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showUploadError('Please select a valid image file (JPG, PNG, GIF, WEBP)');
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showUploadError('File size must be less than 5MB');
    return;
  }

  selectedFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewFilename.textContent = file.name;
    previewFilesize.textContent = `${(file.size / 1024).toFixed(2)} KB`;

    uploadIcon.style.display = 'none';
    uploadPreview.style.display = 'block';
    uploadButton.disabled = false;
  };
  reader.readAsDataURL(file);
}

// File input change event
if (imageFileInput) {
  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

// Drag and drop events
if (uploadDropZone) {
  uploadDropZone.addEventListener('click', () => {
    imageFileInput.click();
  });

  uploadDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropZone.style.borderColor = '#0d6efd';
    uploadDropZone.style.backgroundColor = '#f8f9fa';
  });

  uploadDropZone.addEventListener('dragleave', () => {
    uploadDropZone.style.borderColor = '#dee2e6';
    uploadDropZone.style.backgroundColor = 'transparent';
  });

  uploadDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropZone.style.borderColor = '#dee2e6';
    uploadDropZone.style.backgroundColor = 'transparent';

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });
}

// Upload button click
if (uploadButton) {
  uploadButton.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show progress
    uploadButton.disabled = true;
    uploadProgress.style.display = 'block';
    uploadSuccess.style.display = 'none';
    uploadError.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      uploadProgressBar.style.width = '100%';

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Show success
      uploadProgress.style.display = 'none';
      uploadSuccess.style.display = 'block';

      // Wait a moment then close modal and auto-fill form
      setTimeout(() => {
        // Close modal using Bootstrap's modal API
        const modalInstance = window.bootstrap.Modal.getInstance(uploadModal);
        if (modalInstance) {
          modalInstance.hide();
        }

        // Find first empty image URL field and auto-fill it
        const imageUrlInputs = document.querySelectorAll('input[name^="image_url_"]');
        let filled = false;

        imageUrlInputs.forEach((input) => {
          if (!filled && (!input.value || input.value.trim() === '')) {
            const inputField = input;
            inputField.value = data.path;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            filled = true;
          }
        });

        // If no empty field found, user can manually copy the path
        if (!filled) {
           
          alert(`Image uploaded! Path: ${data.path}\n\nAll image fields are filled. Add a new image field or replace an existing one.`);
        }
      }, 1500);
    } catch (error) {
      uploadProgress.style.display = 'none';
      showUploadError(error.message || 'Upload failed. Please try again.');
      uploadButton.disabled = false;
    }
  });
}
