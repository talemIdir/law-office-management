import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const TrialBanner = () => {
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
    // Check access status every hour
    const interval = setInterval(checkAccess, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAccess = async () => {
    if (!ipcRenderer) return;

    try {
      const result = await ipcRenderer.invoke('license:checkAccess');
      setAccessInfo(result);
      setLoading(false);
    } catch (error) {
      console.error('Error checking access:', error);
      setLoading(false);
    }
  };

  if (loading || !accessInfo) {
    return null;
  }

  // Don't show banner if user has a full license
  if (accessInfo.accessType === 'license') {
    return null;
  }

  // Show trial status banner
  if (accessInfo.accessType === 'trial') {
    const { daysRemaining } = accessInfo;

    // Show warning colors when trial is expiring soon
    const isExpiringSoon = daysRemaining <= 3;
    const backgroundColor = isExpiringSoon ? '#fff3cd' : '#d1ecf1';
    const borderColor = isExpiringSoon ? '#ffc107' : '#17a2b8';
    const textColor = isExpiringSoon ? '#856404' : '#0c5460';

    return (
      <div style={{
        backgroundColor,
        borderBottom: `3px solid ${borderColor}`,
        padding: '12px 20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <span style={{ color: textColor, fontSize: '15px', fontWeight: '600' }}>
          {isExpiringSoon ? '⚠️' : 'ℹ️'}
          {' '}أنت تستخدم النسخة التجريبية - متبقي {daysRemaining}
          {daysRemaining === 1 ? ' يوم' : ' أيام'}
          {' '}
          {isExpiringSoon && '- قم بتفعيل الترخيص قريباً!'}
        </span>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
