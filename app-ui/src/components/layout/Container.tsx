import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Container: React.FC<ContainerProps> = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`h-full flex flex-col ${className}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Container;
