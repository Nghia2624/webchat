import React from 'react';

const BellIcon = React.memo(({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 17H9M12 2V4M12 22C10.343 22 9 20.657 9 19H15C15 20.657 13.657 22 12 22ZM19 12C19 9.791 17.833 7.8537 16.0957 6.7533C15.7057 3.5467 13.6381 2 12 2C10.3619 2 8.29428 3.5467 7.9043 6.7533C6.16703 7.8537 5 9.791 5 12V15C5 16.1046 5.89543 17 7 17H17C18.1046 17 19 16.1046 19 15V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

BellIcon.displayName = 'BellIcon';

export default BellIcon; 