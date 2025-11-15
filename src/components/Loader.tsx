import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <svg
        width="60"
        height="60"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[var(--color-secondary)]"
      >
        <style>{`.spinner_z9k8{transform-origin:center;animation:spinner_St9l 1.2s infinite linear}@keyframes spinner_St9l{100%{transform:rotate(360deg)}}`}</style>
        <path
          fill="currentColor"
          d="M25,5A20,20,0,1,1,5,25,20,20,0,0,1,25,5 M25,2A23,23,0,1,0,48,25,23,23,0,0,0,25,2Z"
          opacity=".3"
        />
        <path
          fill="currentColor"
          d="M25,2 L25,8 A17,17 0 1 1 8,25 L2,25 A23,23 0 1 0 25,2"
          className="spinner_z9k8"
        >
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.8s"
                repeatCount="indefinite" />
        </path>
         <path
          fill="currentColor"
          d="M25,48 L25,42 A17,17 0 1 1 42,25 L48,25 A23,23 0 1 0 25,48"
          className="spinner_z9k8"
        >
             <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 25 25"
                to="0 25 25"
                dur="1.5s"
                repeatCount="indefinite" />
         </path>
      </svg>
    </div>
  );
};

export default Loader;