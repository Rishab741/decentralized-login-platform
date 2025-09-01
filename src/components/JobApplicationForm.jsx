import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// --- Helper: Field Component ---
function FieldInfo({ label, description }) {
  return (
    <>
      <label className="block text-sm font-medium text-fuchsia-300">{label}</label>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </>
  );
}

// --- API Simulation ---
const submitApplication = async (data) => {
  console.log('Submitting data to server:', data);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (data.personal.email.includes('fail')) {
    throw new Error('Submission failed: Invalid credentials.');
  }

  return { success: true, message: 'Application processed successfully!' };
};

// --- Main Application Form Component (Refactored with useState) ---
export default function JobApplicationForm({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: {
      fullName: '',
      email: user.address || '',
    },
    professional: {
      title: '',
    },
    uploads: {
      resume: null,
    },
  });
  const [errors, setErrors] = useState({});

  const { mutate, isPending, isError, isSuccess, error, data } = useMutation({
    mutationFn: submitApplication,
  });

  const steps = [
    { title: 'Personal Matrix' },
    { title: 'Professional Data' },
    { title: 'Data Slate Upload' },
    { title: 'Review & Transmit' },
  ];

  // --- Validation Logic ---
  const validateStep = (stepToValidate) => {
    const newErrors = {};
    switch (stepToValidate) {
      case 0:
        if (!formData.personal.fullName || formData.personal.fullName.length < 3) {
          newErrors.fullName = 'Full name is required (min. 3 characters).';
        }
        if (!formData.personal.email || !/\S+@\S+\.\S+/.test(formData.personal.email)) {
          newErrors.email = 'A valid email is required.';
        }
        break;
      case 1:
        if (!formData.professional.title || formData.professional.title.length < 2) {
          newErrors.title = 'A title is required.';
        }
        break;
      case 2:
        if (!formData.uploads.resume) {
          newErrors.resume = 'A file is required.';
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const [section, field] = name.split('.');

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === 'file' ? files[0] : value,
      },
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all previous steps before submitting
    if (validateStep(0) && validateStep(1) && validateStep(2)) {
      mutate(formData);
    } else {
        // If submission fails from the review screen, find the first step with an error and go to it
        for (let i = 0; i < 3; i++) {
            if (!validateStep(i)) {
                setStep(i);
                break;
            }
        }
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl text-center p-8">
        <h3 className="text-2xl font-bold text-green-400">Transmission Complete</h3>
        <p className="text-slate-300 mt-2">{data?.message}</p>
        <button onClick={onComplete} className="mt-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-slate-900/70 backdrop-blur-sm rounded-2xl border-2 border-slate-700 shadow-lg p-8 animate-fadeIn shadow-fuchsia-500/10">
      <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-fuchsia-400">Job Application</h2>
        <button onClick={onComplete} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg">
          Cancel
        </button>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between mb-1">
          {steps.map((s, i) => (
            <span key={s.title} className={`text-xs font-medium ${i <= step ? 'text-fuchsia-400' : 'text-slate-500'}`}>{s.title}</span>
          ))}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div className="bg-fuchsia-500 h-1.5 rounded-full" style={{ width: `${(step / (steps.length - 1)) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 0 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <FieldInfo label="Full Name" />
              <input name="personal.fullName" value={formData.personal.fullName} onChange={handleChange} className="form-input" />
              {errors.fullName && <p className="form-error">{errors.fullName}</p>}
            </div>
            <div>
              <FieldInfo label="Email Address" />
              <input type="email" name="personal.email" value={formData.personal.email} onChange={handleChange} className="form-input" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
           <div className="flex flex-col gap-6 animate-fadeIn">
            <div>
              <FieldInfo label="Current Designation" />
              <input name="professional.title" value={formData.professional.title} onChange={handleChange} className="form-input" />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div>
              <FieldInfo label="Upload Resume" description="PDF or DOCX files only." />
              <input type="file" name="uploads.resume" accept=".pdf,.docx" onChange={handleChange}
                className="file:bg-fuchsia-600 file:hover:bg-fuchsia-500 file:border-none file:text-white file:font-bold file:py-2 file:px-4 file:rounded-lg file:cursor-pointer text-slate-400"
              />
              {errors.resume && <p className="form-error">{errors.resume}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="animate-fadeIn">
                <h3 className="text-2xl font-bold mb-4 text-fuchsia-400">Review Your Data</h3>
                <div className="bg-slate-950/50 p-4 rounded-lg space-y-2 text-slate-300">
                   <p><strong>Name:</strong> {formData.personal.fullName}</p>
                   <p><strong>Email:</strong> {formData.personal.email}</p>
                   <p><strong>Title:</strong> {formData.professional.title}</p>
                   <p><strong>Resume:</strong> {formData.uploads.resume?.name || 'None'}</p>
                </div>
                {isError && <p className="form-error mt-4"><strong>Transmission Error:</strong> {error.message}</p>}
            </div>
        )}

        <div className="flex justify-between mt-8">
          <div>
            {step > 0 && (
              <button type="button" onClick={handlePrevStep} className="btn-secondary">Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 && (
              <button type="button" onClick={handleNextStep} className="btn-primary">
                {step === steps.length - 2 ? 'Review Application' : 'Next Step'}
              </button>
            )}
            {step === steps.length - 1 && (
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? 'Transmitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

