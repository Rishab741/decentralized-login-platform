// frontend/src/components/Dashboard.jsx
import { useState } from 'react';

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('main'); // 'main', 'create', or 'upload'

  const handleCreatePortfolio = (e) => {
    e.preventDefault();
    alert("Portfolio saved! (Simulated)");
    setView('main');
  };

  const handleUploadPortfolio = (e) => {
    e.preventDefault();
    const file = e.target.elements.portfolioFile.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded! (Simulated)`);
      setView('main');
    } else {
      alert("Please select a file to upload.");
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <div className="text-left animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-fuchsia-400">Create Your Digital CV</h3>
            <form onSubmit={handleCreatePortfolio} className="flex flex-col gap-4">
              <textarea 
                placeholder="Detail your cybernetic enhancements, neural interface skills, and past corporate espionage..." 
                rows="10"
                className="bg-slate-900 border-2 border-slate-700 text-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 w-full transition-all"
                required
              ></textarea>
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={() => setView('main')} className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_10px_rgba(100,116,139,0.5)]">Return</button>
                <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:-translate-y-0.5">Save Data</button>
              </div>
            </form>
          </div>
        );
      case 'upload':
        return (
          <div className="text-left animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-fuchsia-400">Upload Existing Data Slate</h3>
            <form onSubmit={handleUploadPortfolio} className="flex flex-col gap-4">
              <p className="text-slate-400">Upload a secure data file (.pdf, .doc).</p>
              <input 
                type="file" 
                name="portfolioFile" 
                accept=".pdf,.doc,.docx" 
                className="file:bg-fuchsia-600 file:hover:bg-fuchsia-500 file:border-none file:text-white file:font-bold file:py-2 file:px-4 file:rounded-lg file:cursor-pointer text-slate-400 transition-all"
                required 
              />
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={() => setView('main')} className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_10px_rgba(100,116,139,0.5)]">Return</button>
                <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:-translate-y-0.5">Upload</button>
              </div>
            </form>
          </div>
        );
      default:
        return (
          <div className="text-left animate-fadeIn">
            <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-fuchsia-400">Identity Matrix</h3>
              <p className="text-slate-400 mt-2 break-all"><strong>Net Address:</strong> {user.address}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-fuchsia-400">Professional Data</h3>
              <p className="text-slate-400 my-4">No data uploaded. Interface with the system to construct your digital footprint.</p>
              <div className="flex gap-4">
                <button onClick={() => setView('create')} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:-translate-y-0.5">Create New</button>
                <button onClick={() => setView('upload')} className="border-2 border-slate-600 hover:bg-slate-700 text-slate-300 font-medium py-2 px-5 rounded-lg transition-all transform hover:shadow-[0_0_10px_rgba(100,116,139,0.5)]">Upload Existing</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900/70 backdrop-blur-sm rounded-2xl border-2 border-slate-700 shadow-lg p-8 animate-fadeIn shadow-fuchsia-500/10">
      <div className="flex justify-between items-center border-b-2 border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-fuchsia-400">User Dashboard</h2>
        <button onClick={onLogout} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-all transform hover:shadow-[0_0_10px_rgba(100,116,139,0.5)]">Disconnect</button>
      </div>
      {renderContent()}
    </div>
  );
}

export default Dashboard;
