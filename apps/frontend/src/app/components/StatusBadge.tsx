import React from 'react';
import { PhishingAttemptStatus } from '../models/phishing-attempt.model';

interface StatusBadgeProps {
  status: PhishingAttemptStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getClassName = () => {
    switch (status) {
      case 'NEW':
        return 'status-new';
      case 'SENT':
        return 'status-sent';
      case 'CLICKED':
        return 'status-clicked';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'NEW':
        return 'New';
      case 'SENT':
        return 'Sent';
      case 'CLICKED':
        return 'Clicked';
      default:
        return status;
    }
  };

  return <span className={getClassName()}>{getLabel()}</span>;
};

export default StatusBadge;
