import React from 'react';

/**
 * LoginInfo - Info-Text zur Datenspeicherung
 * 
 * Erklärt Cloud-Speicherung
 */
const LoginInfo = () => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-sm text-gray-600 text-center">
        Mit dem Login stimmst du zu, dass deine Einkaufsliste in der Cloud gespeichert wird
      </p>
    </div>
  );
};

export default LoginInfo;