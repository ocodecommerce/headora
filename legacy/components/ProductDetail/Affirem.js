// components/Affirm.js
import { useEffect } from 'react';

const Affirm = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn1.affirm.com/js/v2/affirm.js';
    script.async = true;
    script.onload = () => {
      // Initialize Affirm if needed
      if (window.Affirm) {
        // Example of initializing or configuring Affirm
        window.Affirm.init({
          public_api_key: 'NUINDJKZL37VWZYQ',
        });
      }
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component does not render anything
};

export default Affirm;
