// frontend/src/App.jsx
import { useState, useEffect } from 'react';

import { ethers } from 'ethers';
import Dashboard from './components/Dashboard'; // Import the Dashboard component

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', or ''
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define message colors based on type
  const messageClasses = {
    success: 'text-cyan-400',
    error: 'text-red-500',
    '': 'text-slate-400',
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/profile', {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserProfile(data.user);
          setAccount(data.user.address);
        }
      } catch (error) {
        console.error("Could not check session", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          if (isLoggedIn) {
            handleLogout();
            setMessage("Account changed. Please log in again.");
            setMessageType('error');
          } else {
            setAccount(accounts[0]);
            setMessage(`Connected to new account: ${accounts[0]}`);
            setMessageType('');
          }
        } else {
          handleLogout();
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isLoggedIn]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);

        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
        
        setMessage(`Connected as: ${connectedAccount}`);
        setMessageType('');
        return { signer: web3Signer, account: connectedAccount };
      } catch (error) {
        setMessage('Failed to connect wallet. User may have rejected the request.');
        setMessageType('error');
        return { signer: null, account: null };
      }
    } else {
      setMessage('MetaMask is not installed. Please install it to use this app.');
      setMessageType('error');
      return { signer: null, account: null };
    }
  };

  const handleLogin = async () => {
    let currentSigner = signer;
    let currentAccount = account;

    if (!currentSigner || !currentAccount) {
      const connection = await connectWallet();
      if (!connection.signer) return;
      currentSigner = connection.signer;
      currentAccount = connection.account;
    }

    try {
      setMessage('Requesting signature...');
      setMessageType('');
      const response = await fetch(`http://localhost:3001/login-challenge?address=${currentAccount}`);
      const data = await response.json();
      const messageToSign = data.message;

      if (!messageToSign) {
        setMessage('Could not get login challenge from server.');
        setMessageType('error');
        return;
      }

      setMessage('Awaiting signature in wallet...');
      const signature = await currentSigner.signMessage(messageToSign);

      setMessage('Verifying credentials...');
      const verifyResponse = await fetch('http://localhost:3001/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address: currentAccount, signature: signature }),
      });
      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setMessage('✅ Access Granted!');
        setMessageType('success');
        setIsLoggedIn(true);
        setUserProfile({ address: currentAccount });
      } else {
        setMessage(`❌ Verification Failed: ${verifyData.message}`);
        setMessageType('error');
        setIsLoggedIn(false);
      }
    } catch (error) {
      if (error.code === 4001) {
        setMessage('Signature request rejected.');
      } else {
        setMessage('An error occurred during login.');
      }
      setMessageType('error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsLoggedIn(false);
    setUserProfile(null);
    setAccount(null);
    setSigner(null);
    setMessage('You have been disconnected.');
    setMessageType('');
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white">
        <h1 className="text-2xl font-bold">Initializing System...</h1>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-white font-sans">
      <header className="w-full flex flex-col items-center">
        
        {isLoggedIn && userProfile ? (
          <Dashboard user={userProfile} onLogout={handleLogout} />
        ) : (
          <div className="bg-slate-900/70 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border-2 border-slate-700 w-full max-w-md flex flex-col gap-6 shadow-lg animate-fadeIn shadow-fuchsia-500/10">
            <h1 className="text-4xl font-bold text-fuchsia-400 text-center">DECENTRALIZED</h1>
            <h2 className="text-2xl font-semibold text-center -mt-4 text-slate-300">Job Platform</h2>
            
            {!account ? (
              <button onClick={connectWallet} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:-translate-y-0.5 w-full">Connect Wallet</button>
            ) : (
              <button onClick={handleLogin} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:shadow-[0_0_15px_rgba(192,38,211,0.5)] hover:-translate-y-0.5 w-full">Login</button>
            )}
            <p className={`text-sm min-h-[20px] text-center ${messageClasses[messageType]}`}>{message}</p>
            {account && <p className="text-xs text-slate-400 break-all bg-slate-900 p-3 rounded-md border border-slate-700">Wallet: {account}</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
