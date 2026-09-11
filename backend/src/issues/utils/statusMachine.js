export const ALLOWED_TRANSITIONS = {
  REPORTED: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'REJECTED_BY_WORKER'],
  VERIFIED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED_BY_WORKER'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED_BY_WORKER'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED_BY_WORKER'],
  RESOLVED: ['CITIZEN_VERIFICATION', 'CLOSED'],
  REJECTED_BY_WORKER: ['REPORTED', 'IN_PROGRESS', 'CLOSED'],
  CITIZEN_VERIFICATION: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS']
};

export const isValidTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

export const validateTransition = (currentStatus, nextStatus) => {
  if (!isValidTransition(currentStatus, nextStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${nextStatus}'.`);
  }
  return true;
};
