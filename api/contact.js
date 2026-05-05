<script>
  const consultationForm = document.getElementById('consultation-form');
  const serviceRequested = document.getElementById('service-requested');
  const secondaryLabel = document.getElementById('secondary-label');
  const secondarySelect = document.getElementById('secondary-select');
  const secondaryHelper = document.getElementById('secondary-helper');
  const reasonLabel = document.getElementById('reason-label');
  const reasonTextarea = document.getElementById('reason-textarea');
  const submitButton = document.getElementById('consultation-submit-btn');
  const availabilityNote = document.getElementById('service-availability-note');
  const formStatus = document.getElementById('form-status');

  function setOptions(options) {
    secondarySelect.innerHTML = '';

    options.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      secondarySelect.appendChild(option);
    });
  }

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = 'form-status visible ' + type;
  }

  function clearStatus() {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }

  function updateConsultationForm() {
    const value = serviceRequested.value;
    clearStatus();

    if (value === 'clinical-assessment') {
      secondaryLabel.textContent = 'Assessment Availability';
      setOptions([{ value: 'not-currently-available', label: 'Not currently available' }]);
      secondarySelect.disabled = true;
      secondaryHelper.textContent = 'Psychological assessment is not currently available for new requests.';
      reasonLabel.innerHTML = 'Reason for Seeking Assessment';
      reasonTextarea.placeholder = 'Assessment requests are not currently being accepted.';
      availabilityNote.textContent = 'Stonebridge is not currently accepting psychological assessment requests. If you are seeking psychotherapy, please select Psychotherapy above.';
      availabilityNote.classList.add('visible');
      submitButton.disabled = true;
    } else if (value === 'forensic-assessment') {
      secondaryLabel.textContent = 'Forensic Service Availability';
      setOptions([{ value: 'not-currently-available', label: 'Not currently available' }]);
      secondarySelect.disabled = true;
      secondaryHelper.textContent = 'Forensic services are not currently available for new requests.';
      reasonLabel.innerHTML = 'Reason for Seeking Forensic Services';
      reasonTextarea.placeholder = 'Forensic service requests are not currently being accepted.';
      availabilityNote.textContent = 'Stonebridge is not currently accepting forensic service requests. If you are seeking psychotherapy, please select Psychotherapy above.';
      availabilityNote.classList.add('visible');
      submitButton.disabled = true;
    } else {
      secondaryLabel.textContent = 'Psychotherapy Format';
      setOptions([{ value: 'telehealth-only', label: 'Telehealth only' }]);
      secondarySelect.disabled = false;
      secondaryHelper.textContent = 'Psychotherapy is currently offered via telehealth.';
      reasonLabel.innerHTML = 'Reason for Seeking Psychotherapy <span class="required">*</span>';
      reasonTextarea.placeholder = 'Please share a brief, general description of what brings you or your loved one to seek support. Please avoid detailed clinical, legal, or highly sensitive information.';
      availabilityNote.textContent = '';
      availabilityNote.classList.remove('visible');
      submitButton.disabled = false;
    }
  }

  serviceRequested.addEventListener('change', updateConsultationForm);

  consultationForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    clearStatus();

    if (serviceRequested.value !== 'psychotherapy') {
      showStatus('This service is not currently available for new requests.', 'error');
      return;
    }

    if (!consultationForm.checkValidity()) {
      consultationForm.reportValidity();
      return;
    }

    const formData = new FormData(consultationForm);

    const fullName = String(formData.get('full_name') || '').trim();
    const patientName = String(formData.get('patient_name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const service = String(formData.get('service_requested') || 'psychotherapy').trim();
    const secondaryDetail = String(formData.get('secondary_detail') || '').trim();
    const insuranceInfo = String(formData.get('insurance_info') || '').trim();
    const reason = String(formData.get('reason') || '').trim();
    const website = String(formData.get('website') || '').trim();

    const payload = {
      // Current Stonebridge contact form fields
      service_requested: service,
      secondary_detail: secondaryDetail,
      full_name: fullName,
      patient_name: patientName,
      email: email,
      insurance_info: insuranceInfo,
      reason: reason,
      website: website,

      // Compatibility fields for older /api/contact.js versions
      name: fullName,
      service: service,
      message: reason,
      phone: '',
      subject: 'Stonebridge consultation request',

      // Human-readable fallback summary
      details:
        'Service requested: ' + service + '\n' +
        'Format/detail: ' + secondaryDetail + '\n' +
        'Full name: ' + fullName + '\n' +
        'Proposed patient name: ' + patientName + '\n' +
        'Email: ' + email + '\n' +
        'Insurance/payment: ' + insuranceInfo + '\n\n' +
        'Reason:\n' + reason
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || result.message || 'The form could not be sent.');
      }

      consultationForm.reset();
      updateConsultationForm();

      showStatus(
        'Thank you. Your inquiry has been received. If your request appears appropriate for Stonebridge, we will follow up by email.',
        'success'
      );
    } catch (error) {
      console.error('Contact form error:', error);

      showStatus(
        error.message || 'The form could not be sent. Please email info@stonebridgepsychgroup.com or call (773) 417-1688.',
        'error'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Consultation Request';
    }
  });

  updateConsultationForm();
</script>
