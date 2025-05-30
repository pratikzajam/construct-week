import React from 'react';

const FormContainer = ({ children }) => {
  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      {children}
    </div>
  );
};

export default FormContainer;