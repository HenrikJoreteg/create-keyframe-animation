module.exports = function addUnit (item, unit) {
  if (typeof item === 'string') {
    return item
  }
  return item + unit
}
