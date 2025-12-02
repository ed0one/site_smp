import React from 'react';

const PlantCareIcon = ({ size = '24', className = '', color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plant stem */}
      <path
        d="M12 22V12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Main leaf */}
      <path
        d="M12 12C12 8 14.5 6 16 4C17 3 17.5 2 17.5 2C17.5 2 17.8 3.2 17 4.5C16.2 5.8 14 7 12 8V12Z"
        fill={color}
        opacity="0.8"
      />
      
      {/* Second leaf */}
      <path
        d="M12 10C12 7 9.5 5.5 8 4C7 3.2 6.5 2.5 6.5 2.5C6.5 2.5 6.2 3.5 7 4.5C7.8 5.5 10 6.5 12 8V10Z"
        fill={color}
        opacity="0.6"
      />
      
      {/* Care heart symbol */}
      <path
        d="M18 8C18 6.5 16.8 5 15.5 5C14.8 5 14.2 5.3 13.8 5.7C13.4 5.3 12.8 5 12.1 5C10.8 5 9.6 6.5 9.6 8C9.6 10.5 13.8 12.8 13.8 12.8S18 10.5 18 8Z"
        fill={color}
        opacity="0.9"
      />
      
      {/* Water droplets */}
      <circle cx="8" cy="16" r="1.2" fill={color} opacity="0.7" />
      <circle cx="10" cy="18" r="0.8" fill={color} opacity="0.5" />
      <circle cx="14" cy="17" r="1" fill={color} opacity="0.6" />
      
      {/* Soil/pot base */}
      <path
        d="M6 22H18V20C18 19.4 17.6 19 17 19H7C6.4 19 6 19.4 6 20V22Z"
        fill={color}
        opacity="0.3"
      />
    </svg>
  );
};

export default PlantCareIcon;