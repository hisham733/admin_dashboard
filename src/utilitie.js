/** 
 * @param {object} user
 * @param {string} permission
 * @param {'response'} res
 * 
 * function used to authirze the customer
 */
function can(user, permission) {

  if (!user?.permissions?.includes(permission)) {
    throw new Error("Unauthorized");
  }

  return true;
}

module.exports = { can }; 