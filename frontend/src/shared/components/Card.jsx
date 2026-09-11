import React from 'react';

export const Card = ({ children, hoverable = true, className = '', onClick, ...props }) => {
  return (
    <div
      className={`card-container ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </div>
  );
};
