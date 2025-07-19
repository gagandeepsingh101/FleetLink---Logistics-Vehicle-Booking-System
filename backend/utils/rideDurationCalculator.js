function calculateRideDuration(fromPincode, toPincode) {
  const currentTime = new Date(Date.now());

  const distance = Math.abs(parseInt(fromPincode) - parseInt(toPincode)) / 1000; 
  let baseDurationHours = distance / 50; 

  const hour = currentTime.getUTCHours() + 5 + 30 / 60; 
  if (hour >= 9 && hour <= 18) {
    baseDurationHours *= 1.2; 
  }

  return Math.max(1, Math.round(baseDurationHours));
}

module.exports = { calculateRideDuration };