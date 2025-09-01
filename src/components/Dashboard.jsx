import { useState } from 'react';
// CORRECTED: Changed from a named import to a default import to match the export type.
import JobApplicationForm from './JobApplicationForm'; 

function Dashboard({ user, onLogout }) {
  // This state now tracks if we are showing the form or the main dashboard.
  const [isApplying, setIsApplying] = useState(false);

  // If the user is applying, render the form component.
  // We pass it an `onComplete` function so it can tell the dashboard when it's done.
  if (isApplying) {
    return <JobApplicationForm user={user} onComplete={() => setIsApplying(false)} />;
  }

  // This is the default main dashboard view.
  return (
    <div className="w-full max-w-3xl bg-slate-900/70 backdrop-blur-sm rounded-2xl border-2 border-slate-700 shadow-lg p-8 animate-fadeIn shadow-fuchsia-500/10">
      <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-fuchsia-400">User Dashboard</h2>
        <button 
          onClick={onLogout} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-all"
        >
          Disconnect
        </button>
      </div>

      <div className="text-left animate-fadeIn">
        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold text-fuchsia-400">Identity Matrix</h3>
          <p className="text-slate-400 mt-2 break-all">
            <strong>Net Address:</strong> {user.address}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-fuchsia-400">Professional Data</h3>
          <p className="text-slate-400 my-4">
            Your digital footprint is ready. Begin the application process to interface with new opportunities.
          </p>
          <div className="flex gap-4">
            {/* This button now switches the view to the application form */}
            <button 
              onClick={() => setIsApplying(true)} 
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg"
            >
              Start Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

